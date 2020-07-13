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
      "pattern": "^[A-Za-z0-9']+( [A-Za-z0-9']+)*$"
    },
    "emailId": {
      "type": "string",
      "maxLength": 100,
      "format": "email"
    },
    "corporateAccount": {
      "type": "string",
      "minLength": 10,
      "maxLength": 20,
      "pattern": "^[A-Za-z0-9]+$"
    },
    "GSTINnumber": {
      "type": "string"
    },
    "returnCharges": {
      "type": "number",
      "minLength": 1,
      "maxLength": 10
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
    },
   "description": {
      "type": "string",
      "maxLength": 200,
      "pattern": "^[A-Za-z0-9']+( [A-Za-z0-9']+)*$"
    },
   "processingStatus": {
      "type": "string",
      "default": 'IN_PROGRESS',
      "displayable": true,
      "filterable": true, //custom attributes
      "sortable": true //custom attributes
    },

   "tenantId": {
      "type": "string",
      "maxLength": 64,
      "filterable": true,
      "sortable": true
    },

    "wfInstanceId": {
      "type": "string",
      "minLength": 0,
      "maxLength": 20,
      "filterable": true,
      "sortable": true
    },

    "activationStatus": {
      "type": "string",
      "default": "INACTIVE",
      "filterable": true,
      "sortable": false,
      "displayable": true
    }
  },
  "required": ["corporateName", "utilityCode", "tenantId", "chargePlan", "corporateAccount", "emailId", "billingAddress", "createdBy", "createdDateAndTime", "updatedBy", "updatedDateAndTime"]
};
