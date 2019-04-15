#!/usr/local/bin/python3
# -*-coding:utf-8-*-

import asyncio
from .async_task import consumer
from .download import init_download_proc



if __name__ == '__main__':
    try:
        # 初始化爬取进程
        loop = asyncio.get_event_loop()
        asyncio.ensure_future(consumer())
        init_download_proc(loop)
        loop.run_forever()
        # 初始化下载进程
    except KeyboardInterrupt:
        pass
