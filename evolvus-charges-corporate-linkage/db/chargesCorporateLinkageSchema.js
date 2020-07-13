const mongoose = require("mongoose");
const validator = require("validator");

var chargesCorporateLinkageSchema = new mongoose.Schema({
  corporateName: {
    type: String,
    required: true
  },
  utilityCode: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  chargePlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chargeplan"
  },
  billingAddress: {
    type: String,
    min: 10,
    max: 200,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9']+( [A-Za-z0-9']+)*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and single space"
    }
  },
  emailId: {
    type: String,
    max: 100,
    required: true
  },
  corporateAccount: {
    type: String,
    required: true,
    min: 10,
    max: 20,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9]+$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric."
    }
  },
  GSTINnumber: {
    type: String
  },
  returnCharges: {
    type: Number,
    minlength: 1,
    maxlength: 10
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
  enabledFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true"
  },
  deletedFlag: {
    type: String,
    enum: ["true", "false"],
    default: "false"
  },
  processingStatus: {
    type: String,
    default: "IN_PROGRESS"
  },
  tenantId: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 64
  },
  wfInstanceId: {
    type: String,
    minlength: 0,
    maxlength: 20
  },
  activationStatus: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE"
  }

});

module.exports.schema = chargesCorporateLinkageSchema;
