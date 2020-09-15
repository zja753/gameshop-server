const router = require('koa-router')()

router.prefix('/order')

router.post('/create', async function (ctx, next) {
    // orderItemList = [{ product_id:xxxxxxx, quantity:23 },{ product_id:xxxxxxx, quantity:11 }]
    const {
        orderItemList = []
    } = await ctx.request.body;
    if (!(orderItemList instanceof Array) || orderItemList.length === 0) {
        ctx.body = {
            status: 0,
            err: '订单中不能没有商品',
            data: {}
        }
    } else {
        try {
            const productList = []
            let totle_price = 0,
                quantity = 0;
            orderItemList.forEach(async item => {
                const product = await findOne('product', {
                    _id: item.product_id,
                    status: 1,
                })
                product.quantity = item.quantity
                productList.push(product)
                totle_price += product.price * item.quantity;
                quantity += item.quantity
            })
            const order = await DB.insert('order', {
                totle_price,
                quantity
            })
            productList.forEach(async product => {
                await DB.insert('order_to_product', {
                    order_id: order._id,
                    product_id: product._id,
                    quantity: product.quantity
                })
            })
            ctx.body = {
                status: 1,
                msg: '创建订单成功',
                data: order
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '创建订单失败',
                data: err
            }
        }
    }
})

// 订单应该是不需要修改的

router.get('/fetch', async function (ctx, next) {
    const {
        page = 1, limit = 10
    } = ctx.query
    try {
        const orderList = await DB.pagination('order', {
            status: 1
        }, page, limit)
        ctx.body = {
            status: 1,
            msg: '获取订单列表成功',
            data: orderList
        }
    } catch (err) {
        ctx.body = {
            status: 0,
            err: "获取订单列表失败",
            data: err
        }
    }
})

router.get('/get', async function (ctx, next) {
    const {
        _id = null
    } = ctx.query
    if (_id === null) {
        ctx.body = {
            status: 0,
            err: "获取订单_id不能为空",
            data: {}
        }
    } else {
        try {
            const order = await DB.findOne('order', {
                _id
            })
            ctx.body = {
                status: 1,
                msg: '获取订单成功',
                data: order
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: "获取订单失败",
                data: err
            }
        }
    }
})

router.post('/delete', async function (ctx, next) {
    const {
        _id = null
    } = await ctx.request.body
    if (_id === null) {
        ctx.body = {
            status: 0,
            err: "删除订单_id不能为空",
            data: {}
        }
    } else {
        try {
            await DB.update('order', {
                _id,
            }, {
                status: 0
            })
            ctx.body = {
                status: 1,
                msg: '删除标签成功',
                data: {}
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '删除标签失败',
                data: err
            }
        }
    }
})


module.exports = router