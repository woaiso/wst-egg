#!/usr/local/bin/python3
#-*-coding:utf-8-*-

__author__ = 'woaiso@woaiso.com'
__version__ = '0.1'

"""
    存放所有的解析器,可针对不同的网站设计不同的解析器
    目前支持 html_parser、xml_parser、blog_parser
"""


from .blog_parser import BlogParser