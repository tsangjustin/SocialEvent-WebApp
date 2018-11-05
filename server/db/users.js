// Node Modules
const bcrypt = require("bcrypt");
const uuidV4 = require("uuid/v4");
const xss = require("xss");
// Custom Node Modules
const UserCollection = require("../config/mongoCollections").users;

/**
 * Function checks that a string given is string with some number of
 * characters
 *
 * @params  {string} str string value to check for validity
 * @return  true if the string is valid; otherwise, return false
 */
function isValidString(str) {
	if ((str === undefined) || (typeof(str) !== "string") || (str.length <= 0)) {
		return false;
	}
	return true;
}

function isMatchingPassword(passwordList) {
	if (passwordList && Array.isArray(passwordList) && (passwordList.length == 2)) {
		for (let p = 0; p < 2; p++) {
			if (!isValidString(passwordList[p])) {
				return false;
			}
		}
		if (passwordList[0] === passwordList[1]) {
			return true;
		}
	}
	return false;
}

let user = exports = module.exports;

/**
 * Function takes a eventUser object and insert user into MongoDB
 *
 * @params {object} eventUser  object
 * @returns  Promise with success if inserted recipe into DB and return
 *			 recipe object; otherwise, return reject Promise with error
 */
user.createUser = (eventUser) => {
	return new Promise(async (success, reject) => {
		if ((eventUser === undefined) || (typeof(eventUser) !== 'object')) {
			return reject("Failed to create user. Please try again later...");
		}
		const username = xss(eventUser.username);
		const password = eventUser.password;
		const avatar = xss(eventUser.avatar) || '/dist/image/avatar.png';
		const email = xss(eventUser.email);
		const gender = eventUser.gender;
		if (!isValidString(username)) {
			return reject("Please fill in a username");
		}
		if (!isMatchingPassword(password)) {
			return reject("Passwords don't match");
		}
		if (!isValidString(email)) {
			return reject("Please fill in a email");
		}
		if (!isValidString(gender)) {
			return reject("Please fill in a gender");
		}
		if (!['male', 'female'].includes(gender)) {
			return reject("Gender must be male or female");
		}
		const isMale = gender.toLowerCase() === "male";
		const _user = {
			_id: uuidV4(),
			username,
			password: bcrypt.hashSync(password[0], 10),
			avatar,
			email,
			isMale,
	  	};
		try {
			const existingUser = await user.getUser(username);
			if (existingUser) {
				return reject('Username already exists');
			}
		} catch (err) {
			try {
				const userColl = await UserCollection();
				userColl.insertOne(_user, async (err, result) => {
					if (err) {
						return reject(err);
					}
					const insertResult = result.result;
					if ((!insertResult.ok) || (insertResult.n !== 1)) {
						return reject('Fail to insert user');
					}
					try {
						const newUser = await user.getUserById(_user._id);
						return success(newUser);
					} catch (e) {
						return reject(e);
					}
				});
			} catch (err) {
				console.error(err);
				return reject('Unable to create account. Please try again later...');
			}
		}
	});
}

user.getAllUsers = () => {
	return new Promise(async (fulfill, reject) => {
		try {
			const userColl = await UserCollection();
			const users = userColl.find({}).toArray();
			return fulfill(users);
		} catch (err) {
			console.error(err);
			return reject('Unable to get users. Please try again later...');
		}
	});
}

/**
 * Function gets single query of matching _id
 *
 * @params {string} id of recipe _id
 * @returns  Promise with success if queried a matching recipe; otherwise,
 * 			 return reject with error
 */
user.getUser = (username) => {
	return new Promise(async (fulfill, reject) => {
		if (!isValidString(username)) {
			return reject("Invalid username");
		}
		try {
			const userColl = await UserCollection();
			userColl.findOne(
				{username: username},
				(err, userItem) => {
					if (err) {
						console.error(err);
						return reject('Unable to get account. Please try again later...');
					}
					if (!userItem) {
						return reject('Invalid username');
					}
					return fulfill(userItem);
				}
			);
		} catch (err) {
			console.error(err);
			return reject('Unable to get account. Please try again later...');
		}
	});
}

/**
 * Function gets single query of matching _id
 *
 * @params {string} id of recipe _id
 * @returns  Promise with success if queried a matching recipe; otherwise,
 * 			 return reject with error
 */
user.getUserById = (id) => {
	return new Promise(async (success, reject) => {
		if (!isValidString(id)) {
			return reject("Invalid id to get user");
		}
		try {
			const userColl = await UserCollection();
			userColl.findOne(
				{_id: id},
				(err, userItem) => {
					if (err) {
						return reject(err);
					}
					if (!userItem) {
						return reject('Did not find user with matching id');
					}
					return success(userItem);
				}
			);
		} catch (err) {
			return reject(err);
		}
	});
}

/**
 * Function updates the user data for given id
 *
 * @param {string} id user id
 * @param {object} userData object of new user data for given id
 */
user.updateUser = (id, userData) => {
	return new Promise(async (fulfill, reject) => {
		if (!isValidString(id)) {
			return reject("Invalid user id to update");
		}
		if ((userData === undefined) || (typeof(userData) !== "object")) {
			return reject("Nothing to change for user");
		}
		let newUser = {};
		if (isValidString(userData.username)) {
			newUser.username = xss(userData.username);
		}
		if (isValidString(userData.avatar)) {
			newUser.avatar = xss(userData.avatar);
		}
		if (isValidString(userData.email)) {
			newUser.email = xss(userData.email);
		}
		if ((isValidString(userData.gender)) && (["male", "female"].includes(userData.gender.toLowerCase()))) {
			newUser.isMale = userData.gender === "male";
		}
		if ((Object.keys(newUser).length <= 0) || (typeof(newUser) !== "object")) {
			return reject("Found nothing to update for user");
		}
		try {
			const userColl = await UserCollection();
			userColl.update(
				{_id: id},
				{$set: newUser},
				async (err, updateInfo) => {
					if (err) {
						return reject(err);
					}
					const result = updateInfo.result;
					if (result.n === 0) {
						return reject("Did not find user with matching id");
					}
					if ((!result.ok) || (result.nModified < 1)) {
						return reject('Failed to update user');
					}
					try {
						const updatedUser = await user.getUserById(id);
						return fulfill(updatedUser);
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

user.deleteUser = (id) => {
	return new Promise(async (fulfill, reject) => {
		if (!isValidString(id)) {
			return reject("Invalid id to get delete user");
		}
		try {
			const userColl = await UserCollection();
			userColl.removeOne({_id: id}, (err, deletedInfo) => {
				if (err) {
					return reject(err);
				}
				if (deletedInfo.deletedCount < 1) {
					return reject('Could not find user with matching id to delete');
				}
				return fulfill(id);
			});
		} catch (err) {
			return reject(err);
		}
	});
}

/**
 * Function returns the avatar for the given id
 * @params {string} id of the user from the DB
 * @returns string of the string for the avatar of the user; otherwise, return reject if invalid id or can't find user with given id
 */
user.getAvatar = (id) => {
	return new Promise(async (fulfill, reject) => {
		if (!isValidString(id)) {
				return reject('Invalid id to get avatar');
		}
		try {
			const userColl = await UserCollection();
			userColl.findOne(
				{_id: id},
				(err, userInfo) => {
					if (err) {
							return reject('Unable to get account. Please try again later...');
					}
					if (!userInfo || (!userInfo.hasOwnProperty("avatar"))) {
							return reject('Invalid id');
					}
					return fulfill(userInfo.avatar);
				}
			);
		} catch (err) {
			return reject(err);
		}
	});
}
