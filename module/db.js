const MongoClient = require("mongodb").MongoClient;
const Config = require("./config");

class Db {
  static dbClient = null;
  constructor() {
    this.dbClient = this.connect();
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.dbClient) {
        // 解决数据库每次都要连接的问题（现在只需连接一次即可）
        resolve(this.dbClient);
      }
      MongoClient.connect(
        Config.url,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) {
            reject(err);
          }
          const db = client.db(Config.dbName);
          resolve(db);
        }
      );
    });
  }
  async insert(collectionName, data) {
    data.create_time = Date.now();
    data.update_time = Date.now();
    data.status = 1;
    return new Promise(async (resolve, reject) => {
      const db = await this.connect();
      db.collection(collectionName).insertOne(data, (err, res) => {
        if (err) reject(err);
        else resolve(res.ops[0]);
      });
    });
  }
  async remove(collectionName, json) {
    return new Promise(async (resolve, reject) => {
      const db = await this.connect();
      const res = db.collection(collectionName).removeOne(json, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  async find(collectionName, query) {
    return new Promise(async (resolve, reject) => {
      const db = await this.connect();
      const res = db.collection(collectionName).find(query);
      res.toArray((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  async findOne(collectionName, query) {
    return new Promise(async (resolve, reject) => {
      const db = await this.connect();
      const res = db.collection(collectionName).findOne(query, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  async update(collectionName, json1, json2) {
    json2.update_time = Date.now();
    return new Promise(async (resolve, reject) => {
      const db = await this.connect();
      db.collection(collectionName).updateOne(
        json1,
        { $set: json2 },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
    });
  }
  async pagination(collectionName, query, page, limit) {
    return new Promise(async (resolve, reject) => {
      const db = await this.connect();
      console.log(page, limit, page * limit, limit * 1);
      const res = db
        .collection(collectionName)
        .find(query)
        .skip(page * limit)
        .limit(limit * 1);
      res.toArray((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

DB = new Db();

module.exports = DB;
