const ObjectId = require('mongodb').ObjectId;
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
            let group = await DB.findOne('group', {
                name,
                status: 1
            })
            if (!group) {
                group = await DB.insert('group', {
                    name,
                    introduction,
                    click: 0
                })
                tagList.forEach(async tag => {
                    await DB.insert('tag_to_group', {
                        tag_id: tag._id,
                        tag_name: tag.name,
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
            console.log(err);
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
        introduction = '',
        tagList = []
    } = await ctx.request.body;
    if (name === '') {
        ctx.body = {
            status: 0,
            err: '游戏组的必须有名称',
            data: {}
        }
    } else {
        try {
            await DB.updateAll('tag_to_group', {
                group_id: ObjectId(_id),
                status: 1
            }, {
                status: 0
            })
            tagList.forEach(async tag => {
                await DB.insert('tag_to_group', {
                    group_id: ObjectId(_id),
                    tag_id: ObjectId(tag._id),
                    tag_name: tag.name
                })
            })

            await DB.update('group', {
                _id: ObjectId(_id)
            }, {
                name,
                introduction
            })
            ctx.body = {
                status: 1,
                msg: '更新游戏组成功',
                data: {}
            }
        } catch (err) {
            console.log(err);
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
        page = 0, limit = 10
    } = ctx.query
    try {
        let groupList = await DB.pagination('group', {
            status: 1
        }, page, limit)
        groupList = await Promise.all(groupList.map(async item => {
            const res = {
                ...item
            }
            res.tags = await DB.find('tag_to_group', {
                group_id: ObjectId(item._id),
                status: 1
            })
            res.tags = res.tags.map(tag => tag.tag_name)
            return res;
        }))
        ctx.body = {
            status: 1,
            msg: '获取游戏组列表成功',
            data: groupList
        }
    } catch (err) {
        console.log(err);
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
                _id: ObjectId(_id),
                status: 1
            })
            group.tags = await DB.find('tag_to_group', {
                group_id: ObjectId(group._id),
                status: 1
            })
            group.tags = group.tags.map(item => item.tag_name)
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
            await DB.updateAll('tag_to_group', {
                group_id: ObjectId(_id),
                status: 1
            }, {
                status: 0
            })
            await DB.update('group', {
                _id: ObjectId(_id),
            }, {
                status: 0
            })
            ctx.body = {
                status: 1,
                msg: '删除游戏组成功',
                data: {}
            }
        } catch (err) {
            console.log(err);
            ctx.body = {
                status: 0,
                err: '删除游戏组失败',
                data: err
            }
        }
    }
})


module.exports = router