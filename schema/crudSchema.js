const mongoose = require('mongoose');

let crudSchema = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    pincode: { type: Number, default: null },
    image: { type: String, default: null },
    isDeleted: { type: Boolean, default: false}
},
  {
    // createdAt,updatedAt fields are automatically added into records
    timestamps: true
  });

module.exports = crudSchema;