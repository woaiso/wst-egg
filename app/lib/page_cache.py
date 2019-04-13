# 增加redis存储已请求的网页

import redis
import hashlib
import json


r= redis.Redis(host='127.0.0.1', port=6379, db=0)

def get_md5_hex(str):
    m2 = hashlib.md5()   
    m2.update(str.encode(encoding='utf-8'))
    return m2.hexdigest()

def md5_key(url):
    return 'page_cache_{}'.format(get_md5_hex(url))

def check_exists(url): # 检查是否存在URL
    key = md5_key(url)
    return  r.exists(key)

def set(url, content): #添加一个URL
    r.set(md5_key(url), json.dumps({'url': url, 'content': content}))

def get(url): # 使用URL获取网页
    if check_exists(url):
        key = md5_key(url)
        data = r.get(key)
        return json.loads(data).get('content')
    else:
        return None