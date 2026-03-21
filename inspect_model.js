const mongoose = require('mongoose');
const User = require('./backend/models/User');

console.log('User Model Enum:', User.schema.paths.role.enumValues);
process.exit();
