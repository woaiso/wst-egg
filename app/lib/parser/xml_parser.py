
#!/usr/bin/python3
# coding=utf-8
# XML 解析器，用于处理xml类型的数据

import aiohttp
import asyncio
import math
import os
import pathlib

import re
import urllib.request
import xml.etree.cElementTree as ET
from urllib.parse import urlparse

from .base import BaseParser

import config
from app.lib.download import * as download

# import tapi

home_dir = os.environ['HOME']

# 并发控制3
semaphore = asyncio.Semaphore(3)


class Blog(BaseParser):
    '这是一个博客数据收集脚本'

    def extrac(self, base_url, doc):
        self.extracBlog(base_url, doc)
        for item in doc.iterfind('posts/post'):
            self.extracItem(base_url, item)

    def extracBlog(self, base_url, doc):
        blog = doc.find('tumblelog')
        posts = doc.find('posts')
        total_count = posts.get('total')
        name = blog.get('name')
        print(blog.get('name'), blog.get('title'), 'total_count', total_count)

    def extracItem(self, base_url, item):
        parsed_uri = urlparse(base_url)
        domain = parsed_uri.netloc
        post_url = item.get('url')
        type = item.get('type')
        if type == 'regular':  # 普通文本
            body = item.find('regular-body')
            if body:
                # print(body.text)
                pass
        elif type == 'photo':  # 照片类
            desc_ele = item.find('photo-caption')
            desc_text =''
            if desc_ele is not None:
                desc_text = desc_ele.text
            photo_list = extract_photo(item, domain)
        elif type == 'video':
            videostr = item.find('video-player').text
            try:
                result = re.search(
                    r'poster=\'(.*?)\'[\s\S]+duration\":(\d+)[\s\S]+source\ssrc=\"(.*?)\"', videostr, re.M | re.I)
                if result:
                    video_source = result.group(3)
                    if video_source:
                        # 获取真实文件地址
                        download.add(video_source, domain)
                        pass
                    # print(result.group(1), result.group(2), result.group(3))
            except TypeError:
                pass


def extract_photo(post, domain):
    # 识别是否有多张图片
    photoset = post.find('photoset')
    photo_list = []
    if photoset:
                # 多张图片处理逻辑
        for photo in photoset.iterfind('photo'):
            photo_url = photo.find('photo-url').text
            photo_list.append(photo_url)
            download.add(photo_url, domain)
    else:
        # 单张图片处理逻辑
        photo_url = post.find('photo-url').text
        photo_list.append(photo_url)
        download.add(photo_url, domain)
    return photo_list


blog = Blog()


def parser(base_url, xml):
    xml = re.sub(u"[\x00-\x08\x0b-\x0c\x0e-\x1f]+", u"", xml)
    doc = ET.fromstring(xml)
    blog.extrac(base_url, doc)
