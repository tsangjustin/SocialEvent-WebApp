const router = require('express').Router();
// Custom Node Helper
const publishMessage = require("../../worker/publisher-shim");
const Channels = require("../../channel");

router.get("/", (req, res) => {
	if (!req.user) {
		return res
			.status(401)
			.json({ error: "Not authorized" });
	}
	const userInfo = {
		_id: req.user._id,
		avatar: req.user.avatar,
		username: req.user.username,
		email: req.user.email,
		isMale: req.user.isMale,
	};
	return res.json({ user: userInfo });
});

router.get("/all", async (req, res) => {
  try {
    const resp = await publishMessage(
      Channels.event.Profile,
      Channels.action.GetAllProfile,
      {},
      true,
    );
    const cleanedUser = resp.message.map(u => ({
      _id: u._id,
      avatar: u.avatar,
      username: u.username,
      email: u.email,
      isMale: u.isMale,
    }));
    return res.json({ users: cleanedUser });
  } catch (e) {
    return res.json(e);
  }
});

router.put("/", async (req, res) => {
    if (!req.user) {
		  return res
        .status(401)
        .json({ error: "Not authorized" });
    }
    const data = {
      ...req.body,
      _id: req.user._id,
    };
    try {
      const resp = await publishMessage(
        Channels.event.Profile,
        Channels.action.EditProfile,
        data,
        true,
      );
      const updatedUser = resp.message;
      req.logout();
      req.logIn(updatedUser, function(err) {
        if (err) {
          return res.status(401).json({ error: err });
        }
        const userInfo = {
          _id: updatedUser._id,
          avatar: updatedUser.avatar,
          username: updatedUser.username,
          email: updatedUser.email,
          isMale: updatedUser.isMale,
        };
        return res.json({ user: userInfo });
      });
    } catch (e) {
      return res.status(500).json(e);
    }
});

module.exports = exports = router;
