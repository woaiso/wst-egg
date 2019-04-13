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

stopping = False

# 控制并发
sem = asyncio.Semaphore(5)

CHUNK_SIZE = 8 * 1024  # 4 KB

home_dir = os.environ['HOME']

"""获取URL本地下载路径"""


def get_file_name(url):
    return os.path.basename(url)


def get_downloadfile_localpath(url):
    # 获取域名作为文件夹名称
    parsed_uri = urlparse(url)
    dir = '{home_dir}/photo/{uri.netloc}/'.format(
        uri=parsed_uri, home_dir=home_dir)
    # 识别目录是否存在
    if not pathlib.Path(dir).exists():
        os.makedirs(dir, exist_ok=True)
    file_name = get_file_name(url)
    file_path = dir + file_name
    return file_path


async def download_file(url, session):
    async with sem:
        try:
            # 伪装IP
            file_path = get_downloadfile_localpath(url)
            # 判断是否有文件名，没有文件名则可能为重定向下载
            if not pathlib.Path(file_path).exists():
                print(
                    'download: {url} -> {file_path}'.format(url=url, file_path=file_path))
                async with session.get(url, headers=config.request_header(), proxy=config.proxy, allow_redirects=False) as response:
                    if response.status in [303]:
                        real_url = response.headers['Location']
                        print('redirect download: {}'.format(real_url))
                        asyncio.ensure_future(download_file(real_url, session))
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
                source_url = watting_url.pop()
                asyncio.ensure_future(download_file(source_url, session))


def init(loop):
    loop.create_task(download_multiple())


def add(url):
    watting_url.append(url)


if __name__ == '__main__':
    add('https://twitter-tbr3w666.tumblr.com/video_file/t:A4UZIomQA9P3ULyK_5oIMg/184134989696/tumblr_oynmrrkmFs1wuw0ld/480')
    loop = asyncio.get_event_loop()
    init(loop)
    loop.run_forever()
