/*
 ** JSON Schema representation of the chargesTransactionType model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesTransactionTypeModel",
  "type": "object",
  "properties": {

    "name": {
      "type": "string",
      "minLength": "5",
      "maxLength": "25",
      "unique": "true"
    },

    "type": {
      "type": "string",
      "minLength": 5,
      "maxLength": 25
    },

    "code": {
      "type": "string",
      "minLength": 5,
      "maxLength": 25
    },

    "schemeType": {
      "type": "string",
      "minLength": "2",
      "maxLength": "10"
    },

    "createdBy": {
      "type": "string",
      "minLength": "5",
      "maxLength": "35"
    },

    "createdDateAndTime": {
      "type": "string",
      "format": "data-time",
    },

    "updatedBy": {
      "type": "string",
      "minLength": "5",
      "maxLength": "35"
    },

    "updatedDateAndTime": {
      "type": "string",
      "format": "data-time",
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
  "required": ["name", "code","type","createdBy", "updatedBy", "createdDateAndTime", "updatedDateAndTime"]
};
