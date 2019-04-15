# 文件下载服务

import asyncio
import aiohttp
import config
import os
import re
import pathlib
from urllib.parse import urlparse

# 等待的URL
watting_url = []
seen_urls = []

stopping = True

# 控制并发
sem = asyncio.Semaphore(5)

CHUNK_SIZE = 8 * 1024  # 4 KB

home_dir = os.environ['HOME']

"""获取URL本地下载路径"""


def get_file_name(url):
    return os.path.basename(url)


def get_downloadfile_localpath(url, base=None):
    # 获取域名作为文件夹名称
    parsed_uri = urlparse(url)
    base_dir = parsed_uri.netloc
    if base:
        base_dir = base
    dir = '{home_dir}/photo/{base_dir}/'.format(
        base_dir=base_dir, home_dir=home_dir)
    # 识别目录是否存在
    if not pathlib.Path(dir).exists():
        os.makedirs(dir, exist_ok=True)
    file_name = get_file_name(url)
    file_path = dir + file_name
    return file_path


async def download_file(task, session):
    async with sem:
        try:
            url = task.get('url')
            base = task.get('base')
            # 伪装IP
            file_path = get_downloadfile_localpath(url, base)
            # 判断是否有文件名，没有文件名则可能为重定向下载
            if not pathlib.Path(file_path).exists():
                print(
                    'download: {url} -> {file_path}'.format(url=url, file_path=file_path))
                async with session.get(url, headers=config.request_header(), proxy=config.proxy, allow_redirects=False) as response:
                    if response.status in [303]:
                        real_url = response.headers['Location']
                        print('redirect download: {}'.format(real_url))
                        asyncio.ensure_future(download_file({'url': real_url, 'base': base}, session))
                    elif response.status in [200, 201]:
                        with open(file_path, 'wb') as outfile:
                            while True:
                                chunk = await response.content.read(CHUNK_SIZE)
                                outfile.write(chunk)
                                if not chunk:
                                    print('download end {}'.format(file_path))
                                    break
            else:
                print('file exsits: {}'.format(file_path))
        except Exception as e:
            print('error', e)

"""批量下载"""


async def download_multiple():

    async with aiohttp.ClientSession() as session:
        while not stopping:
            if len(watting_url) == 0:
                await asyncio.sleep(5)  # 暂时无处理的URL则休眠5秒
                continue
            else:
                task = watting_url.pop()
                asyncio.ensure_future(download_file(task, session))


def init(loop):
    loop.create_task(download_multiple())

""" add download task
    ------------
    :param url: string
    :param baser_dir: string download dir
"""
def add(url, base_dir=None):
    watting_url.append({'url':url, 'base': base_dir})
