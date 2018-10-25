const mongoose = require("mongoose");
const validator = require("validator");


var chargesTransactionTypeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    min: 5,
    max: 25,
    unique: true
  },

  schemeType: {
    type: String,
    required: true,
    min: 2,
    max: 10
  },

  createdBy: {
    type: String,
    required: true,
    min: 5,
    max: 35
  },
  
  createdDateAndTime: { 
    type: Date,
    required: true
  },
  
  updatedBy: {
    type: String,
    required: true,
    min: 5,
    max: 35
  },
  
  updatedDateAndTime: { 
    type: Date,
    required: true
  },
  
  enabledFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true"
  },
  
  deletedFlag: {
    type: String,
    enum: ["true", "false"],
    default: "false"
  }
});  

module.exports.schema = chargesTransactionTypeSchema;
