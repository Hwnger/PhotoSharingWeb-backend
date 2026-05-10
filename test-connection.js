// test-connection.js
const mongoose = require('mongoose');

// Thay thế bằng connection string của bạn
const MONGODB_URI = 'mongodb+srv://duyhungls2005:08012005@cluster0.4riupee.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Kết nối MongoDB thành công!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Lỗi kết nối:', err);
    process.exit(1);
  });