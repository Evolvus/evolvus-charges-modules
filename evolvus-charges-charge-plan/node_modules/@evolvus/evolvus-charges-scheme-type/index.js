const debug = require("debug")("evolvus-charges-scheme-type:index");
const _ = require('lodash');
const model = require("./model/chargesSchemeTypeSchema");
const dbSchema = require("./db/chargesSchemeTypeSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargeschemetype", dbSchema);

var modelSchema = model.schema;

audit.application = "CHARGES";
audit.source = "ChargesSchemeType";

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
      audit.name = "CHARGES_SCHEMETYPE_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(chargesSchemeTypeObject);
      audit.details = `Charges scheme type save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
      audit.name = "EXCEPTION IN CHARGES_SCHEMETYPE_SAVE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(chargesSchemeTypeObject);
      audit.details = ``;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};


module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      audit.name = "CHARGES_SCHEMETYPE_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = `Charges scheme type find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of schemeTypes found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch scheme types: ${e}`);
        reject(e);
      });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_SCHEMETYPE_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = ``;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

