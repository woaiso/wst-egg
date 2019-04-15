
import asyncio
import random

semaphore = asyncio.Semaphore(5)

def request_header(source_url=None):
    return {
        'User-Agent': 'GoogleBot',
        'X-Forwarded-For': '121.168.'+str(random.randint(0,255))+'.' + str(random.randint(0,255))
    }

proxy = 'http://127.0.0.1:1087'