const router = require('express').Router();

const publishMessage = require("../../worker/publisher-shim");
const Channels = require("../../channel");

/**
 * Function GETS all events
 */
router.get('/', async (req, res) => {
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.GetAllEvents,
      {},
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/search", async (req, res) => {
  const searchQuery = req.query.q;
  const data = {
    search: searchQuery,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.SearchEvents,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function GET event given id
 */
router.get('/:id', async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.GetEvent,
      { id: eventId },
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function POST event
 */
router.post('/', async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        error: "Not Authorized",
      });
  }
  const createdEvent = {
    ...req.body,
    creatorId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.CreateEvent,
      createdEvent,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function PUT update event given id
 */
router.put('/:id', async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const updatedEvent = req.body;
  const data = {
    ...updatedEvent,
    id: eventId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.UpdateEvent,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function DELETE delete event given id
 */
router.delete('/:id', async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const data = {
    id: eventId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.DeleteEvent,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function PUT join event given id
 */
router.put('/:id/join', async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const data = {
    id: eventId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.JoinEvent,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function PUT join event given id
 */
router.put('/:id/leave', async (req, res) => {
  if (!req.user) {
    return res
      .status(400)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const data = {
    id: eventId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Event,
      Channels.action.LeaveEvent,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function GET comment for given event id
 */
router.get("/:id/comment", async (req, res) => {
  const eventId = req.params.id;
  const data = {
    eventId: eventId,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Comment,
      Channels.action.GetAllComments,
      data,
      true,
    );
    return res.json(resp);
  } catch (e) {
    return res.status(500).json(e);
  }
});

/**
 * Function POST comment for given event id
 */
router.post("/:id/comment", async (req, res) => {
  if (!req.user) {
    return res
      .status(400)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const reqBody = req.body;
  const data = {
    ...reqBody,
    eventId: eventId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Comment,
      Channels.action.AddComment,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function PUT update comment for given event id
 */
router.put("/:id/comment/:commentId", async (req, res) => {
  if (!req.user) {
    return res
      .status(400)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const commentId = req.params.commentId;
  const data = {
    ...req.body,
    eventId: eventId,
    commentId: commentId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Comment,
      Channels.action.EditComment,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * Function DELETE delete comment for given event id
 */
router.delete("/:id/comment/:commentId", async (req, res) => {
  if (!req.user) {
    return res
      .status(400)
      .json({
        error: "Not Authorized",
      });
  }
  const eventId = req.params.id;
  const commentId = req.params.commentId;
  const data = {
    eventId: eventId,
    commentId: commentId,
    userId: req.user._id,
  };
  try {
    const resp = await publishMessage(
      Channels.event.Comment,
      Channels.action.DeleteComment,
      data,
      true,
    );
    return res.json(resp);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = exports = router;
