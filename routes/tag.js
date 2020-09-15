const router = require('koa-router')()

router.prefix('/tag')

router.post('/create', async function (ctx, next) {
    const {
        name = null, introduction = ""
    } = await ctx.request.body;
    if (name === null) {
        ctx.body = {
            status: 0,
            err: '标签名字不能为空',
            data: {}
        }
    } else {
        try {
            const tag = await DB.findOne('tag', {
                name,
                status: 1
            })
            if (!tag) {
                tag = await DB.insert('tag', {
                    name,
                    introduction
                })
                ctx.body = {
                    status: 1,
                    msg: '创建标签成功',
                    data: tag
                }
            } else {
                ctx.body = {
                    status: 0,
                    msg: '标签已存在',
                    data: tag
                }
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '创建标签失败',
                data: err
            }
        }
    }
})

router.post('/update', async function (ctx, next) {
    const {
        _id = null, introduction = null
    } = await ctx.request.body;
    if (_id === null) {
        ctx.body = {
            status: 0,
            err: '未传入_id',
            data: {}
        }
    } else {
        const updateObj = {}
        if (introduction !== null) updateObj.introduction = introduction;
        try {
            await DB.update('tag', {
                _id,
                status: 1
            }, updateObj)
            ctx.body = {
                status: 1,
                msg: '更新标签描述成功',
                data: {}
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '更新标签失败',
                data: err
            }
        }
    }
})

router.get('/fetch', async function (ctx, next) {
    const {
        page = 0, limit = 10
    } = ctx.query
    try {
        const tagList = await DB.pagination('tag', {
            status: 1
        }, page, limit)
        ctx.body = {
            status: 1,
            msg: '获取标签列表成功',
            data: tagList
        }
    } catch (err) {
        ctx.body = {
            status: 0,
            err: "获取标签列表失败",
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
            err: "未传入_id",
            data: {}
        }
    } else {
        try {
            const tag = await DB.findOne('tag', {
                _id
            })
            ctx.body = {
                status: 1,
                msg: '获取标签成功',
                data: tag
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: "获取标签失败",
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
            err: "未传入_id",
            data: {}
        }
    } else {
        try {
            await DB.update('tag', {
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