const router = require('koa-router')()

router.prefix('/group')

router.post('/create', async function (ctx, next) {
    // tagList = [{_id:xxxxxx,name:xxxxx}]
    const {
        name = null, introduction = "", tagList = []
    } = await ctx.request.body;
    if (name === null) {
        ctx.body = {
            status: 0,
            err: '创建游戏组不能没有name',
            data: {}
        }
    } else {
        try {
            const group = await DB.findOne('group', {
                name,
                status: 1
            })
            if (!group) {
                const tags = tagList.map(item => item.name)
                group = await DB.insert('group', {
                    name,
                    introduction,
                    click: 0,
                    tags
                })
                tagList.forEach(async tag => {
                    await DB.insert('tag_to_group', {
                        tag_id : tag._id,
                        group_id: group._id
                    })
                })
                ctx.body = {
                    status: 1,
                    msg: '创建游戏组成功',
                    data: group
                }
            } else {
                ctx.body = {
                    status: 0,
                    msg: '游戏组已存在',
                    data: group
                }
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '创建游戏组失败',
                data: err
            }
        }
    }
})

router.post('/update', async function (ctx, next) {
    const {
        _id,
        name = '',
        introduction = null
    } = await ctx.request.body;
    if (name === '' && introduction === null) {
        ctx.body = {
            status: 0,
            err: '游戏组的更新数据未传入',
            data: {}
        }
    } else {
        const updateObj = {}
        if (name !== null) updateObj.name = name;
        if (introduction !== null) updateObj.introduction = introduction
        try {
            await DB.update('group', {
                _id
            }, updateObj)
            ctx.body = {
                status: 1,
                msg: '更新游戏组成功',
                data: {}
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '更新游戏组失败',
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
        const groupList = await DB.pagination('group', {
            status: 1
        }, page, limit)
        ctx.body = {
            status: 1,
            msg: '获取游戏组列表成功',
            data: groupList
        }
    } catch (err) {
        ctx.body = {
            status: 0,
            err: "获取游戏组列表失败",
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
            const group = await DB.findOne('group', {
                _id
            })
            ctx.body = {
                status: 1,
                msg: '获取游戏组成功',
                data: group
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: "获取游戏组失败",
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
            await DB.update('group', {
                _id,
            }, {
                status: 0
            })
            ctx.body = {
                status: 1,
                msg: '删除游戏组成功',
                data: {}
            }
        } catch (err) {
            ctx.body = {
                status: 0,
                err: '删除游戏组失败',
                data: err
            }
        }
    }
})


module.exports = router