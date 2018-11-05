// Node Modules
const uuidV4 = require("uuid/v4");
const xss = require("xss");
// Custom Node Modules
const EventCollection = require("../config/mongoCollections").events;
const elasticSearchClient = require("../config/elasticConnection");

const elasticIndex = "event";

elasticSearchClient.indices.create({  
  index: elasticIndex,
}, (err, resp, status) => {
  if (err && resp.error.type !== "resource_already_exists_exception") {
		console.error("Elastic Search status:", status)
		console.error("Something went wrong with Elastic Search");
		throw JSON.stringify(resp);
  } else {
    console.log("created index", elasticIndex);
  }
});

function isValidString(str) {
	if ((str === undefined) || (typeof(str) !== "string") || (str.length <= 0)) {
		return false;
	}
	return true;
}

function isValidDate(date) {
	const currDate = new Date().getTime() / 1000;
	if (date === undefined) {
		return false;
	}
	if (date < currDate) {
		return false;
	}
	return true;
}

function isValidLocation(location) {
	if ((location === undefined) || (typeof(location) !== "object")) {
		return false;
	}
	if (!location.hasOwnProperty("longitude")
		|| !location.hasOwnProperty("latitude")) {
		return false
	}
	return true;
}

let events = exports = module.exports;

/**
 * Function takes a forumUser object and insert user into MongoDB
 *
 * @params {object} forumUser  object
 * @returns  Promise with success if inserted recipe into DB and return
 *			 recipe object; otherwise, return reject Promise with error
 */
events.createEvent = (eventData) => {
	return new Promise(async (success, reject) => {
		if ((eventData === undefined) || (typeof(eventData) !== 'object')) {
			return reject("Failed to create event. Please try again later...");
		}
		const eventName = xss(eventData.name);
    const eventDescription = xss(eventData.description);
    const eventDate = eventData.eventAt;
    const eventLocation = eventData.location; // {longitude: Number, latitude: Number}
		const eventLocationName = xss(eventData.locationName);
		const eventCreator = eventData.creatorId;
    
		if (!isValidString(eventName)) {
			return reject("Please fill in an event name");
		}
		if (!isValidDate(eventDate)) {
			return reject("Please fill in a data for event in future");
    }
    if (!isValidLocation(eventLocation)) {
      return reject("Please fill in valid location with longitude and latitude");
		}
		if (!isValidString(eventLocationName)) {
      return reject("Please fill in valid location name");
    }
		const _event = {
			_id: uuidV4(),
			name: eventName,
			description: eventDescription,
			date: eventDate,
			location: eventLocation,
			locationName: eventLocationName,
      creatorId: eventCreator,
      comments: [],
      userGoing: [], // List of user id
    };
    // Create event
		try {
      const eventColl = await EventCollection();
      eventColl.insertOne(_event, async (err, result) => {
        if (err) {
          return reject(err);
        }
        const insertResult = result.result;
        if ((!insertResult.ok) || (insertResult.n !== 1)) {
          return reject('Fail to create event');
        }
        try {
					const newEvent = await events.getEventById(_event._id);
					const { _id, ...elasticEvent } = newEvent;
					await elasticSearchClient.index({
            index: elasticIndex,
						id: _event._id,
						type: "event",
            body: elasticEvent,
        	});
          return success(newEvent);
        } catch (e) {
          return reject(e);
        }
      });
		} catch (err) {
      console.error(err);
      return reject(err);
    }
	});
}

events.getAllEvents = () => {
	return new Promise(async (success, reject) => {
    // Fetch events
		try {
			const eventColl = await EventCollection();
			const events = eventColl.find({}).toArray();
			return success(events);
		} catch (err) {
      console.error(err);
      return reject(err);
    }
	});
}

events.getEventById = (eventId) => {
	return new Promise(async (success, reject) => {
		if ((eventId === undefined) || (typeof(eventId) !== 'string')) {
			return reject("Failed to get event. Please try again later...");
		}
		if (!isValidString(eventId)) {
			return reject("Need id to fetch event");
    }
    // Fetch event
		try {
      const eventColl = await EventCollection();
      eventColl.findOne(
				{_id: eventId},
				(err, eventItem) => {
					if (err) {
						console.error(err);
						return reject('Unable to get event. Please try again later...');
					}
					if (!eventItem) {
						return reject(`Invalid event id "${eventId}"`);
					}
					return success(eventItem);
				}
			);
		} catch (err) {
      console.error(err);
      return reject(err);
    }
	});
}

events.updateEvent = (updatedEventData) => {
	return new Promise(async (success, reject) => {
    // Can only update 
    let newEvent = {}
		const eventId = updatedEventData.id;
		const userId = updatedEventData.userId;
    const eventName = xss(updatedEventData.name);
    const eventDescription = xss(updatedEventData.description);
    const eventDate = updatedEventData.eventAt;
		const eventLocation = updatedEventData.location; // {longitude: Number, latitude: Number}
		const eventLocationName = xss(updatedEventData.locationName);

		if (!isValidString(eventName)) {
			return reject("Invalid event name");
    }
    if (!isValidDate(eventDate)) {
			return reject("Invalid event date");
    }
    if (!isValidLocation(eventLocation)) {
			return reject("Invalid event location");
		}
		const _updatedEvent = {
			name: eventName,
			description: eventDescription,
			date: eventDate,
			location: eventLocation,
			locationName: eventLocationName,
    };
    // Update event
		try {
			const eventColl = await EventCollection();
			eventColl.update(
				{_id: eventId, creatorId: userId},
				{$set: _updatedEvent},
				async (err, updateInfo) => {
					if (err) {
						return reject(err);
					}
					const result = updateInfo.result;
					if (result.n === 0) {
						return reject("Did not find event with matching id");
					}
					if ((!result.ok) || (result.nModified < 1)) {
						return reject("Failed to update event");
					}
					try {
						const eventItem = await events.getEventById(eventId);
						const { _id, ...elasticEvent } = eventItem;
						await elasticSearchClient.index({
							index: elasticIndex,
							id: eventId,
							type: "event",
							body: elasticEvent,
						});
						return success(eventItem);
					} catch (err) {
						return reject(err);
					}
				}
			);
		} catch (err) {
			return reject(err);
		}
	});
}

events.deleteEvent = (eventId, userId) => {
	return new Promise(async (success, reject) => {
		if ((eventId === undefined) || (typeof(eventId) !== 'string')) {
			return reject("Failed to create event. Please try again later...");
		}
    if (!isValidString(eventId)) {
			return reject("Invalid event id to delete")
    }
    // Delete event
		try {
			const eventColl = await EventCollection();
			eventColl.removeOne(
				{_id: eventId, creatorId: userId},
				async (err, deletedInfo) => {
					if (err) {
						return reject(err);
					}
					if (deletedInfo.deletedCount < 1) {
						return reject("Could not delete event with matching id");
					}
					await elasticSearchClient.deleteByQuery({
						index: elasticIndex, 
						body: {
							query: {
								ids: { values: eventId },
							},
						},
					});
					return success(eventId);
				}
			);
		} catch (err) {
			return reject(err);
		}
	});
}

events.joinEvent = (eventData) => {
	return new Promise(async (success, reject) => {
		if ((eventData === undefined) || (typeof(eventData) !== 'object')) {
			return reject("Failed to create event. Please try again later...");
		}
		const eventId = eventData.id;
		const userId = eventData.userId;
    if (!isValidString(eventId)) {
			return reject("Invalid event id to add user")
		}
		if (!isValidString(userId)) {
			return reject("Invalid user id to remove from participants")
    }
    // Delete event
		try {
			const eventColl = await EventCollection();
			eventColl.update(
				{ _id: eventId },
				{ '$addToSet': { "userGoing": userId } },
				async (err, updateInfo) => {
					if (err) {
						return reject(err);
					}
					const result = updateInfo.result;
					if (result.n < 1) {
						return reject('Unable find event with matching id');
					}
					if (result.nModified < 1) {
						return reject('Fail to update user going to event');
					}
					try {
						const eventItem = await events.getEventById(eventId);
						const { _id, ...elasticEvent } = eventItem;
						await elasticSearchClient.index({
							index: elasticIndex,
							id: eventId,
							type: "event",
							body: elasticEvent,
						});
						return success(eventItem);
					} catch (err) {
						return reject(err);
					}
				}
			);
		} catch (err) {
			return reject(err);
		}
	});
}

events.leaveEvent = (eventData) => {
	return new Promise(async (success, reject) => {
		if ((eventData === undefined) || (typeof(eventData) !== 'object')) {
			return reject("Failed to create event. Please try again later...");
		}
		const eventId = eventData.id;
		const userId = eventData.userId;
    if (!isValidString(eventId)) {
			return reject("Invalid event id to add user")
		}
		if (!isValidString(userId)) {
			return reject("Invalid user id to remove from participants")
    }
    // Delete event
		try {
			const eventColl = await EventCollection();
			eventColl.update(
				{ _id: eventId },
				{ '$pull': { "userGoing": userId } },
				async (err, updateInfo) => {
					if (err) {
						return reject(err);
					}
					const result = updateInfo.result;
					if (result.n < 1) {
						return reject('Unable find event with matching id');
					}
					if (result.nModified < 1) {
						return reject('Fail to update user going to event');
					}
					try {
						const eventItem = await events.getEventById(eventId);
						const { _id, ...elasticEvent } = eventItem;
						await elasticSearchClient.index({
							index: elasticIndex,
							id: eventId,
							type: "event",
							body: elasticEvent,
						});
						return success(eventItem);
					} catch (err) {
						return reject(err);
					}
				}
			);
		} catch (err) {
			return reject(err);
		}
	});
}
