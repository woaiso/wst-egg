# Python 学习（python3）
# coding=utf-8
import os
import re
import pathlib
import math
import asyncio
import aiohttp
import xml.etree.cElementTree as ET
import urllib.request
import download
import config

home_dir = os.environ['HOME']

# 并发控制3
semaphore = asyncio.Semaphore(3)


class Blog:
    '这是一个博客数据收集脚本'
    __pageSize = 50

    downloads = []

    blogName = ''

    async def init(self, url):
        async with aiohttp.ClientSession() as session:
            # 第一次请求获取总文章数量，用于计算请求次数
            doc = await self.fetch(url, session)
            total = int(doc.find('posts').get('total'))
            print('total posts:', total)
            # 计算出总页数
            pages = math.ceil(float(total)/self._Blog__pageSize)
            page = 1
            while page < pages and page < 10:
                source = url + '&start=' + str(page*self._Blog__pageSize)
                print('fetch:', str(page*self._Blog__pageSize), '-',
                    str((page+1)*self._Blog__pageSize), 'of ', total, source)
                page += 1
                await self.fetch(source, session)
                

    async def fetch(self, url, session):
        async with semaphore:
            try:
                print('fetch url: {}'.format(url))
                async with session.get(url, headers=config.request_header(), proxy=config.proxy) as response:
                    if response.status in [200, 201]:
                        data = await response.text()
                        doc = ET.fromstring(data)
                        self.extrac(doc)
                        return doc
            except Exception as e:
                print('error：', e)
    def extrac(self, doc):
        self.extracBlog(doc.find('tumblelog'))
        for item in doc.iterfind('posts/post'):
            self.extracItem(item)

    def extracBlog(self, blog):
        self.blogName = blog.get('name')
        print(blog.get('name'), blog.get('timezone'), blog.get('title'))

    def extracItem(self, item):
        type = item.get('type')
        if type == 'regular':  # 普通文本
            body = item.find('regular-body')
            if body:
                # print(body.text)
                1 == 1
        elif type == 'photo':  # 照片类
            desc = item.find('photo-caption')
            if desc is not None:
                # print(desc.text)
                1 == 1
            # 识别是否有多张图片
            photoset = item.find('photoset')
            if photoset:
                # 多张图片处理逻辑
                for photo in photoset.iterfind('photo'):
                    photo_url = photo.find('photo-url').text
                    download.add(photo_url)
                    # self.downloads.append(photo_url)
            else:
                # 单张图片处理逻辑
                photo_url = item.find('photo-url').text
                download.add(photo_url)
                # self.downloads.append(photo_url)
        elif type == 'video':
            videostr = item.find('video-player').text
            result = re.search(
                r'poster=\'(.*?)\'[\s\S]+duration\":(\d+)[\s\S]+source\ssrc=\"(.*?)\"', videostr, re.M | re.I)
            if result:
                video_source = result.group(3)
                if video_source:
                    # 获取真实文件地址
                    download.add(video_source)
                    # self.downloads.append(self.getRealVideoUrl(video_source))
                print(result.group(1), result.group(2), result.group(3))
            else:
                print('no match!')

blog = Blog()

def parser(base_url, xml):
    doc = ET.fromstring(xml)
    blog.extrac(doc)

if __name__ == '__main__':
    try:
        loop = asyncio.get_event_loop()
        download.init(loop)
        asyncio.ensure_future(Blog().init(os.environ.get('EXAMPLE_URL') + 'api/read?num=50'))
        loop.run_forever()
    except KeyboardInterrupt:
        pass
