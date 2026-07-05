import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('https://condominio-api-2aef.onrender.com/api/v1/auth/login', {
      username: 'admin',
      password: 'password'
    });
    console.log('Success:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testLogin();

testLogin();
