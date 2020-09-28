# -*- coding:utf-8 -*-
# @Time: 2020/9/14 13:32
# @Author : wjd
# @File ：shanguo.py
# @Software: PyCharm

import os
import json
import requests
import time
from lxml import etree
import re
s = requests.Session()
headers = {
    'Accept': 'application/vnd.sonkwo.v7+json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Connection': 'keep-alive',
    'Cookie': 'local_region_name=cn; _uab_collina=160005938831691625188866; Hm_lvt_4abede90a75b2ba39a03e7a40fcec65f=1600059389; Hm_lpvt_4abede90a75b2ba39a03e7a40fcec65f=1600059846',
    'Host': 'www.sonkwo.com',
    'Referer': 'https://www.sonkwo.com/store/search?page=189',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
}
url_list = []
for item in range(20):
    url = "https://www.sonkwo.com/api/search/skus.json?per=20&page=" + \
        str(item)+"&q%5Bwhere%5D%5Bcate%5D=game&q%5Bwhere%5D%5B_or%5D%5B%5D%5Barea%5D=native&q%5Bwhere%5D%5B_or%5D%5B%5D%5Barea%5D=abroad&q%5Border%5D%5Brank%5D=desc&locale=js&sonkwo_version=1&sonkwo_client=web&_=1600059845941"
    url_list.append(url)
item_urllist = []
for url in url_list:
    try:
        response = s.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print('获取详情页请求失败！原因：')
        raise e
    jsons = response.text
    print(jsons)
    json_data = json.loads(jsons)
    for i in range(20):
        game_item = {}
        url_id = json_data["skus"][i]["id"]
        url_area = json_data["skus"][i]["area"]
        if url_area == "abroad":
            item_url = "https://www.sonkwo.hk/sku/"+str(url_id)
        else:
            item_url = "https://www.sonkwo.com/sku/"+str(url_id)
        game_item["item_id"] = url_id
        game_item["category"] = json_data["skus"][i]["category"]
        game_item["url"] = str(item_url)
        game_item["name"] = json_data["skus"][i]["sku_names"]["default"]
        game_item["name_en"] = json_data["skus"][i]["sku_ename"]
        game_item["img_url"] = json_data["skus"][i]["sku_covers"]["default"]
        game_item["sale_price"] = json_data["skus"][i]["sale_price"]
        game_item["list_price"] = json_data["skus"][i]["list_price"]
        game_item["pubdate"] = json_data["skus"][i]["pubdate"]
        item_urllist.append(game_item)
    time.sleep(3)

for item in item_urllist:
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Cookie": "_uab_collina=160005941220317214364174; local_region_name=cn; __cdnuid_h=ecf375f5118c072364f5e0ccc2df20fc; Hm_lvt_b080309fadd4eb6b3f27b3854ec765e8=1600059412; __cdnuid_s=419f616194ac9e9766f353783e9d75c3; Hm_lpvt_b080309fadd4eb6b3f27b3854ec765e8=1600064958",
        "Host": "www.sonkwo.hk",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
    }
    try:
        response = s.get(item["url"], headers=headers)
        response.raise_for_status()
    except Exception as e:
        print('获取详情页请求失败！原因：')
        raise
    # response.text
    getHtmlText = response.text
    getHtml = etree.HTML(getHtmlText)
    # 游戏简介 是一个字符串
    findlink = re.compile(r'"intro":"(.*?)"')
    item["game_introduction"] = re.findall(findlink, getHtmlText)[0]
    # 游戏详细信息 是一个字符串数组
    findmessage = re.compile(
        r'<div class="game-introduction common-bg ">([\s,\S]*?)</div><div class="cover-block">')
    item["game_message"] = re.findall(findmessage, getHtmlText)[0]
    # 游戏详情图 是一个字符串数组
    item["detail_image"] = getHtml.xpath(
        '//*[@id="content-wrapper"]/div/div/div[5]/div/div[1]/div[1]/div/div[2]/div/div/img/@src')
    if len(item["detail_image"]) == 0:
        item["detail_image"] = getHtml.xpath(
            '//*[@id="content-wrapper"]/div/div/div[5]/div/div[1]/div[1]/div/div[1]/div/div/img/@src')
    print("detail_image----------------------------------------\n\n")
    print(item["detail_image"])
    print("detail_image----------------------------------------\n\n")

    # 游戏标签 是一个字符串数组
    findlink = re.compile(r'{"language":"default","name":"(.*?)"')
    item["game_tag"] = re.findall(findlink, getHtmlText)
    # 游戏名 和 组名 是一个字符串
    findlink = re.compile(r'"sku_names":{"default":"(.*?)"')
    productName = re.findall(findlink, getHtmlText)[0]
    print(productName)
    groupNameSplitList = re.split('[\:,\s,\：]', productName)
    print(groupNameSplitList)
    groupName = groupNameSplitList[0]
    item["group_name"] = groupName
    url = "http://community.sonkwo.com/api/groups.json?locale=js&sonkwo_version=1&sonkwo_client=web&q%5Bgroup_skus_sku_id_eq%5D=" + \
        str(item["item_id"])
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Host": "community.sonkwo.com",
        "If-None-Match": 'W/"43637eaeb28b56b4991cf47af7f77404"',
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
    }
    try:
        response = s.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print('获取详情页请求失败！原因：')
        raise
    jsons = response.text
    json_data = json.loads(jsons)
    if len(json_data["groups"]) != 0:
        item["scores_count"] = json_data["groups"][0]["evaluation"]["scores_count"]
        item["users_count"] = json_data["groups"][0]["evaluation"]["users_count"]
    else:
        item["scores_count"] = 0
        item["users_count"] = 0
    print(item)

    url = "http://localhost:3000/test/product"
    data = {"group_name": item['group_name'],
            "name": item['name'],
            "name_en": item['name_en'],
            "brief_introduction": item['game_introduction'],
            "introduction": item['game_message'],
            "price": item['list_price'],
            "discount": item['sale_price'],
            "category": item['category'],
            "tagNames": item['game_tag'],
            "score_count": item['scores_count'],
            "user_count": item['users_count'],
            "thumbnail": item['img_url'],
            "detailImgs": item['detail_image'],
            "sale_date": item['pubdate']}
    requests.post(url=url, data=data)
    time.sleep(3)
