const DB = require('../module/db')
const {
    ObjectId
} = require('mongodb');

function isChinese(temp) {
    var re = /[^\u4E00-\u9FA5]/;
    if (re.test(temp)) return false;
    return true;
}

function allChinese(str) {
    for (let i = 0; i < str.length; i++) {
        const c = str.charAt(i);
        if (!isChinese(c)) return false;
    }
    return true;
}
(async function () {
    const tags = await DB.find('tag', {});
    const system = ['Win', 'Linux', 'Mac'];
    tags.forEach(async item => {
        let name = item.name;
        let type;
        if (name[name.length - 1] === '文' || name[name.length - 1] === '语') {
            type = 'language'
        } else if (system.includes(name)) {
            type = 'system'
        } else if (allChinese(name) && name.length <= 4) {
            type = 'type'
        } else {
            type = 'from'
        }
        console.log({
            name,
            type
        });

        await DB.update('tag', {
            _id: ObjectId(item._id)
        }, {
            type
        })
    })
})()