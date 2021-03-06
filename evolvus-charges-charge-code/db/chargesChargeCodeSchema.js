const mongoose = require("mongoose");
const validator = require("validator");

var chargesChargeCodeSchema = new mongoose.Schema({

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
  name: {
    type: String,
    required: true,
    min: 5,
    max: 20,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z0-9']+( [A-Za-z0-9']+)*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and single space"
    }
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
    max: 200,
    validate: {
      validator: function (v) {
        return /^[A-Za-z0-9']+( [A-Za-z0-9']+)*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and single space"
    }
  },

  schemeType: {
    type: String,
    required: true,
    min: 2,
    max: 10
  },

  transactionType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chargesTransactionType',
    required: true
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
  },

  processingStatus: {
    type: String,
    default: "IN_PROGRESS"
  },

  activationStatus: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE"
  }

});

chargesChargeCodeSchema.index({
  name: 1
}, {
    unique: true
  });


module.exports.schema = chargesChargeCodeSchema;