const dbConnection = require("../server/config/mongoConnection");
const elasticClient = require("../server/config/elasticConnection");
const userData = require('../server/db').user;
const eventData = require('../server/db').event;
const commentData = require('../server/db').comment;

async function runSeed() {
  try {
    const dbConn = await dbConnection();
    const db = dbConn.db("events-db");
    await db.dropDatabase();
    const eventIndexExist = await elasticClient.indices.exists({
      index: "event",
    });
    if (eventIndexExist) {
      await elasticClient.indices.delete({
        index: "event",
      });
    }
    // Create users
    const user1 = await userData.createUser({
      username: "Nick",
      password: ["password1", 'password1'],
      email: 'phil@stevens.edu',
      gender: 'male',
    });
    const user2 = await userData.createUser({
      username: "Schmidt",
      password: ["123", '123'],
      email: 'justin@gmail.com',
      gender: 'male',
    });
    await userData.createUser({
      username: "Jess",
      password: ["1", '1'],
      email: 'steph@gmail.com',
      gender: 'female',
    });
    // Create event
    const event1 = await eventData.createEvent({
      name: "True American",
      description: "The floor is lava",
      eventAt: 1536096650,
      location: {
        latitude: 40.745635,
        longitude: -74.0293937
      },
      locationName: "11th St Sinatra Drive Hoboken, NJ",
      creatorId: user1._id,
    });
    // Add comment to event
    await commentData.addComment({
      eventId: event1._id,
      userId: user1._id,
      comment: "FDR!!!",
    });
    // Add user to event
    await eventData.joinEvent({
      id: event1._id,
      userId: user1._id,
    });
    await eventData.joinEvent({
      id: event1._id,
      userId: user2._id,
    });
    await dbConn.close();
    console.log("Done seeding database");
  } catch (err) {
    console.error("Error:", err);
  }
}

runSeed();
