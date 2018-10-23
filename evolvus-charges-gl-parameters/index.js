const debug = require("debug")("evolvus-charges-gl-parameters:index");
const _ = require('lodash');
const model = require("./model/chargesGlParametersSchema");
const dbSchema = require("./db/chargesGlParametersSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargesglparameters", dbSchema);

var modelSchema = model.schema;

audit.application = "CHARGES";
audit.source = "chargesGlParameters";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (chargesGlParametersObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (chargesGlParametersObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      audit.name = "CHARGES_GL_PARAMETERS_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(chargesGlParametersObject);
      audit.details = `Charges gl paramaters save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var res = validate(chargesGlParametersObject, modelSchema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        // Other validations here


        // if the object is valid, save the object to the database
        collection.save(chargesGlParametersObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_GL_PARAMETERS_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(chargesGlParametersObject);
      audit.details = `Charges gl paramaters save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.update = (id, updateObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (updateObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      audit.name = "CHARGES_GL_PARAMETERS_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(updateObject);
      audit.details = `Charges gl paramaters update is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var result;
      var errors = [];
      _.mapKeys(updateObject, function (value, key) {
        if (modelSchema.properties[key] != null) {
          result = validate(value, modelSchema.properties[key]);
          if (result.errors.length != 0) {
            result.errors[0].property = key;
            errors.push(result.errors);
          }
        }
      });
      debug("Validation status: ", JSON.stringify(result));
      if (errors.length != 0) {
        reject(errors[0][0]);
      } else {
        collection.update({"_id":id}, updateObject).then((result) => {
          if (result.nModified == 1) {
            debug(`updated successfully ${result}`);
            resolve(result);
          } else {
            debug(`Not able to update. ${result}`);
            reject("Not able to update.Contact Administrator");
          }
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_GL_PARAMETERS_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(update);
      audit.details = `Charges gl paramaters UPDATE failed`;
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
      audit.name = "CHARGES_GL_PARAMETERS_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `Charges gl parameters find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of GlParameters found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch GlParameters: ${e}`);
        reject(e);
      });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_GL_PARAMETERS_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `Charges gl parameters find failed`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};



