const mongoose = require("mongoose");
const validator = require("validator");

var chargesGlParametersSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  schemeType: {
    type: String,
    required: true,
    min: 2,
    max: 10
  },
  GSTRate: {
    type: Number,
    max: 100,
    required: true
  },
  chargesAccount: {
    type: String,
    required: true,
    min: 10,
    max: 20
  },
  GSTAccount: {
    type: String,
    required: true,
    min: 10,
    max: 20
  },
  chargesAccountNarration: {
    type: String,
    min: 1,
    max: 200,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9']+( [A-Za-z0-9']+)*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and single space"
    }
  },
  GSTAccountNarration: {
    type: String,
    min: 1,
    max: 200,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9']+( [A-Za-z0-9']+)*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and single space"
    }
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
  }
});

module.exports.schema = chargesGlParametersSchema;