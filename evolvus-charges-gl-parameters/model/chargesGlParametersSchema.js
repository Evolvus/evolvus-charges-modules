/*
 ** JSON Schema representation of the chargesGlParameters model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesGlParametersModel",
  "type": "object",
  "properties": {
    "schemeType": {
      "type": "string",
      "minLength": 2,
      "maxLength": 10
    },
    "GSTRate": {
      "type": "number",
      "maxLength": 5
    },
    "chargesAccount": {
      "type": "string",
      "minLength": 10,
      "maxLength": 20
    },
    "GSTAccount": {
      "type": "string",
      "minLength": 10,
      "maxLength": 20
    },
    "chargesAccountNarration": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "pattern": "^[A-Za-z']+( [A-Za-z']+)*$"
    },
    "GSTAccountNarration": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "pattern": "^[A-Za-z']+( [A-Za-z']+)*$"
    },
    "createdBy": {
      "type": "string"
    },
    "createdDateAndTime": {
      "type": "string",
      "format": "date-time"
    },
    "updatedBy": {
      "type": "string"
    },
    "updatedDateAndTime": {
      "type": "string",
      "format": "date-time"
    },
    "enabledFlag": {
      "enum": ["true", "false"],
      "default": "true"
    },
    "deletedFlag": {
      "enum": ["true", "false"],
      "default": "false"
    }
  },
  "required": ["schemeType", "GSTRate", "chargesAccount", "GSTAccount", "chargesAccountNarration", "GSTAccountNarration", "createdBy", "createdDateAndTime", "updatedBy", "updatedDateAndTime"]
};