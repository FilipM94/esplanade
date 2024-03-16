const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const userController = require("./controller/userController");
const authController = require("./controller/authController");
const fileController = require("./controller/fileController");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Povezivanje s bazom podataka
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Rute
app.use("/api/auth", authController);
app.use("/api/user", userController);
app.use("/api/file", fileController);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
