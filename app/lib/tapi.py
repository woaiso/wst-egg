# TAPI 获取

import pytumblr
import json
import redis
import math
import async_task

r= redis.Redis(host='127.0.0.1', port=6379, db=0)


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


def readBlog():
    blogs = r.smembers('blog')
    count = 1
    print(len(blogs))
    for blog in blogs:
        if count < 50:
            count +=1
            blog_dict = json.loads(blog)
            print(blog_dict)
            home_url = blog_dict.get('url')
            async_task.add_article(home_url+'api/read?num=50')
        else:
            break


if __name__ == '__main__':
    try:
        readBlog()
        async_task.init()
    except KeyboardInterrupt:
        pass
    # store_blog()
    
