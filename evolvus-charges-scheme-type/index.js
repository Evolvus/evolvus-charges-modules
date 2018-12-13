const debug = require("debug")("evolvus-charges-scheme-type:index");
const _ = require('lodash');
const model = require("./model/chargesSchemeTypeSchema");
const dbSchema = require("./db/chargesSchemeTypeSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const schemeTypeAudit = docketClient.audit;
const name=process.env.APPLICATION_NAME || "CHARGES";
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargeschemetype", dbSchema);

var modelSchema = model.schema;

schemeTypeAudit.application = name;
schemeTypeAudit.source = "SCHEMETYPESERVICE";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (chargesSchemeTypeObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof chargesSchemeTypeObject === 'undefined' || chargesSchemeTypeObject == null) {
        throw new Error("IllegalArgumentException: chargesSchemeTypeObject is null or undefined");
      }
      schemeTypeAudit.name = "SCHEMETYPE_SAVE INITIALIZED";
      schemeTypeAudit.source = "SCHEMETYPESERVICE";
      schemeTypeAudit.ipAddress = ipAddress;
      schemeTypeAudit.createdBy = createdBy;
      schemeTypeAudit.keyDataAsJSON = JSON.stringify(chargesSchemeTypeObject);
      schemeTypeAudit.details = `Charges scheme type save is initiated`;
      schemeTypeAudit.eventDateTime = Date.now();
      schemeTypeAudit.status = "SUCCESS";
      docketClient.postToDocket(schemeTypeAudit);
      var res = validate(chargesSchemeTypeObject, modelSchema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        // Other validations here

        // if the object is valid, save the object to the database
        collection.save(chargesSchemeTypeObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      schemeTypeAudit.name = "EXCEPTION IN SCHEMETYPE_SAVE";
      schemeTypeAudit.source = "SCHEMETYPESERVICE";
      schemeTypeAudit.ipAddress = ipAddress;
      schemeTypeAudit.createdBy = createdBy;
      schemeTypeAudit.keyDataAsJSON = JSON.stringify(chargesSchemeTypeObject);
      schemeTypeAudit.details = ``;
      schemeTypeAudit.eventDateTime = Date.now();
      schemeTypeAudit.status = "FAILURE";
      docketClient.postToDocket(schemeTypeAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};


module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      schemeTypeAudit.name = "SCHEMETYPE_FIND INITIALIZED";
      schemeTypeAudit.source = "SCHEMETYPESERVICE";
      schemeTypeAudit.ipAddress = ipAddress;
      schemeTypeAudit.createdBy = createdBy;
      schemeTypeAudit.keyDataAsJSON = "";
      schemeTypeAudit.details = `Charges scheme type find is initiated`;
      schemeTypeAudit.eventDateTime = Date.now();
      schemeTypeAudit.status = "SUCCESS";
      docketClient.postToDocket(schemeTypeAudit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of schemeTypes found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch scheme types: ${e}`);
        reject(e);
      });
    } catch (e) {
      schemeTypeAudit.name = "EXCEPTION IN SCHEMETYPE_FIND";
      schemeTypeAudit.source = "SCHEMETYPESERVICE";
      schemeTypeAudit.ipAddress = ipAddress;
      schemeTypeAudit.createdBy = createdBy;
      schemeTypeAudit.keyDataAsJSON = "";
      schemeTypeAudit.details = ``;
      schemeTypeAudit.eventDateTime = Date.now();
      schemeTypeAudit.status = "FAILURE";
      docketClient.postToDocket(schemeTypeAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

