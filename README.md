# EvenTinder (renamed to MeeTinder)

## Overview
This web application is to allow users to create and join events that meet their interests. Users should be able to meet other people who share common interests as well as efficiently search for events based on popularity and location.

This web application brings transparency to the users by allowing users to communicate through the platform to learn more about the events.


## Summary
  - Allow posting events
    + Post general info, time, and place for event
    + Google Map
    + Can post comments to event
  - View all events on platform as well as own events created

## Features
  - User Creation
    - Login/Signup
    - Edit profile
  - Event View/Creation
    - Can view own and other events
    - Can create new events
      + Can communicate in chat thread per event
    - Can "join" events

## Nice to Have Features
  - If I have time to implement these features:
    + Create live chat per event
      + Store a "chat" id per event that people can join for live chat

## Tech
  - React - Build out UI
  - Typescript - JS/JSX logic conversion to TS and TSX
  - Worker - Handle DB CRUD operations

## External Tech
  - Parcel: Web Bundler
    + Web bunlder similar to Webpack. Will use it to "compile" and package my JS files
  - Google Maps: Does this count as an external tech
    + Allow users to interact with visual map to set location when creating event
    + Storing corrdinate in DB and use reverse geocode with Google Maps API to get location in human-readable string
  - Elastic Search
    + Allow user to search for event with keywords
      + Search in event name, tags, description

## Nice to have external tech
  - RabbitMQ

## Credentials:
Username: Nick
Password: password1

## How to run:
  1) brew install mongodb (using V3.6.5)
  2) brew install redis (cli v 4.0.9)
  3) brew install elasticsearch (cli v 4.0.9)
  4) brew services start mongodb redis elasticsearch
  5) npm install -g gulp (using local v3.9.1)
  6) npm install -g parcel-bundler (using v1.9.6)
  7) npm install
  8) gulp
  9) npm run seed
  10) npm start
  11) Visit: localhost:3000

### Note
  - If having issue installing npm package, bcrypt, run:
    + Need to set python path to use Python 2
  ```
  If node-gyp is called by way of npm, and you have multiple versions of Python installed, then you can set npm's 'python' config key to the appropriate value:

  $ npm config set python /path/to/executable/python2.7
  ```
