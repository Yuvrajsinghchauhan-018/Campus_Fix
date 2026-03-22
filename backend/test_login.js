const axios = require('axios');

async function test() {
  try {
    const r1 = await axios.post('http://localhost:5000/api/auth/login', {
      role: 'student',
      email: 'testlogin@gmail.com',
      password: 'password123'
    });
    console.log("Login Success:", r1.data);
  } catch (err) {
    console.log("Login Error:", err.response ? err.response.data : err.message);
  }
}

test();

