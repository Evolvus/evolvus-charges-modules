const mongoose = require("mongoose");

var chargePlanSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  name: {
    type: String,
    required: true,
    min: 2,
    max: 20,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9']+( [A-Za-z0-9']+)*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and single space"
    }
  },
  chargeCodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chargecode'
  }],
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

module.exports.schema = chargePlanSchema;
