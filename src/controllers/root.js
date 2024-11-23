const path = require('path');

const getRootHandler = () => async (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
};

module.exports = { getRootHandler };
