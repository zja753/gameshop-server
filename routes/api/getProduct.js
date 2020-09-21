const {
  DBRef
} = require('mongodb');

const ObjectId = require('mongodb').ObjectId;
const router = require('koa-router')()

router.get('/getProduct', async function (ctx, next) {
  const {
    limit = 20,
      page = 0,
      tag_name = "",
  } = ctx.query;
  try {
    let data = await DB.pagination('product', {
      status: 1
    }, page, limit);
    let count = await DB.getCount('product', {
      status: 1
    });
    let tagList = [];
    for (let i of data) {
      tagList = [];
      let tags = await DB.find('tag_to_group', {
        group_id: ObjectId(i.group_id)
      });
      for (let j of tags) {
        tagList.push(j.tag_name);
      }
      i.tagList = tagList;
    }
    ctx.body = {
      status: 1,
      count,
      data
    }
  } catch (err) {
    ctx.body = {
      status: 0,
      err: "获取数据失败"
    }
  }
})

router.get('/getProductInfo', async function (ctx, next) {
  const {
    _id,
  } = ctx.query;
  try {
    let data = await DB.findOne('product', {
      _id: ObjectId(_id),
      status: 1
    });
    let tagList = [];
    let group = await DB.findOne('group', {
      _id: ObjectId(data.group_id)
    });
    // console.log(group);
    let tags = await DB.find('tag_to_group', {
      group_id: ObjectId(group._id)
    });
    for (let j of tags) {
      tagList.push(j.tag_name);
    }
    data.tagList = tagList;
    ctx.body = {
      status: 1,
      data
    }
  } catch (err) {
    ctx.body = {
      status: 0,
      err: "获取数据失败"
    }
  }
})

module.exports = router