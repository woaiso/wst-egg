__author__ = 'woaiso@woaiso.com'
__version__ = '0.1'

import logging

from .async_task import add_article
from .download import add_download_task, init_download_proc
from .config import proxy,request_header
from .settings import LOGGER_DEFAULT


logger = logging.getLogger(LOGGER_DEFAULT)


