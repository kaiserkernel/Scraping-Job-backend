const Job = require('../models/Job');

module.exports = async function checkDuplicate(hash) {
  return await Job.exists({ hash });
};
