/*
 ** JSON Schema representation of the chargesBilling model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesBillingModel",
  "type": "object",
  "properties": {
    "corporateName": {
      "type": "string"
    },
    "utilityCode": {
      "type": "string"
    },
    "billNumber": {
      "type": "string"
    },
    "billDate": {
      "type": "String",
      "format": "date-time",
    },
    "billFrequency": {
      "type": "string",
      "default": "Monthly"
    },
    "billPeriod": {
      "type": "string"
    },
    "actualChargesAmount": {
      "type": "number"
    },
    "actualGSTAmount": {
      "type": "number"
    },
    "actualTotalAmount": {
      "type": "number"
    },
    "finalChargesAmount": {
      "type": "number"
    },
    "finalGSTAmount": {
      "type": "number"
    },
    "finalTotalAmount": {
      "type": "number"
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
    }
  },
  "required": ["corporateName", "utilityCode", "billDate", "billFrequency", "billNumber", "billPeriod", "actualChargesAmount", "actualGSTAmount", "actualTotalAmount", "finalChargesAmount", "finalGSTAmount", "finalTotalAmount", "createdBy", "createdDateAndTime", "updatedBy", "updatedDateAndTime"]
};
