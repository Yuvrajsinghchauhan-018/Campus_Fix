const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const fixAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if authority exists
    let authority = await User.findOne({ email: 'authority@campusfix.com' });
    
    if (authority) {
       console.log("Authority exists. Updating password...");
       // We must explicitly set the password and save to trigger the pre-save hook for hashing!
       authority.password = 'Authority@123';
       await authority.save();
       console.log("Successfully reset Authority password.");
    } else {
       console.log("Authority does not exist. Creating...");
       await User.create({
         name: 'College Authority',
         email: 'authority@campusfix.com',
         password: 'Authority@123',
         role: 'authority',
         isApproved: true,
         approvalStatus: 'approved'
       });
       console.log("Successfully created Authority account.");
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fixAuth();
