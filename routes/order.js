const ObjectId = require('mongodb').ObjectId;

const router = require('koa-router')()

router.prefix('/order')

router.post('/create', async function (ctx, next) {
    // orderItemList = [{ product_id:xxxxxxx, quantity:23 },{ product_id:xxxxxxx, quantity:11 }]
    const {
        orderItemList = [],
        user_id,
    } = await ctx.request.body;

    if (!(orderItemList instanceof Array) || orderItemList.length === 0) {
        return ctx.body = {
            status: 0,
            err: '订单中不能没有商品',
            data: {}
        }
    }

    try {
        const productList = []
        const promiseList = [];
        let totle_price = 0,
            quantity = 0;
        orderItemList.forEach(item => {
            const curPromise = new Promise(async (resolve) => {
                const product = await DB.findOne('product', {
                    _id: ObjectId(item.product_id),
                    status: 1,
                })
                product.quantity = item.quantity;
                productList.push(product);
                totle_price += product.price * item.quantity;
                quantity += item.quantity;
                resolve();
            })
            promiseList.push(curPromise);
        })
        await Promise.all(promiseList);
        const order = await DB.insert('order', {
            productList,
            totle_price,
            quantity,
            user_id,
            status: 1,
        });
        productList.forEach(async product => {
            await DB.insert('order_to_product', {
                order_id: order._id,
                product_id: product._id,
                quantity: product.quantity
            })
        });
        ctx.body = {
            status: 1,
            msg: '创建订单成功',
            data: order
        };
    } catch (err) {
        ctx.body = {
            status: 0,
            err: '创建订单失败',
            data: err
        };
    }

})

router.post('/pay', async function (ctx, next) {
    // orderItemList = [{ product_id:xxxxxxx, quantity:23 },{ product_id:xxxxxxx, quantity:11 }]
    const { order_id } = await ctx.request.body;
    const order = await DB.findOne('order', { _id: ObjectId(order_id) });
    const { productList, totle_price, quantity, user_id } = order;
    const user = await DB.findOne('user', { _id: ObjectId(user_id) });

    if (user.balance < totle_price) {
        return ctx.body = {
            status: 0,
            err: '支付订单失败,账户里的钱不够支付订单！',
            data: {},
        }
    }

    // TODO: 查重，已经有的游戏就不能买

    await DB.update('user', { _id: ObjectId(user_id) }, { balance: user.balance - totle_price });
    const res = await DB.update('order', { _id: ObjectId(order_id) }, { status: 2 });
    productList.forEach(async product => {
        await DB.insert('product_to_user', {
            product_id: product._id,
            user_id,
        })
    })

    return ctx.body = {
        status: 1,
        msg: '支付订单成功',
        data: res
    }

})

router.get('/fetch', async function (ctx, next) {
    const {
        user_id
    } = ctx.query
    try {
        const orderList = await DB.find('order', {
            user_id
        })
        // console.log(orderList);
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
        return ctx.body = {
            status: 0,
            err: "获取订单_id不能为空",
            data: {}
        }
    }
    try {
        const order = await DB.findOne('order', {
            _id: ObjectId(_id),
        })
        return ctx.body = {
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