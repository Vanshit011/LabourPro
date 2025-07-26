const crypto = require("crypto");

const generateCompanyId = () => {
  return "CMP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

module.exports = generateCompanyId;
