const mongoose = require("mongoose");
const validator = require("validator");

var chargesChargeCodeSchema = new mongoose.Schema({

name: {
  type: String,
  required: true,
  min: 5,
  max: 20,
  unique: true
},

type: {
  type: String,
  required: true,
  min: 5,
  max: 20
},

amount: {
  type: Number,
  required: true,
  minlength: 1, 
  maxlength: 10
},

description: {
  type: String,
  required: true,
  min: 5,
  max: 200
},

schemeType: {
  type: String,
  required: true,
  min: 2,
  max: 10
},

transactionType: {
  type: String,
  required: true,
  min: 5,
  max: 25
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

chargesChargeCodeSchema.index({
  name: 1
}, {
  unique: true
});


