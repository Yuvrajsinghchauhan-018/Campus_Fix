const mongoose = require('mongoose');
const User = require('./models/User');

console.log('User Model Enum:', User.schema.paths.role.enumValues);
process.exit();
