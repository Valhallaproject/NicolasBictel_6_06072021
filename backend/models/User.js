const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//data model for a user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },    
    password: { type: String, required: true }
});
//plugin preventing the creation of multiple accounts with the same email address
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);