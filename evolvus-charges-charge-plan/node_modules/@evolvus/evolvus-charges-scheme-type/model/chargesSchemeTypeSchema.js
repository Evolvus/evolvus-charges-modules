/*
 ** JSON Schema representation of the chargesSchemeType model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesSchemeTypeModel",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 10
    },
    "createdBy": {
      "type": "string",
      "minLength": 5,
      "maxLength": 35
    },
    "createdDateAndTime": {
      "type": "string",
      "format": "date-time"
    },
    "updatedBy": {
      "type": "string",
      "minLength": 5,
      "maxLength": 35
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
  "required": ["name", "createdBy", "createdDateAndTime", "updatedBy", "updatedDateAndTime"]
};
