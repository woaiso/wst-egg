# TAPI 获取

import pytumblr
import json
import redis
import math
import async_task

r= redis.Redis(host='127.0.0.1', port=6379, db=0)



MAX_TOTAL_PROC = 100

blog_arry=[]


# Authenticate via OAuth
client = pytumblr.TumblrRestClient(
    'CUNchAUJJA0xnZP0Wbb491ZCW4raIYeC8egzPUZZtIAhfmGbZh',
    'Pmod34vwIIQy12OA7TjTZt11QYsrBypZJUw0Nkit8xNH6EMXxd',
    'sqhpxMgpdRAUydRvgG8TrGSwW6hg4hPFyHMOOUS2fgj2kx03jr',
    'D1o0Fi2WDP82PCobTXINJVt5ni9aFz1cWmZaH8WKgL1rFEmYyS'
)

page_size = 20

def store_blog():
    first_page = get_fllowing(1)
    extract_post(first_page.get('blogs'))
    # 获取到总页数
    total_count = int(first_page.get('total_blogs'))

    # 总页数
    pages = math.ceil(float(total_count)/page_size)

    page = 1
    while page < pages:
        page +=1
        result = get_fllowing(page)
        extract_post(result.get('blogs'))

def get_fllowing(page=1):
    limit = 20
    offset = (page-1)*20
    return client.following(limit=limit, offset=offset)

# 将数据存入redis
def extract_post(blogs):
    for blog in blogs:
        print(blog)
        r.sadd('blog', json.dumps(blog))

def sort_by_total(x, y):
    return int(y) - int(x)

def readBlog():
    blogs = r.lrange('blog_list', 0, -1)
    blog_list = []
    for blog in blogs:
        blog_dict = json.loads(blog)
        total = int(blog_dict['total'])
        # 增加阈值，仅处理total<某个数值的内容
        if total < MAX_TOTAL_PROC and total > 0:
            blog_list.append(blog_dict)
    # 排序
    blog_list.sort(key = lambda element: int(element['total']), reverse=True)

    for blog in blog_list:
        # 存储到全局变量
        home_url = blog.get('url')
        async_task.add_article(home_url+'api/read?num=50')

def update_total_count(name, total_count):
    if len(blog_arry) == 0:
        blogs = r.smembers('blog')
        for blog in blogs:
            blog_arry.append(json.loads(blog))

    for blog in blog_arry:
        if blog.get('name') == name:
            blog['total'] = total_count
            print('save blog_list : ', json.dumps(blog))
            r.lpush('blog_list', json.dumps(blog))


if __name__ == '__main__':
    try:
        # store_blog()
        readBlog()
        async_task.init()
    except KeyboardInterrupt:
        pass
    
