const User = require("../models/userModel");
const { getWhereCondition } = require("../utilits/utils");
const bcrypt = require("bcryptjs");

exports.get = async (req, res) => {
  console.log("UserService.get", req.params.id);
  try {
    const userId = req.params.id;

    let attributes = ["id", "email", "firstName", "lastName", "role", "active"];

    const user = await User.findByPk(userId, {
      attributes: attributes
    });

    if (!user) {
      return res.status(404).json({ error: "Korisnik nije pronađen." });
    }

    res.json(user);
  } catch (error) {
    console.log("UserService.get", error);
    res.status(500).json({ error: error.message });
  }
};

exports.list = async (req, res) => {
  console.log("UserService.list", req.query);
  try {
    const { limit = 10, offset = 0, filter, sort, sortColumn } = req.query;

    let attributes = ["id", "email", "firstName", "lastName", "role", "active"];
    let whereCondition = getWhereCondition(filter);

    const sortDirection =
      sort && sort.toLowerCase() === "desc" ? "DESC" : "ASC";
    const orderBy = sortColumn || "id";

    const users = await User.findAll({
      where: whereCondition,
      attributes,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderBy, sortDirection]]
    });

    const countResult = await User.count({
      where: whereCondition
    });

    res.json({ count: countResult, content: users });
  } catch (error) {
    console.log("UserService.list", error);
    res.status(500).json({ error: "Greška prilikom dohvaćanja korisnika." });
  }
};

exports.save = async (req, res) => {
  console.log("UserService.save", req.body);
  try {
    const { email, password, firstName, lastName, role, active } = req.body;

    // Hashiranje lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      active
    });

    const { password: omit, ...returnUser } = newUser.dataValues;
    res.status(201).json(returnUser);
  } catch (error) {
    console.log("UserService.save", error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  console.log("UserService.update", req.body);
  try {
    const userId = req.params.id;
    const { email, firstName, lastName, role, active } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Korisnik nije pronađen." });
    }

    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.active = active || user.active;

    await user.save();

    const { password: omit, ...returnUser } = user.dataValues;
    res.json(returnUser);
  } catch (error) {
    console.log("UserService.update", error);
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  console.log("UserService.delete", req.params.id);
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Korisnik nije pronađen." });
    }

    await user.destroy();

    res.json({ message: "Korisnik uspješno obrisan." });
  } catch (error) {
    console.log("UserService.delete", error);
    res.status(500).json({ error: error.message });
  }
};

exports.changeActive = async (req, res) => {
  console.log("UserService.changeActive", req.body);
  try {
    const userId = req.params.id;
    const { active } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Korisnik nije pronađen." });
    }

    user.active = active;
    await user.save();

    res.json({
      message: "Status aktivnosti korisnika je uspješno promijenjen."
    });
  } catch (error) {
    console.log("UserService.changeActive", error);
    res.status(500).json({ error: error.message });
  }
};
