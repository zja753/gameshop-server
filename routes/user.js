const router = require("koa-router")();
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken"); // 创建和解析token
const ObjectId = require('mongodb').ObjectId;

router.prefix("/user");

router.post("/register", async (ctx) => {
  const {
    password,
    email,
    nickName = "admin",
    role = 'user' // 这里最好每种角色一个路由，或者还有别的更好的方式，否则别人抓个包改一下role就获得权限了
  } = await ctx.request.body;
  console.log({
    password,
    email,
    nickName,
    role
  });
  if (password.length >= 6) {
    const user = await DB.findOne("user", {
      email,
      status: 1
    });
    if (user === null) {
      const hashPassword = bcrypt.hashSync(password);
      const res = await DB.insert("user", {
        role,
        password: hashPassword,
        email,
        nickName,
        balance: 0,
        avatar: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1600104621985&di=48f4ff75babdb2c0652913f5ff201955&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201603%2F06%2F20160306204517_i4Se8.jpeg"
      });
      ctx.body = {
        status: 1,
        data: res,
        err: "账号注册成功",
      };
    } else {
      ctx.body = {
        status: 0,
        err: "账号已存在",
      };
    }
  } else {
    ctx.body = {
      status: 0,
      err: "密码长度小于6位"
    }
  }
});

router.post("/login", async (ctx) => {
  const {
    email,
    password
  } = ctx.request.body;
  console.log({
    email,
    password
  });
  const user = await DB.findOne("user", {
    email,
    status: 1
  });
  if (user === null) {
    ctx.body = {
      status: 0,
      err: "账号不存在"
    };
  } else {
    const confirmRes = bcrypt.compareSync(password, user.password);
    if (confirmRes) {
      console.log(user);
      const token = jwt.sign({
          _id: user._id,
          email: user.email
        },
        "secret", {
          expiresIn: 3600 * 24
        }
      );
      ctx.body = {
        data: {
          token: `Bearer ${token}`,
          user_id: user._id,
          email,
        },
        msg: "登录成功",
        status: 1,
      };
    } else ctx.body = {
      status: 0,
      err: "密码错误"
    };
  }
});

router.get("/getUserInfo", async (ctx) => {
  const {
    _id
  } = ctx.query;
  const user = await DB.findOne("user", {
    _id: ObjectId(_id),
    status: 1
  });

  if (user === null) {
    ctx.body = {
      status: 0,
      err: "账号不存在"
    };
  } else {
    ctx.body = {
      data: {
        nickName: user.nickName,
        email: user.email,
        avatar: user.avatar,
        balance: user.balance,
      },
      status: 1,
      msg: "请求成功",
    };
  }
});

router.get("/fetch", async (ctx, next) => {
  const {
    page,
    limit
  } = ctx.query;
  try {
    const userList = await DB.pagination('user', {
      status: 1
    }, page, limit);
    ctx.body = {
      status: 1,
      msg: '获取用户列表成功',
      data: userList
    }
  } catch (error) {
    ctx.body = {
      status: 0,
      err: "获取标签列表失败",
      data: error
    }
  }
})

router.post('/delete', async ctx => {
  let {
    _id
  } = await ctx.request.body;

  if (_id === null) {
    ctx.body = {
      status: 0,
      err: "未传入_id",
      data: {}
    }
  } else {
    try {
      console.log(_id);
      await DB.update('user', {
        _id: ObjectId(_id)
      }, {
        status: 0
      })
      ctx.body = {
        status: 1,
        msg: '删除用户成功',
        data: {}
      }
    } catch (err) {
      ctx.body = {
        status: 0,
        err: '删除用户失败',
        data: err
      }
    }
  }

})

module.exports = router;