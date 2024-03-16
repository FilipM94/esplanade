const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/list", authenticateToken, userService.list);
router.get("/:id", authenticateToken, userService.get);
router.post("/", userService.save);
router.put("/:id", authenticateToken, userService.update);
router.delete("/:id", authenticateToken, userService.delete);
router.put("/changeActive/:id", authenticateToken, userService.changeActive);

module.exports = router;
