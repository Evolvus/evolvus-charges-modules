const _ = require("lodash");
/*
 ** JSON Schema representation of the chargesBilling model
 */
var chargesBillingSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesBillingModel",
  "type": "object",
  "properties": {
    "corporateName": {
      "type": "string"
    },
    "utilityCode": {
      "type": "string",
      "filterable": "true"
    },
    "billNumber": {
      "type": "string",
      "filterable": "true"
    },
    "billDate": {
      "type": "String",
      "format": "date-time",
      "filterable": "true"
    },
    "billFrequency": {
      "type": "string",
      "default": "Monthly"
    },
    "billPeriod": {
      "type": "string",
      "filterable": "true"
    },
    "billStatus": {
      "type": "string",
      "default": "AWAITING_VERIFICATION",
      "filterable": "true"
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
    },
    "wfInstanceId": {
      "type": "string",
      "minLength": 3,
      "filterable": true,
      "maxLength": 20
    },
    "details":{
      "type":"array"
    },
    "reamarks":{
      "type":"string"
    }
  },
  "required": ["corporateName", "utilityCode", "billDate", "billFrequency", "billNumber", "billPeriod", "actualChargesAmount", "actualGSTAmount", "actualTotalAmount", "finalChargesAmount", "finalGSTAmount", "finalTotalAmount", "createdBy", "createdDateAndTime", "updatedBy", "updatedDateAndTime"]
};

module.exports.schema = chargesBillingSchema;

filterAttributes = _.keys(_.pickBy(chargesBillingSchema.properties, (a) => {
  return (a.filterable);
}));



module.exports.filterAttributes = filterAttributes;