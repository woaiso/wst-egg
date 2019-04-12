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


def get_downloadfile_localpath(url):
    # 获取域名作为文件夹名称
    parsed_uri = urlparse(url)
    dir = '{home_dir}/photo/{uri.netloc}/'.format(uri=parsed_uri, home_dir=home_dir)
    # 识别目录是否存在
    if not pathlib.Path(dir).exists():
        os.makedirs(dir, exist_ok=True)
    file_name = os.path.basename(url)
    file_path = dir + '/' + file_name
    return file_path


async def download_file(url, session):
    async with sem:
        try:
            # 伪装IP
            file_path = get_downloadfile_localpath(url)
            print('download: {url} -> {file_path}'.format(url=url, file_path=file_path))
            if not pathlib.Path(file_path).exists():
                async with session.get(url, headers=config.request_header(), proxy=config.proxy) as response:
                    if response.status in [200, 201]:
                        with open(file_path, 'wb') as outfile:
                            while True:
                                chunk = await response.content.read(CHUNK_SIZE)
                                outfile.write(chunk)
                                if not chunk:
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
    add('http://www.chdmv.com/data/attachment/forum/201706/25/212247ykjdkbzbaikkgdez.jpg')
    add('http://www.chdmv.com/data/attachment/forum/201706/28/211758wdfdxddadv8kc426.jpg')
    loop = asyncio.get_event_loop()
    init(loop)
    loop.run_forever()
    