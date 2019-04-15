
#!/usr/local/bin/python3
# -*-coding:utf-8-*-

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

from .. import add_download_task

# 博客数据解析器


class BlogParser(BaseParser):
    blog_name = None  # 博客名称
    total_count = 0  # 博文总数量

    """
        博客数据解析器
        
        :param base_url: string xml address
        :param xml     : string xml content data
    """

    def __init__(self, base_url, xml):
        # 去除特殊字符，避免编译出错
        xml = re.sub(u"[\x00-\x08\x0b-\x0c\x0e-\x1f]+", u"", xml)
        doc = ET.fromstring(xml)
        self.extrac(base_url, doc)

    """
        解析数据

        :param base_url: string xml address
        :param doc     : ElementTree dom tree
    """

    def extrac(self, base_url, doc):
        self.extracBlog(base_url, doc)
        for item in doc.iterfind('posts/post'):
            self.extracItem(base_url, item)

    """
        获取博客基础信息
        :param base_url: string xml address
        :param doc     : ElementTree dom tree
    """

    def extracBlog(self, base_url, doc):
        blog = doc.find('tumblelog')
        posts = doc.find('posts')
        self.total_count = posts.get('total')
        self.blog_name = blog.get('name')
        print(self.blog_name, blog.get('title'),
              'total_count', self.total_count)

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
            desc_text = ''
            if desc_ele is not None:
                desc_text = desc_ele.text
            photo_list = extract_photo(item, domain)
            print(post_url, desc_text, len(photo_list))
        elif type == 'video':
            videostr = item.find('video-player').text
            try:
                result = re.search(
                    r'poster=\'(.*?)\'[\s\S]+duration\":(\d+)[\s\S]+source\ssrc=\"(.*?)\"', videostr, re.M | re.I)
                if result:
                    video_source = result.group(3)
                    if video_source:
                        # 获取真实文件地址
                        add_download_task(video_source, domain)
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
            add_download_task(photo_url, domain)
    else:
        # 单张图片处理逻辑
        photo_url = post.find('photo-url').text
        photo_list.append(photo_url)
        add_download_task(photo_url, domain)
    return photo_list
