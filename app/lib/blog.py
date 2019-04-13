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
from urllib.parse import urlparse
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

    def extrac(self, base_url, doc):
        self.extracBlog(base_url, doc.find('tumblelog'))
        for item in doc.iterfind('posts/post'):
            self.extracItem(base_url,item)

    def extracBlog(self, base_url, blog):
        self.blogName = blog.get('name')
        print(blog.get('name'), blog.get('timezone'), blog.get('title'))

    def extracItem(self, base_url, item):
        parsed_uri = urlparse(base_url)
        domain = parsed_uri.netloc
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
                    download.add(photo_url, domain)
            else:
                # 单张图片处理逻辑
                photo_url = item.find('photo-url').text
                download.add(photo_url, domain)
        elif type == 'video':
            videostr = item.find('video-player').text
            result = re.search(
                r'poster=\'(.*?)\'[\s\S]+duration\":(\d+)[\s\S]+source\ssrc=\"(.*?)\"', videostr, re.M | re.I)
            if result:
                video_source = result.group(3)
                if video_source:
                    # 获取真实文件地址
                    download.add(video_source, domain)
                print(result.group(1), result.group(2), result.group(3))
            else:
                print('no match!')

blog = Blog()

def parser(base_url, xml):
    doc = ET.fromstring(xml)
    blog.extrac(base_url, doc)
