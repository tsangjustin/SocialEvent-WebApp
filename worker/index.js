const redisConnection = require("./redis-connection");
const events = require("../channel").event;
const actions = require("../channel").action;

const dbComment = require("../server/db/comment");
const dbEvent = require("../server/db/event");
const dbUser = require("../server/db/users");
const elasticSearch = require("../server/elastic-search/search");

redisConnection.on('data:*:*:*', async (msg, channel) => {
  const msgId = msg.msgId;
  const event = msg.event;
  const action = msg.action;
  const data = msg.data;
  
  const respond = (isSuccess, data) => {
    const prependChannel = isSuccess ? "success" : "fail" ;
    const channel = `${event}:${action}:${msgId}`;
    const resp = isSuccess
      ? { message: data }
      : { error: data };
    redisConnection.emit(
      `${prependChannel}:${channel}`,
      resp,
    );
  }

  switch (event) {
    case events.Event:
      switch (action) {
        case actions.CreateEvent:
          try {
            const event = await dbEvent.createEvent(data);
            return respond(true, event)
          } catch (err) {
            return respond(false, err);
          }
        case actions.GetEvent:
          try {
            const event = await dbEvent.getEventById(data.id);
            return respond(true, event)
          } catch (err) {
            return respond(false, err);
          }
        case actions.UpdateEvent:
          try {
            const event = await dbEvent.updateEvent(data);
            return respond(true, event)
          } catch (err) {
            return respond(false, err);
          }
        case actions.DeleteEvent:
          try {
            const eventId = await dbEvent.deleteEvent(
              data.id,
              data.userId,
            );
            return respond(true, eventId)
          } catch (err) {
            return respond(false, err);
          }
        case actions.GetAllEvents:
          try {
            const events = await dbEvent.getAllEvents();
            return respond(true, events)
          } catch (err) {
            return respond(false, err);
          }
        case actions.SearchEvents:
          try {
            const searchEvents = await elasticSearch.search(data);
            return respond(true, searchEvents)
          } catch (err) {
            return respond(false, err);
          }
        case actions.JoinEvent:
          try {
            const event = await dbEvent.joinEvent(data);
            return respond(true, event)
          } catch (err) {
            return respond(false, err);
          }
        case actions.LeaveEvent:
          try {
            const event = await dbEvent.leaveEvent(data);
            return respond(true, event)
          } catch (err) {
            return respond(false, err);
          }
        default:
          return respond(false, "Invalid Event action");

      }
    case (events.User):
      switch (action) {
        case actions.GetUser:
          try {
            const fetchUser = await dbUser.getUser(data);
            return respond(true, fetchUser);
          } catch (err) {
            return respond(false, err);
          }
        case actions.CreateUser:
          try {
            const createdUser = await dbUser.createUser(data);
            return respond(true, createdUser);
          } catch (err) {
            return respond(false, err);
          }
        case actions.UpdateUser:
          try {
            const updatedUser = await dbUser.updateUser(data);
            return respond(true, updatedUser);
          } catch (err) {
            return respond(false, err);
          }
        default:
          return respond(false, "Invalid User action")
      }
    case (events.Comment):
      switch (action) {
        case actions.GetAllComments:
          try {
            const comments = await dbComment.getAllComments(data);
            return respond(true, comments);
          } catch (err) {
            return respond(false, err);
          }
        case actions.AddComment:
          try {
            const comment = await dbComment.addComment(data);
            return respond(true, comment);
          } catch (err) {
            return respond(false, err);
          }
        case actions.EditComment:
          try {
            const comment = await dbComment.editComment(data);
            return respond(true, comment);
          } catch (err) {
            return respond(false, err);
          }
        case actions.DeleteComment:
          try {
            const comment = await dbComment.deleteComment(data);
            return respond(true, comment);
          } catch (err) {
            return respond(false, err);
          }
        default:
          return respond(false, "Invalid Comment action");
      }
    case (events.Profile):
      switch (action) {
        case actions.GetAllProfile:
          try {
            const allUsers = await dbUser.getAllUsers();
            return respond(true, allUsers);
          } catch (err) {
            return respond(false, err);
          }
        case actions.EditProfile:
          try {
            const updatedUser = await dbUser.updateUser(data._id, data);
            return respond(true, updatedUser);
          } catch (err) {
            return respond(false, err);
          }
        default:
          return respond(false, "Invalid Profile action");
      }
    default:
      return respond(false, "Invalid event");
  }
});

console.log("Worker is running...");
