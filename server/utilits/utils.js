const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const config = require("../config/config");

// Enumerator za uvjete filtriranja
const filterConditions = {
  equals: Op.eq,
  notEquals: Op.ne,
  is: Op.is,
  isNot: Op.not,
  or: Op.or,
  bigger: Op.gt,
  biggerEquals: Op.gte,
  smaller: Op.lt,
  smallerEquals: Op.lte,
  between: Op.between,
  notBetween: Op.notBetween,
  in: Op.in,
  notIn: Op.notIn,
  like: Op.like,
  notLike: Op.notLike,
  startsWith: Op.startsWith,
  endsWith: Op.endsWith,
  iLike: Op.iLike,
  notILike: Op.notILike
};

const getFilterConditions = (condition) => {
  const translatedCondition = filterConditions[condition];

  if (translatedCondition) {
    return translatedCondition;
  } else {
    throw new Error("Neispravan uvjet za filtriranje.");
  }
};

const getValue = (item) => {
  if (["iLike", "notILike", "like", "notLike"].includes(item.condition)) {
    return "%" + item.value + "%";
  } else if (["startsWith"].includes(item.condition)) {
    return item.value + "%";
  } else if (["endsWith"].includes(item.condition)) {
    return "%" + item.value;
  } else {
    return item.value;
  }
};

const getWhereCondition = (filter) => {
  let whereCondition = {};

  if (filter && filter.length > 0) {
    const conditions = JSON.parse(filter);
    whereCondition = {
      [Op.and]: conditions.flatMap((item) => {
        if (item.field.includes(",")) {
          const fields = item.field.split(",").map((field) => field.trim());
          return {
            [Op.or]: fields.map((field) => {
              return {
                [field]: {
                  [getFilterConditions(item.condition)]: getValue(item)
                }
              };
            })
          };
        } else {
          return {
            [item.field]: {
              [getFilterConditions(item.condition)]: getValue(item)
            }
          };
        }
      })
    };
  }

  return whereCondition;
};

const getUserIdFromToken = (req) => {
  try {
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, config.secret);
    const userId = decoded.userId;
    return userId;
  } catch (error) {
    // Token nije valjan ili je istekao
    console.error("Error decoding token:", error.message);
    return null;
  }
};

const getRoleFromToken = (req) => {
  try {
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, config.secret);
    const role = decoded.role;
    return role;
  } catch (error) {
    // Token nije valjan ili je istekao
    console.error("Error decoding token:", error.message);
    return null;
  }
};

module.exports = { getWhereCondition, getUserIdFromToken };
