const http = require('http');
http.get('http://localhost:3000/login', res => {
  console.log('Status:', res.statusCode);
  if (res.headers.location) {
    console.log('Location:', res.headers.location);
  }
});
