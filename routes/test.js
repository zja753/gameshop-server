const router = require("koa-router")();
const ObjectId = require('mongodb').ObjectId;

router.prefix("/test");

router.post('/product', async ctx => {
    let {
        group_name,
        name,
        name_en,
        brief_introduction,
        introduction,
        price,
        discount,
        is_dlc = false,
        sale_date,
        category,
        tagNames,
        score_count,
        user_count,
        thumbnail,
        detailImgs
    } = await ctx.request.body;

    console.log({
        group_name,
        name,
        name_en,
        brief_introduction,
        introduction,
        price,
        discount,
        is_dlc,
        sale_date,
        category,
        tagNames,
        score_count,
        user_count,
        thumbnail,
        detailImgs
    });

    let group = await DB.findOne('group', {
        name: group_name,
        status: 1
    })
    if (!group) {
        group = await DB.insert('group', {
            name: group_name,
            introduction: '',
            click: 0
        })
    }
    tagNames.forEach(async tagName => {
        let tag = await DB.findOne('tag', {
            name: tagName
        })
        if (!tag) {
            tag = await DB.insert('tag', {
                name: tagName
            })
        }
        let tag_to_group = await DB.findOne('tag_to_group', {
            tag_id: ObjectId(tag._id),
            group_id: ObjectId(group._id)
        })
        if (!tag_to_group) {
            await DB.insert('tag_to_group', {
                tag_id: ObjectId(tag._id),
                tag_name: tag.name,
                group_id: ObjectId(group._id)
            })
        }
    })
    await DB.insert('product', {
        group_id: ObjectId(group._id),
        group_name,
        name,
        name_en,
        brief_introduction,
        introduction,
        price,
        discount,
        is_dlc,
        sale_date,
        score_count,
        user_count,
        thumbnail,
        detailImgs
    })

})

router.post('/tags', async ctx => {
    let {
        name,
        old_id
    } = await ctx.request.body;

    console.log({
        name,
        old_id
    });

    DB.insert('tag', {
        name,
    })

    ctx.body = ''
})


module.exports = router;