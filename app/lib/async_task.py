#!/usr/bin/python3
# 用于处理抓取任务，支持外部添加任务，支持控制并发
# encoding=utf-8

import asyncio
import aiohttp
import os
import re
import random
import download
import config
from pyquery import PyQuery
from urllib.parse import urljoin, urlparse
from time import gmtime, strftime
import blog
import page_cache

# 并发控制3
semaphore = asyncio.Semaphore(5)
# 标记状态
stopping = False
start_url = os.environ.get('SEED_URL')
list_urls = []
article_urls = []
seen_urls = set()

SLEEP_DURATION = 3e-2  # 200ms


async def fetch(url, session):
    async with semaphore:
        try:
            # 判断缓存内是否有内容，如果有直接返回
            if page_cache.check_exists(url):
                print('use cache : {}'.format(url))
                return page_cache.get(url)
            else:
                await asyncio.sleep(SLEEP_DURATION)  # 处理一次等待一定时间
                print('fetch url: {}'.format(url))
                async with session.get(url, headers=config.request_header(), proxy=config.proxy) as response:
                    if response.status in [200, 201]:
                        data = await response.text()
                        headers = {
                            'Content-Type': response.headers.get('Content-Type')
                        }
                        result = {'data': data, 'headers': headers}
                        page_cache.set(url, result)
                        return result
                    else:
                        page_cache.set(url, None)
                        return None
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
            if re.search(r'(\/forumdisplay[\s\S]+page=\d+|(\/forum-\d+-\d+))', url):
                urls.append(url)
                list_urls.append(url)
            # 文章页, 仅请求第一页
            elif re.search(r'(\/htm_data|(\/viewthread[\s\S]+\&extra\=page\%3D\d+$)|(\/thread-\d+-1-1))', url):
                urls.append(url)
                article_urls.append(url)
    return urls

# 初始化解析


async def init_urls(url, session):
    seen_urls.add(url)
    result = await fetch(url, session)
    extract_urls(url, result.data)

# 解析文章


async def article_handle(url, session):
    seen_urls.add(url)
    result = await fetch(url, session)
    if result:
        # 判断响应类型，使用不同的parser
        content_type = result.get('headers').get('Content-Type')
        if content_type.find('text/html') > -1:
            return html_parser(url, result.get('data'))
        elif content_type.find('text/xml') > -1:
            return xml_parser(url, result.get('data'))


def xml_parser(base_url, xml):
    blog.parser(base_url, xml)


def html_parser(base_url, html):
    extract_urls(base_url, html)
    if not html:
        print('document none {}'.format(base_url))
        return
    pq = PyQuery(html)

    document_title = pq('title').text()

    # 开始解析文章数据
    description = pq('meta[name=description]').attr('content')
    title = pq('a#thread_subject, #threadtitle>h1').text()
    view = pq('.pls .hm span:eq(1)').text()
    reply = pq('.pls .hm span:eq(4)').text()
    post_at = pq('em[id^=authorposton]:eq(0)').text().replace('发表于 ', '')
    post_id = pq('#postlist>div:eq(0)').attr('id').replace('post_', '')
    # 解析图片
    images = []
    for img in pq('table#pid'+post_id+' .pcb img,.postmessage.firstpost img'):
        src = PyQuery(img).attr('src')
        full_photo_url = urljoin(base_url, src)
        images.append(full_photo_url)
        download.add(full_photo_url)

    # 解析作者相关信息
    author_link = pq('.authi:eq(0) > a').attr('href')
    author_id = -1
    if author_link:
        author_id = re.search(r'space-uid-(\d+)\.html', author_link).group(1)
    author_name = pq('.authi:eq(0) > a').text()

    print('extract url: {}'.format(base_url))
    print(title, view, reply, author_id, author_name, post_at)


async def consumer():
    async with aiohttp.ClientSession() as session:
        while not stopping:
            # 识别列表队列和文章队列是否还有内容
            if len(article_urls) == 0 and len(list_urls) == 0:
                await asyncio.sleep(1)  # 无处理的URL时等待1秒钟
                continue
            # 增加优先策略 优先处理文章URL，文章无再处理列表url
            if len(article_urls) > 0:
                url = article_urls.pop()
                if url not in seen_urls:
                    asyncio.ensure_future(article_handle(url, session))
            elif len(list_urls) > 0:
                url = list_urls.pop()
                if url not in seen_urls:
                    asyncio.ensure_future(init_urls(url, session))

def add_article(url):
    article_urls.append(url)


def init():
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(consumer())
    download.init(loop)
    loop.run_forever()
    

if __name__ == '__main__':
    try:
        init()
    except KeyboardInterrupt:
        pass
