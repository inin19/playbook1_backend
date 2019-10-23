// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // User Schema
// const UserSchema = mongoose.Schema({
//   password: {
//     type: String,
//   },
//   email: {
//     type: String,
//   },
// });


// const User = mongoose.model('User', UserSchema);

// const createUser = (newUser, callback) => {
//   bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(newUser.password, salt, (err, hash) => {
//       newUser.password = hash;
//       newUser.save(callback);
//     });
//   });
// };

// module.exports = {
//   User,
//   createUser,
// };

// module.exports.createUser = (newUser, callback) => {
//   bcrypt.genSalt(10, function (err, salt) {
//     bcrypt.hash(newUser.password, salt, (err, hash) => {
//       newUser.password = hash;
//       newUser.save(callback);
//     });
//   });
// };

// module.exports.getUserByUsername = function (username, callback) {
//   var query = { username: username };
//   User.findOne(query, callback);
// }

// module.exports.getUserById = function (id, callback) {
//   User.findById(id, callback);
// }

// module.exports.comparePassword = function (candidatePassword, hash, callback) {
//   bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
//     if (err) throw err;
//     callback(null, isMatch);
//   });
// }
