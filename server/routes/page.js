const router = require("express").Router();
const path = require("path");

router.get("/", async (req, res) => {
  return res.redirect("/app");
});

router.get('/app*', async (req, res) => {
  return res.sendFile(
    "index.html",
    {root: path.join(__dirname, "../../dist")},
  );
});

module.exports = exports = router;