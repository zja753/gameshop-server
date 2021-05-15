const { log } = require('debug')
const { ObjectId } = require('mongodb')

const router = require('koa-router')()

router.prefix('/product')

router.post('/create', async function (ctx, next) {
  console.log(ctx.request.body)
  const {
    group_id = null,
    group_name = null,
    name = '',
    name_en = '',
    brief_introduction = '',
    introduction = '',
    price = null,
    discount = 1,
    is_dlc = null,
    is_demo = null,
    rate = 10,
    sale_date = null,
  } = await ctx.request.body
  console.log({
    group_id,
    group_name,
    name,
    name_en,
    brief_introduction,
    introduction,
    price,
    discount,
    is_dlc,
    is_demo,
    rate,
    sale_date,
  })
  if (
    group_id === null ||
    name === '' ||
    price === null ||
    is_dlc === null ||
    is_demo === null ||
    rate === null ||
    sale_date === null
  ) {
    ctx.body = {
      status: 0,
      err: '游戏信息不全',
      data: {},
    }
  } else {
    try {
      let product = await DB.findOne('product', {
        name,
        status: 1,
      })
      if (!product) {
        product = await DB.insert('product', {
          group_id: ObjectId(group_id),
          group_name,
          name,
          name_en,
          brief_introduction,
          introduction,
          price,
          discount,
          is_dlc,
          is_demo,
          rate,
          sale_date,
        })
        ctx.body = {
          status: 1,
          msg: '创建游戏成功',
          data: product,
        }
      } else {
        ctx.body = {
          status: 0,
          msg: '游戏已存在',
          data: product,
        }
      }
    } catch (err) {
      ctx.body = {
        status: 0,
        err: '创建游戏失败',
        data: err,
      }
    }
  }
})

router.post('/update', async function (ctx, next) {
  const {
    _id = null,
    group_id = null,
    group_name,
    name = '',
    name_en = '',
    brief_introduction = '',
    introduction = '',
    price = null,
    discount = 1,
    is_dlc = null,
    is_demo = null,
    rate = null,
    sale_date = null,
  } = await ctx.request.body

  if (_id === null) {
    ctx.body = {
      status: 0,
      err: '未传入_id',
      data: {},
    }
  } else {
    const updateObj = {}
    if (group_id !== null) updateObj.group_id = ObjectId(group_id)
    if (group_name !== null) updateObj.group_name = group_name
    if (name !== null) updateObj.name = name
    if (name_en !== null) updateObj.name_en = name_en
    if (brief_introduction !== null)
      updateObj.brief_introduction = brief_introduction
    if (introduction !== null) updateObj.introduction = introduction
    if (price !== null) updateObj.price = price
    if (discount !== null) updateObj.discount = discount
    if (is_dlc !== null) updateObj.is_dlc = is_dlc
    if (is_demo !== null) updateObj.is_demo = is_demo
    if (rate !== null) updateObj.rate = rate
    if (sale_date !== null) updateObj.sale_date = sale_date
    try {
      await DB.update(
        'product',
        {
          _id: ObjectId(_id),
        },
        updateObj
      )
      ctx.body = {
        status: 1,
        msg: '更新游戏成功',
        data: {},
      }
    } catch (err) {
      ctx.body = {
        status: 0,
        err: '更新游戏失败',
        data: err,
      }
    }
  }
})

router.get('/fetch', async function (ctx, next) {
  const { page = 0, limit = 10, tag = 'all' } = ctx.query
  if (tag !== 'all') {
    const groupIdList = (await DB.find('tag_to_group', { tag_name: tag })).map(
      (item) => ObjectId(item.group_id)
    )
    const productList = await DB.pagination(
      'product',
      {
        group_id: { $in: groupIdList },
      },
      page,
      limit
    )
    const sz = productList.length
    for (let i = 0; i < sz; i++) {
      const cur = productList[i]
      const tagList = await DB.find('tag_to_group', {
        group_id: ObjectId(cur.group_id),
      })
      cur.tagList = tagList.map((item) => item.tag_name)
    }
    return (ctx.body = {
      status: 1,
      msg: '获取游戏列表成功',
      data: productList,
    })
  }
  try {
    const productList = await DB.pagination(
      'product',
      {
        status: 1,
      },
      page,
      limit
    )
    ctx.body = {
      status: 1,
      msg: '获取游戏列表成功',
      data: productList,
    }
  } catch (err) {
    ctx.body = {
      status: 0,
      err: '获取游戏列表失败',
      data: err,
    }
  }
})

router.get('/get', async function (ctx, next) {
  const { _id = null } = ctx.query
  if (_id === null) {
    ctx.body = {
      status: 0,
      err: '_id未传入',
      data: {},
    }
  } else {
    try {
      const product = await DB.findOne('product', {
        _id: ObjectId(_id),
      })
      ctx.body = {
        status: 1,
        msg: '获取游戏成功',
        data: product,
      }
    } catch (err) {
      ctx.body = {
        status: 0,
        err: '获取游戏失败',
        data: err,
      }
    }
  }
})

router.post('/delete', async function (ctx, next) {
  const { _id = null } = await ctx.request.body
  if (_id === null) {
    ctx.body = {
      status: 0,
      err: '_id未传入',
      data: {},
    }
  } else {
    try {
      await DB.update(
        'product',
        {
          _id: ObjectId(_id),
        },
        {
          status: 0,
        }
      )
      ctx.body = {
        status: 1,
        msg: '删除游戏成功',
        data: {},
      }
    } catch (err) {
      ctx.body = {
        status: 0,
        err: '删除游戏失败',
        data: err,
      }
    }
  }
})

router.get('/count', async function (ctx, next) {
  const count = await DB.getCount('product', {
    status: 1,
  })
  if (count) {
    ctx.body = {
      status: 1,
      msg: '获得游戏数量',
      data: count,
    }
  } else {
    ctx.body = {
      status: 0,
      err: '未能获得游戏数量',
      data: null,
    }
  }
})

router.get('/fetchByUserId', async function (ctx, next) {
  const { user_id } = ctx.query
  try {
    const productList = await DB.find('product_to_user', {
      user_id,
    })
    const res = []
    const promiseList = []
    productList.forEach((item) => {
      promiseList.push(
        new Promise(async (resolve) => {
          const { product_id } = item
          const product = await DB.findOne('product', {
            _id: ObjectId(product_id),
          })
          res.push(product)
          resolve()
        })
      )
    })
    await Promise.all(promiseList)
    ctx.body = {
      status: 1,
      msg: '获取游戏列表成功',
      data: res,
    }
  } catch (err) {
    ctx.body = {
      status: 0,
      err: '获取游戏列表失败',
      data: err,
    }
  }
})

router.get('/recommend', async function (ctx, next) {
  const { user_id } = ctx.query
  try {
    const productList = await DB.find('product_to_user', {
      user_id,
    })
    const promiseList = []
    const tagDic = {}
    productList.forEach((item) => {
      promiseList.push(
        new Promise(async (resolve) => {
          const { product_id } = item
          const product = await DB.findOne('product', {
            _id: ObjectId(product_id),
          })
          // product.group_id
          const tagList = await DB.find('tag_to_group', {
            group_id: ObjectId(product.group_id),
          })
          tagList.forEach((tag) => {
            const { tag_id } = tag
            tagDic[tag_id] = tagDic[tag_id] ? tagDic[tag_id] + 1 : 1
          })
          resolve()
        })
      )
    })
    await Promise.all(promiseList)

    const tagList = Object.keys(tagDic)
      .map((key) => ({
        tag_id: key,
        cnt: tagDic[key],
      }))
      .sort((a, b) => b.cnt - a.cnt)
      .filter((_, index) => index < 10)

    const tagToGroupList = await DB.find('tag_to_group', {
      tag_id: { $in: tagList.map((item) => ObjectId(item.tag_id)) },
      status: 1,
    })

    const groupDic = {}
    tagToGroupList.forEach((item) => {
      groupDic[item.group_id] = groupDic[item.group_id]
        ? groupDic[item.group_id] + 1
        : 1
    })
    const groupList = Object.keys(groupDic)
      .map((key) => ({
        group_id: key,
        cnt: groupDic[key],
      }))
      .sort((a, b) => b.cnt - a.cnt)
      .filter((_, index) => index < 10)

    const res = await DB.find('product', {
      group_id: { $in: groupList.map((item) => ObjectId(item.group_id)) },
    })

    ctx.body = {
      status: 1,
      msg: '获取推荐游戏列表成功',
      data: res,
    }
  } catch (err) {
    ctx.body = {
      status: 0,
      err: '获取推荐游戏列表失败',
      data: err,
    }
  }
})

router.get('/hot', async function (ctx, next) {
  try {
    const hotProductIdList = (
      await DB.find('product_to_user', { status: 1 })
    ).map((item) => ObjectId(item.product_id))

    console.log(hotProductIdList)
    const res = await DB.pagination(
      'product',
      {
        _id: {
          $in: hotProductIdList,
        },
      },
      0,
      10
    )

    ctx.body = {
      status: 1,
      msg: '获取热销游戏列表成功',
      data: res,
    }
  } catch (err) {
    ctx.body = {
      status: 0,
      err: '获取热销游戏列表失败',
      data: err,
    }
  }
})

module.exports = router
