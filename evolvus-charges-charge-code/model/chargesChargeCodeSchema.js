/*
 ** JSON Schema representation of the chargesChargeCode model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "chargesChargeCodeModel",
  "type": "object",
  "properties": {

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
    "_id": {
      "filterable": true,
      "sortable": false
    },
    "name": {
      "type": "string",
      "minLength": 5,
      "maxLength": 20,
      "unique": "true",
      "pattern": "^[A-Za-z0-9']+( [A-Za-z0-9']+)*$"
    },

    "type": {
      "type": "string",
      "minLength": 5,
      "maxLength": 20
    },

    "amount": {
      "type": "number",
      "minLength": 1,
      "maxLength": 10
    },

    "description": {
      "type": "string",
      "maxLength": 200,
      "pattern": "^[A-Za-z0-9']+( [A-Za-z0-9']+)*$"
    },

    "schemeType": {
      "type": "string",
      "minLength": 2,
      "maxLength": 10
    },

    "transactionType": {
      "type": "string",
      "minLength": 5,
      "maxLength": 50
    },

    "createdBy": {
      "type": "string",
      "minLength": 5,
      "maxLength": 35
    },

    "createdDateAndTime": {
      "type": "string",
      "format": "data-time",
    },

    "updatedBy": {
      "type": "string",
      "minLength": 5,
      "maxLength": 35
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
    },

    "processingStatus": {
      "type": "string",
      "default": 'IN_PROGRESS',
      "displayable": true,
      "filterable": true, //custom attributes
      "sortable": true //custom attributes
    },

    "activationStatus": {
      "type": "string",
      "default": "INACTIVE",
      "filterable": true,
      "sortable": false,
      "displayable": true
    }
  },
  "required": ["name", "type", "transactionType", "schemeType", "amount", "createdBy", "updatedBy", "createdDateAndTime", "updatedDateAndTime"]
};