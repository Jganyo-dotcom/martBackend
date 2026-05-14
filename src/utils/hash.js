const bcrypt = require("bcrypt");

async function hashData(data, saltRounds = 10) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashed = await bcrypt.hash(data, salt);
  return hashed;
}

async function compareData(data, hashed) {
  return await bcrypt.compare(data, hashed);
}

module.exports = { hashData, compareData };
