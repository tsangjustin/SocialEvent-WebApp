// Node Modules
const uuidV4 = require("uuid/v4");
const xss = require("xss");
// Custom Node Modules
const EventCollection = require("../config/mongoCollections").events;

function isValidString(str) {
	if ((str === undefined) || (typeof(str) !== "string") || (str.length <= 0)) {
		return false;
	}
	return true;
}

function isValidDate(date) {
	var currDate = new Date().getTime() / 1000;
	if (date === undefined) {
		return false;
	}
	if (date < currDate) {
		return false;
	}
	return true;
}

let comments = exports = module.exports;

/**
 * Function takes a forumUser object and insert user into MongoDB
 *
 * @params {object} forumUser  object
 * @returns  Promise with success if inserted recipe into DB and return
 *			 recipe object; otherwise, return reject Promise with error
 */
comments.getAllComments = (commentData) => {
	return new Promise(async (success, reject) => {
		if ((commentData === undefined) || (typeof(commentData) !== "object")) {
			return reject("Failed to create comment. Please try again later...");
		}
		const eventId = commentData.eventId;
    
		if (!isValidString(eventId)) {
			return reject("Invalid event ID");
		}
		// Fetch comments
		try {
      const eventColl = await EventCollection();
      eventColl.findOne(
				{_id: eventId},
				(err, eventItem) => {
					if (err) {
						console.error(err);
						return reject('Unable to get comment. Please try again later...');
					}
					if (!eventItem) {
						return reject(`Invalid event id "${eventId}"`);
					}
					return success(eventItem.comments);
				}
			);
		} catch (err) {
      console.error(err);
      return reject(err);
    }
	});
}

comments.getCommentById = (commentData) => {
	return new Promise(async (success, reject) => {
		if ((commentData === undefined) || (typeof(commentData) !== "object")) {
			return reject("Failed to create comment. Please try again later...");
    }
    const eventId = commentData.eventId;
		const commentId = commentData.commentId;
    
		if (!isValidString(eventId)) {
			return reject("Invalid event ID");
    }
    if (!isValidString(commentId)) {
			return reject("Invalid comment ID");
		}
		// Fetch comments
		try {
      const eventColl = await EventCollection();
      eventColl.findOne(
        {
          _id: eventId,
          "comments._id": commentId,
        },
        (err, result) => {
          if (err) {
            return reject(err);
          }
          if (!result) {
            return reject("Fail to find comment with matching comment id");
          }
          result.comments.forEach(currComment => {
            if (currComment._id === commentId) {
              return success(currComment);
            }
          });
          return reject("Fail to find comment with matching comment id");
        }
      );
		} catch (err) {
      console.error(err);
      return reject(err);
    }
	});
}

comments.addComment = (commentData) => {
  return new Promise(async (success, reject) => {
		if ((commentData === undefined) || (typeof(commentData) !== "object")) {
			return reject("Failed to create comment. Please try again later...");
    }
    const eventId = commentData.eventId;
    const userId = commentData.userId;
		const comment = xss(commentData.comment);
    const currDate = Math.round(new Date().getTime() / 1000);
    
		if (!isValidString(comment)) {
			return reject("Please fill in a comment");
		}
		const _comment = {
			_id: uuidV4(),
      comment: comment,
      userId: userId,
      createdAt: currDate,
    };
		try {
      const eventColl = await EventCollection();
      const updatedEvent = await eventColl.update(
        { _id: eventId },
        { $push: { comments: _comment }}
      );
      return success(commentData);
		} catch (err) {
      console.error(err);
      return reject(err);
    }
	});
}

comments.editComment = (commentData) => {
	return new Promise(async (success, reject) => {
    if ((commentData === undefined) || (typeof(commentData) !== "object")) {
			return reject("Failed to update comment. Please try again later...");
		}
    // Can only update 
    const eventId = commentData.eventId;
    const commentId = commentData.commentId;
    const userId = commentData.userId;
    const comment = xss(commentData.comment);
    if (!isValidString(eventId)) {
      return reject('Invalid forum id');
    }
    if (!isValidString(commentId)) {
      return reject('Invalid comment id');
    }
    if (!isValidString(userId)) {
      return reject('Invalid user id');
    }
    if (!isValidString(comment)) {
      return reject('Invalid comment');
    }
    // Update comment
    try {
      const existingComment = await comments.getCommentById(commentData);
      if (existingComment.userId !== userId) {
        return reject("Fail to find comment with matching comment id and user id");
      }
      const eventColl = await EventCollection();
      eventColl.update(
        {
          _id: eventId,
          comments: {
            $elemMatch: {
              _id: commentId,
              userId: userId,
            },
          },
          // "comments._id": commentId,
          // "comments.userId": userId,
        },
        {
          $set: {
            "comments.$.comment": comment,
          },
        },
        (err, updateInfo) => {
          if (err) {
            return reject(err);
          }
          const result = updateInfo.result;
          if (result.n < 1) {
            return reject("Unable find comment with matching comment id");
          }
          if (result.nModified < 1) {
            return reject("Fail to update comment");
          }
          return success(commentData);
        }
      )
    } catch (e) {
      console.error(e);
      return reject(e);
    }
	});
}

comments.deleteComment = (commentData) => {
	return new Promise(async (success, reject) => {
		if ((commentData === undefined) || (typeof(commentData) !== "object")) {
			return reject("Failed to create event. Please try again later...");
    }
    const eventId = commentData.eventId;
    const commentId = commentData.commentId;
    const userId = commentData.userId;
    if (!isValidString(eventId)) {
      return reject('Invalid event id');
    }
    if (!isValidString(commentId)) {
        return reject('Invalid comment id');
    }
    if (!isValidString(userId)) {
        return reject('Invalid user id');
    }
    // Delete event
		try {
			const eventColl = await EventCollection();
			eventColl.update(
        {_id: eventId},
        {
          $pull: {
            comments: {
                _id: commentId,
                userId: userId,
            },
          },
        },
        (err, updateInfo) => {
          if (err) {
              return reject(err);
          }
          const result = updateInfo.result;
          if (result.n < 1) {
            return reject("Unable find comment with matching comment id");
          }
          if (result.nModified < 1) {
            return reject("Fail to remove comment");
          }
          return success(commentData);
        }
      );
		} catch (err) {
			return reject(err);
		}
	});
}
