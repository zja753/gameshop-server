const router = require('koa-router')()

router.prefix('/product')

router.post('/create', async function (ctx, next) {
    const {
        group_id = null,
            name = '',
            name_en = '',
            brief_introduction = '',
            introduction = '',
            price = null,
            discount = 1,
            is_dlc = null,
            is_demo = null,
            rate = null,
            sale_date = null
    } = await ctx.request.body;
    if (group_id === null || name === '' || price === null || is_dlc === null || is_demo === null || rate === null || sale_date === null) {
        ctx.body = {
            status: 0,
            err: '游戏信息不全',
            data: {}
        }
    } else {
        try {
            let product = await DB.findOne('product', {
                name,
                status: 1
            })
            if (!product) {
                product = await DB.insert('product', {
                    group_id,
                    name,
                    name_en,
                    brief_introduction,
                    introduction,
                    price,
                    discount,
                    is_dlc,
                    is_demo,
                    rate,
                    sale_date
                })
                ctx.body = {
                    status: 1,
                    msg: '创建游戏成功',
                    data: product
                }
            } else {
                ctx.body = {
                    status: 0,
                    msg: '游戏已存在',
                    data: product
                }
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '创建游戏失败',
                data: err
            }
        }
    }
})

router.post('/update', async function (ctx, next) {
    const {
        _id = null,
            group_id = null,
            name = '',
            name_en = '',
            brief_introduction = '',
            introduction = '',
            price = null,
            discount = 1,
            is_dlc = null,
            is_demo = null,
            rate = null,
            sale_date = null
    } = await ctx.request.body;

    if (_id === null) {
        ctx.body = {
            status: 0,
            err: '未传入_id',
            data: {}
        }
    } else {
        const updateObj = {}
        if (group_id !== null) updateObj.group_id = group_id;
        if (name !== null) updateObj.name = name
        if (name_en !== null) updateObj.name_en = name_en
        if (brief_introduction !== null) updateObj.brief_introduction = brief_introduction
        if (introduction !== null) updateObj.introduction = introduction
        if (price !== null) updateObj.price = price
        if (discount !== null) updateObj.discount = discount
        if (is_dlc !== null) updateObj.is_dlc = is_dlc
        if (is_demo !== null) updateObj.is_demo = is_demo
        if (rate !== null) updateObj.rate = rate
        if (sale_date !== null) updateObj.sale_date = sale_date
        try {
            await DB.update('product', {
                _id
            }, updateObj)
            ctx.body = {
                status: 1,
                msg: '更新游戏成功',
                data: {}
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '更新游戏失败',
                data: err
            }
        }
    }
})

router.get('/fetch', async function (ctx, next) {
    const {
        page = 1, limit = 10
    } = ctx.query
    try {
        const productList = await DB.pagination('product', {
            status: 1
        }, page, limit)
        ctx.body = {
            status: 1,
            msg: '获取游戏列表成功',
            data: productList
        }
    } catch (err) {
        ctx.body = {
            status: 0,
            err: "获取游戏列表失败",
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
            err: "_id未传入",
            data: {}
        }
    } else {
        try {
            const product = await DB.findOne('product', {
                _id
            })
            ctx.body = {
                status: 1,
                msg: '获取游戏成功',
                data: product
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: "获取游戏失败",
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
            err: "_id未传入",
            data: {}
        }
    } else {
        try {
            await DB.update('product', {
                _id,
            }, {
                status: 0
            })
            ctx.body = {
                status: 1,
                msg: '删除游戏成功',
                data: {}
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '删除游戏失败',
                data: err
            }
        }
    }
})


module.exports = router