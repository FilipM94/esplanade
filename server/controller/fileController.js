const express = require("express");
const router = express.Router();
const fileService = require("../services/fileService");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/upload", authenticateToken, fileService.upload);
router.get("/download/:fileName", authenticateToken, fileService.download);
router.delete(
  "/delete/:tableName/:fileName",
  authenticateToken,
  fileService.delete
);

module.exports = router;
