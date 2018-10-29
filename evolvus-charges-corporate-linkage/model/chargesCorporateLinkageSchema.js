/*
 ** JSON Schema representation of the chargesGlParameters model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesCorporateLinkageModel",
  "type": "object",
  "properties": {
    "corporateName": {
      "type": "string"
    },
    "utilityCode": {
      "type": "string"
    },
    "tenantId": {
      "type": "string"
    },
    "chargePlan": {
      "type": "string"
    },
    "billingAddress": {
      "type": "string",
      "minLength": 10,
      "maxLength": 200,
      "pattern": "^[A-Za-z']+( [A-Za-z']+)*$"
    },
    "emailId": {
      "type": "string",
      "format": "email"
    },
    "corporateAccount": {
      "type": "string",
      "minLength": 10,
      "maxLength": 20,
      "pattern": "^[A-Za-z0-9]+$"
    },
    "GSTINnumber": {
      "type": "string",
      "minLength": 15,
      "maxLength": 15,
      "pattern": "^[A-Za-z0-9]+$"
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
  "required": ["corporateName", "utilityCode", "tenantId", "chargePlan", "corporateAccount", "emailId", "GSTINnumber", "billingAddress", "createdBy", "createdDateAndTime", "updatedBy", "updatedDateAndTime"]
};
