# Python 学习（python3）
# coding=utf-8
import os
import re
import pathlib
import math
import asyncio
import xml.etree.cElementTree as ET
import urllib.request

home_dir = os.environ['HOME']

class Blog:
    '这是一个博客数据收集脚本'
    __pageSize = 50

    downloads = []

    blogName = ''

    async def init(self, url):
        print('fetch:', url)
        # 第一次请求获取总文章数量，用于计算请求次数
        doc = await self.fetch(url)
        total = int(doc.find('posts').get('total'))
        print('total posts:', total)
        # 计算出总页数
        pages = math.ceil(float(total)/self._Blog__pageSize)
        page = 1
        while(page < pages):
            url = url + '&start=' + str(page*self._Blog__pageSize)
            await self.fetch(url)
            page += 1

    @asyncio.coroutine
    async def fetch(self, url):
        # 第一次请求获取总文章数量，用于计算请求次数
        with urllib.request.urlopen(url) as url:
            s = url.read()
        doc = ET.fromstring(s)
        self.extrac(doc)
        self.download()
        return doc

    def extrac(self, doc):
        self.extracBlog(doc.find('tumblelog'))
        print('fetch:', len(doc.findall('posts/post')))
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
                1==1
        elif type == 'photo':  # 照片类
            desc = item.find('photo-caption')
            if desc is not None:
                # print(desc.text)
                1==1
            # 识别是否有多张图片
            photoset = item.find('photoset')
            if photoset:
                # 多张图片处理逻辑
                for photo in photoset.iterfind('photo'):
                    photo_url = photo.find('photo-url').text
                    self.downloads.append(photo_url)
            else:
                # 单张图片处理逻辑
                photo_url = item.find('photo-url').text
                self.downloads.append(photo_url)
        elif type == 'video':
            videostr = item.find('video-player').text
            result = re.search(
                r'poster=\'(.*?)\'[\s\S]+duration\":(\d+)[\s\S]+source\ssrc=\"(.*?)\"', videostr, re.M | re.I)
            if result:
                print(result.group(1), result.group(2), result.group(3))
            else:
                print('no match!')

    def download(self):
        if len(self.downloads) > 0:
            while(len(self.downloads) > 0):
                try:
                    download_url = self.downloads.pop()
                    dir = home_dir+'/photo/' + self.blogName
                    if not pathlib.Path(dir).exists():
                        os.makedirs(dir)
                    lpth = dir + '/' + os.path.basename(download_url)
                    if not pathlib.Path(lpth).exists():
                        print('download:', download_url, 'to:', lpth)
                        with urllib.request.urlopen(download_url) as web:
                            with open(lpth, 'wb') as outfile:
                                outfile.write(web.read())
                    else:
                        print('file exsist ', lpth)
                except:
                    print('error')
                else:
                    1==1


loop = asyncio.get_event_loop()
loop.run_until_complete(Blog().init(os.environ.get('EXAMPLE_URL')))


