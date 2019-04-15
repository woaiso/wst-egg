#!/usr/bin/python3
#coding=utf-8

from . import __version__

class BaseParser:
    def __init__(self):
        pass
    """
        base parser to extract internet content

        :param source_url: string webpage address
        :param       data: dict webpage content data
    """
    def parser(self, source_url, data):
        pass