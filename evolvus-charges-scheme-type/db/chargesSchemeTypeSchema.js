const mongoose = require("mongoose");
const validator = require("validator");

var chargesSchemeTypeSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
    min: 2,
    max: 10,
    unique:true
  },
  createdBy: {
    type: String,
    required: true,
    min:5,
    max:35
  },
  createdDateAndTime: {
    type: Date,
    required: true
  },
  updatedBy: {
    type: String,
    required: true,
    min:5,
    max:35
  },
  updatedDateAndTime: {
    type: Date,
    required: true
  },
  enabledFlag: {
    type:String,
    enum: ["true", "false"],
    default: "true"
  },
  deletedFlag: {
    type:String,
    enum: ["true", "false"],
    default: "false"
  }
});


module.exports.schema = chargesSchemeTypeSchema;
