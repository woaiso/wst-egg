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
list_urls = []
article_urls = []
seen_urls = set()

SLEEP_DURATION = 3e-2  #500ms


class Job:
    weight = 1  # 权重，数字越大越优先执行
    url = None
    def __init__(self, weight, url):
          self.weight = weight
          self.url = url

headers = {
    'user-agent': 'Googlebot'
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
        if url and pattern.search(url) and url not in seen_urls:  # 仅请求本站链接
            # 仅请求列表页和文章页
            # 列表页
            if re.search(r'(\/forumdisplay|(\/forum-\d+-\d+))', url):
                urls.append(url)
                list_urls.append(url)
            # 文章页, 仅请求第一页
            elif re.search(r'(\/htm_data|(\/thread-\d+-1-1))', url):
                urls.append(url)
                article_urls.append(url)
    return urls

# 初始化解析


async def init_urls(url, session):
    seen_urls.add(url)
    html = await fetch(url, session)
    extract_urls(url, html)

# 解析文章


async def article_handle(url, session, pool):
    seen_urls.add(url)
    html = await fetch(url, session)
    extract_urls(url, html)
    if not html:
        print('document none {}'.format(url))
        return
    pq = PyQuery(html)

    # 开始解析文章数据
    title = pq('meta[name=description]').attr('content')
    print(title)


async def consumer(pool):
    async with aiohttp.ClientSession() as session:
        while not stopping:
            await asyncio.sleep(SLEEP_DURATION)  # 处理一次等待一定时间
            # 识别列表队列和文章队列是否还有内容
            if len(article_urls) == 0 and len(list_urls) == 0:
                await asyncio.sleep(1)  # 无处理的URL时等待1秒钟
                continue
            # 增加优先策略 优先处理文章URL，文章无再处理列表url
            if len(article_urls) > 0:
                url = article_urls.pop()
            elif len(list_urls) > 0:
                url = list_urls.pop()
            if url not in seen_urls:
                if re.search(r'((\/htm_data[\s\S]+\.html)|(\/thread-\d+-\d+-\d+))', url):
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
