#!/usr/local/bin/python3
# -*-coding:utf-8-*-

"""
    各种工具函数
"""

import os
import logging
from .settings import LOGGER_COCKPIT, LOGGER_DEFAULT
from . import logger

__all__ = ['Utils']

class Utils():
    @staticmethod
    def getUserHome():
        logger.debug("Finding the users home directory")
        return os.environ['HOME']