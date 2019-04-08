# 异步编程学习
# encoding=utf-8


"""
    这是多行注释
    这是多行注释
    这是多行注释
"""

import asyncio


async def fetch(url):
    print('start fetch url：', url)
    # 休眠1秒
    await asyncio.sleep(2)
    print('end fetch url：', url)
    return '<h1>'+url+'</h1>'


if __name__ == '__main__':
    tasks = [fetch('http://')]
    loop = asyncio.get_event_loop()
    try:
        print('开始运行协程')
        coro = fetch('create job')
        print('进入事件循环')
        result = loop.run_until_complete(coro)
        print(f'run_util_complete：{result}, 默认输出None')
    finally:
        print('关闭事件循环')
        loop.close()
