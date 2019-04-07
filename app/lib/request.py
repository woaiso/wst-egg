# Python 学习（python3）
# coding=utf-8
import os
import re
import pathlib
import asyncio
import xml.etree.cElementTree as ET
import urllib.request


class Blog:
    '这是一个博客数据收集脚本'
    __pageSize = 50

    downloads = []

    def fetch(self, url):
        print('fetch:', url)
        with urllib.request.urlopen(url) as url:
            s = url.read()
        doc = ET.fromstring(s)
        self.extrac(doc)
        self.download()

    def extrac(self, doc):
        self.extracBlog(doc.find('tumblelog'))
        total = int(doc.find('posts').get('total'))
        print('total posts:', total, 'fetch:', len(doc.findall('posts/post')))
        for item in doc.iterfind('posts/post'):
            self.extracItem(item)

    def extracBlog(self, blog):
        print(blog.get('name'), blog.get('timezone'), blog.get('title'))

    def extracItem(self, item):
        type = item.get('type')
        print(item.get('id'))
        if type == 'regular':  # 普通文本
            print(item.find('regular-body').text)
        elif type == 'photo':  # 照片类
            desc = item.find('photo-caption')
            if desc is not None:
                print(desc.text)
            # 识别是否有多张图片
            photoset = item.find('photoset')
            if photoset:
                # 多张图片处理逻辑
                print('has photo ', len(photoset.findall('photo')))
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
                download_url = self.downloads.pop()
                lpth = '~/photo/' + os.path.basename(download_url)
                if not pathlib.Path(lpth):
                    print('download:', download_url, 'to:', lpth)
                    with urllib.request.urlopen(download_url) as web:
                        with open(lpth, 'wb') as outfile:
                            outfile.write(web.read())
                else:
                    print('file exsist ', lpth)


Blog().fetch(os.environ.get('EXAMPLE_URL'))
