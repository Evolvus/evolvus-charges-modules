const mongoose = require("mongoose");
const validator = require("validator");


var chargesBillingSchema = new mongoose.Schema({

  corporateName: {
    type: String,
    required: true
  },
  utilityCode: {
    type: String,
    required: true
  },
  billNumber: {
    type: String,
    required: true
  },
  billDate: {
    type: Date,
    default: new Date(),
    required: true
  },
  billFrequency: {
    type: String,
    required: true,
    default: "Monthly"
  },
  billPeriod: {
    type: String,
    required: true
  },
  billStatus: {
    type: String,
    required: true,
    default: "Awaiting Confirmation"
  },
  actualChargesAmount: {
    type: Number,
    required: true
  },
  actualGSTAmount: {
    type: Number,
    required: true
  },
  actualTotalAmount: {
    type: Number,
    required: true
  },
  finalChargesAmount: {
    type: Number,
    required: true
  },
  finalGSTAmount: {
    type: Number,
    required: true
  },
  finalTotalAmount: {
    type: Number,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdDateAndTime: {
    type: Date,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  updatedDateAndTime: {
    type: Date,
    required: true
  }

});

module.exports = chargesBillingSchema;