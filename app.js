const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const DB = require("./module/db");
const cors = require("koa2-cors");

// const index = require('./routes/index')
const user = require('./routes/user')
const shop = require('./routes/shop')
const tag = require('./routes/tag')
const order = require('./routes/order')
const group = require('./routes/group')
const product = require('./routes/product')
const test = require('./routes/test')

// 跨域
app.use(cors());

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
// app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(shop.routes(), shop.allowedMethods())
app.use(tag.routes(), tag.allowedMethods())
app.use(order.routes(), order.allowedMethods())
app.use(group.routes(), group.allowedMethods())
app.use(product.routes(), product.allowedMethods())
app.use(test.routes(), test.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app