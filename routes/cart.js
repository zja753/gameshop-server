const router = require("koa-router")();
const ObjectId = require('mongodb').ObjectId;

router.prefix("/cart");

router.post('/add', async ctx => {
    const { product_id, user_id } = await ctx.request.body;

    const pre = await DB.find('cartItem_to_user', {
        product_id,
        user_id,
        status: 1,
    })

    if (pre && pre.length !== 0) {
        return ctx.body = {
            status: 1,
            err: '购物车里已经有此游戏了',
            data: {}
        }
    }

    const res = await DB.insert('cartItem_to_user', {
        product_id,
        user_id,
    })

    return ctx.body = {
        status: 1,
        msg: '添加购物车成功',
        data: res
    }
})

router.post('/delete', async ctx => {
    const { product_id_list, user_id } = await ctx.request.body;

    product_id_list.forEach(async product_id => {
        await DB.update('cartItem_to_user', { product_id, user_id }, {
            status: 0
        })
    })

    return ctx.body = {
        status: 1,
        msg: '删除成功',
        data: {}
    }
})

router.post('/fetchCart', async ctx => {
    const { user_id } = await ctx.request.body;

    const cartItemList = await DB.find('cartItem_to_user', { user_id });

    return ctx.body = {
        status: 1,
        msg: '获取成功',
        data: cartItemList,
    }
})


module.exports = router;