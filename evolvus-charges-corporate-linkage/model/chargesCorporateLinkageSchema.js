/*
 ** JSON Schema representation of the chargesGlParameters model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesCorporateLinkageModel",
  "type": "object",
  "properties": {
    "utilityCode": {
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
    "emailId":{
      "type":"string",
      "format":"email"
    },
    "corporateAccount": {
      "type": "string",
      "minLength": 10,
      "maxLength": 20,
      "pattern":"/^[a-z0-9]+$/i"
    },
    "GSTINnumber": {
      "type": "string",
      "minLength": 15,
      "maxLength": 15,
      "pattern":"/^[a-z0-9]+$/i"
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
  "required": ["utilityCode","chargePlan","corporateAccount","emailId","GSTINnumber","billingAddress","createdBy","createdDateAndTime","updatedBy","updatedDateAndTime"]
};
