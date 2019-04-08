#!/usr/bin/python3
# 异步编程学习
# encoding=utf-8

import asyncio
import aiohttp
import os
import re
from pyquery import PyQuery
from urllib.parse import urljoin
from urllib.parse import urlparse

# 并发控制3
sem = asyncio.Semaphore(3)
# 标记状态
stopping = False
start_url = os.environ.get('SEED_URL')
watting_urls = []
seen_urls = set()

headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
}

async def fetch(url, session):
    print('fetch url:{}'.format(url))
    async with sem:
        try:
            async with session.get(url, headers=headers) as response:
                # for key in response.headers:
                #     print(key, ':',response.headers[key])
                if response.status in [200, 201]:
                    data = await response.text()
                    return data
        except Exception as e:
            print('error：', e)

# 解析出所有链接


def extract_urls(source_url, html):
    urls = []
    if not html:
        print('document none {}'.format(source_url))
        return
    pq = PyQuery(html)
    for link in pq.items('a'):
        href = link.attr('href')
        url = urljoin(source_url, href)
        parsed_uri = urlparse(url)
        pattern = re.compile(
            '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_uri))
        if url and pattern.search(url) and url not in seen_urls: # 仅请求本站链接
            # 仅请求列表页和文章页
            if re.search(r'(forumdisplay|thread|html_data)', url):
                urls.append(url)
                watting_urls.append(url)
    return urls

# 初始化解析


async def init_urls(url, session):
    html = await fetch(url, session)
    seen_urls.add(url)
    extract_urls(url, html)

# 解析文章


async def article_handle(url, session, pool):
    html = await fetch(url, session)
    seen_urls.add(url)
    extract_urls(url, html)
    if not html:
        print('document none {}'.format(url))
        return
    pq = PyQuery(html)
    title = pq('title').text()
    print(title)


async def consumer(pool):
    async with aiohttp.ClientSession() as session:
        while not stopping:
            await asyncio.sleep(5) # 处理一次等待五秒
            if len(watting_urls) == 0:
                await asyncio.sleep(1)  # 无处理的URL时等待1秒钟
                continue
            url = watting_urls.pop()
            if url not in seen_urls:
                if re.search(r'thread', url):
                    asyncio.ensure_future(article_handle(url, session, pool))
                else:
                    asyncio.ensure_future(init_urls(url, session))


async def main(loop):
    async with aiohttp.ClientSession() as session:
        html = await fetch(start_url, session)
        seen_urls.add(start_url)
        extract_urls(start_url, html)
    asyncio.ensure_future(consumer(loop))

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(main(loop))
    loop.run_forever()
