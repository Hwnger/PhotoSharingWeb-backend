// test-connection.js
const mongoose = require('mongoose');


mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Kết nối MongoDB thành công!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Lỗi kết nối:', err);
    process.exit(1);
  });