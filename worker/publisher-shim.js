const uuid = require("node-uuid");
const workerPubSubClient = require("./redis-connection");

const Channels = require("../channel").Channels;

function publishMessage(
  event,
  action,
  data,
  expectResponse = false,
 ) {
  return new Promise(async (res, rej) => {
    const msgId = uuid.v4();
    const msg = {
      msgId: msgId,
      event: event,
      action: action,
      data: data,
    };
    const channelName = `data:${event}:${action}:${msgId}`

    if (expectResponse) {
      const successChannel = `success:${event}:${action}:${msgId}`;
      const failChannel = `fail:${event}:${action}:${msgId}`

      const success = workerPubSubClient.on(
        successChannel,
        (response, channel) => {
          endMessageLifeCycle();
          return res(response);
        }
      )

      const failure = workerPubSubClient.on(
        failChannel,
        (response, channel) => {
          endMessageLifeCycle();
          return rej(response);
        }
      )

      // Create Function to stop listening
      let evts = [success, failure];
      let endMessageLifeCycle = () => {
        evts.forEach(evt => {
          evt();
        });
      };
    }

    try {
      await workerPubSubClient.emit(channelName, msg);
      if (!expectResponse) {
        return res();
      }
    } catch (e) {
      return rej(e);
    }
  });
}

module.exports = publishMessage;