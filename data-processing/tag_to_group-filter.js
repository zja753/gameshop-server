const DB = require('../module/db')
const {
    ObjectId
} = require('mongodb');
(async function () {
    const groups = await DB.find('group', {});
    groups.forEach(async group => {
        const tag_to_group_list = await DB.find('tag_to_group', {
            group_id: ObjectId(group._id)
        })
        const dic = {}
        tag_to_group_list.forEach(async item => {
            if (dic[item.tag_name]) {
                console.log('-------------------', {
                    tag_name: item.tag_name
                });
                await DB.remove('tag_to_group', {
                    _id: ObjectId(item._id)
                })
            } else {
                console.log('+++++++++++++++++++', {
                    tag_name: item.tag_name
                });
                dic[item.tag_name] = true;
            }
        })
    })
})()