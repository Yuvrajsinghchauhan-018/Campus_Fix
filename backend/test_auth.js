const axios = require('axios');
const crypto = require('crypto');

async function test() {
  try {
    const r = crypto.randomBytes(4).toString('hex');
    const email = `testuser${r}@gmail.com`;
    const collegeId = `ID${r}`;
    const password = 'password123';
    
    // Register
    console.log("Registering:", email);
    let res = await axios.post('http://localhost:5000/api/auth/register', {
      role: 'student',
      name: 'Test User',
      email: email,
      collegeId: collegeId,
      phone: `99${Math.floor(Math.random() * 100000000)}`,
      gender: 'Male',
      password: password
    });
    console.log("Register Success:", res.data);

    // Login with Email
    console.log("Logging in with email:", email);
    res = await axios.post('http://localhost:5000/api/auth/login', {
      role: 'student',
      email: email,
      password: password
    });
    console.log("Login (Email) Success:", res.data);

    // Login with College ID
    console.log("Logging in with College ID:", collegeId);
    res = await axios.post('http://localhost:5000/api/auth/login', {
      role: 'student',
      collegeId: collegeId,
      password: password
    });
    console.log("Login (CollegeID) Success:", res.data);

  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

test();
