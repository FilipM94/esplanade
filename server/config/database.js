const { Sequelize } = require("sequelize");

// Konfiguracija za povezivanje s PostgreSQL bazom podataka
const sequelize = new Sequelize("esplanade", "postgres", "0000", {
  host: "localhost", // Host baznog servera
  dialect: "postgres", // Korištena baza podataka
  logging: false // Isključivanje SQL logging-a
});

// Provjera veze s bazom podataka
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

module.exports = sequelize;
