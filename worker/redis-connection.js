const redisPubSub = require("node-redis-pubsub");

const config = require("./config");

const workerRedisClient = new redisPubSub(config);

module.exports = workerRedisClient;
