const User = require("../models/userModel");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  console.log("AuthService.register");
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Provjera postoji li korisnik s istim e-mailom
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Korisnik s tim e-mailom već postoji." });
    }

    // Hashiranje lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Stvaranje novog korisnika
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    });

    // Generiranje accessTokena
    const accessToken = jwt.sign({ userId: newUser.id }, config.secret, {
      expiresIn: "1h"
    });

    // Generiranje refreshTokena
    const refreshToken = jwt.sign(
      { userId: newUser.id },
      config.refreshSecret,
      { expiresIn: "7d" }
    );

    res.json({
      accessToken,
      refreshToken,
      userData: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška prilikom registracije." });
  }
};

exports.login = async (req, res) => {
  console.log("AuthService.login");
  try {
    const { email, password } = req.body;

    // Pronađi korisnika po e-mailu
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Pogrešan e-mail ili lozinka." });
    }

    // Provjera lozinke
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Pogrešan e-mail ili lozinka." });
    }

    // Generiranje accessTokena
    const accessToken = jwt.sign({ userId: user.id }, config.secret, {
      expiresIn: "1h"
    });

    // Generiranje refreshTokena
    const refreshToken = jwt.sign({ userId: user.id }, config.refreshSecret, {
      expiresIn: "7d"
    });

    res.json({
      accessToken,
      refreshToken,
      userData: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška prilikom prijave." });
  }
};

exports.refreshToken = async (req, res) => {
  console.log("AuthService.refreshToken", req.body);
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).json({ error: "Nedostaje refreshToken" });
  }

  jwt.verify(refreshToken, config.refreshSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Neispravan refreshToken" });
    }

    // Ako je refreshToken ispravan, generiraj novi accessToken
    const newAccessToken = jwt.sign({ userId: decoded.userId }, config.secret, {
      expiresIn: "1h"
    });

    res.json({ accessToken: newAccessToken, refreshToken });
  });
};
