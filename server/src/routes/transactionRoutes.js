const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { list, create, update, remove } = require("../controllers/transactionController");

router.use(authMiddleware);

router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;