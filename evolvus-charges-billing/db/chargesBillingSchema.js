const mongoose = require("mongoose");
const validator = require("validator");


var chargesBillingSchema = new mongoose.Schema({

  corporateName: {
    type: String,
    required: true
  },
  tenantId: {
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
    default: "AWAITING_VERIFICATION"
  },
  actualChargesAmount: {
    type: Number,
    required: true,
    set: toFixedLength

  },
  actualGSTAmount: {
    type: Number,
    required: true,
    set: toFixedLength
  },
  actualTotalAmount: {
    type: Number,
    required: true,
    set: toFixedLength

  },
  finalChargesAmount: {
    type: Number,
    required: true,
    set: toFixedLength

  },
  finalGSTAmount: {
    type: Number,
    required: true,
    set: toFixedLength

  },
  finalTotalAmount: {
    type: Number,
    required: true,
    set: toFixedLength

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
  },
  reattemptDate: {
    type: Date
  },
  reattemptFlag: {
    type: String,
    default: "NO"
  },
  reattemptedDateAndTime: {
    type: Date
  },
  reattemptedStatus: {
    type: String
  },
  manualStatusChangeFlag: {
    type: String,
    default: "NO"
  },
  wfInstanceId: {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  details: {
    type: Array
  },
  remarks: {
    type: String
  },
  chargePlan: {
    type: String
  },
  postingFailureReason: {
    type: String
  },
  errorCode: {
    type: String
  }

});

function toFixedLength(value) {
  return Number(value.toFixed(2));
}

module.exports = chargesBillingSchema;
