const debug = require("debug")("evolvus-charges-gl-parameters:index");
const _ = require('lodash');
const model = require("./model/chargesGlParametersSchema");
const dbSchema = require("./db/chargesGlParametersSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const glAudit = docketClient.audit;
const name=process.env.APPLICATION_NAME || "CHARGES";

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargesglparameter", dbSchema);
var schemeType = require("@evolvus/evolvus-charges-scheme-type");

var modelSchema = model.schema;

glAudit.application = name;
glAudit.source = "GLPARAMETERSSERVICE";

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
      glAudit.name = "GL_PARAMETERS_SAVE INITIALIZED";
      glAudit.source = "GLPARAMETERSSERVICE";
      glAudit.ipAddress = ipAddress;
      glAudit.createdBy = createdBy;
      glAudit.keyDataAsJSON = JSON.stringify(chargesGlParametersObject);
      glAudit.details = `Charges gl paramaters save is initiated`;
      glAudit.eventDateTime = Date.now();
      glAudit.status = "SUCCESS";
      docketClient.postToDocket(glAudit);
      let filter = {
        "name": chargesGlParametersObject.schemeType
      };
      Promise.all([collection.find({}, {}, 0, 0), schemeType.find(filter, {}, 0, 1, ipAddress, createdBy)]).then((result) => {
        if (_.isEmpty(result[0])) {
          var res = validate(chargesGlParametersObject, modelSchema);
          debug("validation status: ", JSON.stringify(res.valid));
          if (!res.valid) {
            reject(res.errors);
          } else {
            if (_.isEmpty(result[1])) {
              debug("Scheme Type not found");
              reject("Invalid Scheme Type.");
            } else {
              collection.save(chargesGlParametersObject).then((result) => {
                debug(`saved successfully ${result}`);
                resolve(result);
              }).catch((e) => {
                debug(`failed to save with an error: ${e}`);
                reject(e);
              });
            }
          }
        } else {
          reject("GL Account exists.")
        }
      }).catch(e => {
        debug(`Finding GL Account and scheme type promise failed: ${e}`);
        reject(e);
      });
    } catch (e) {
      glAudit.name = "EXCEPTION IN GL_PARAMETERS_UPDATE";
      glAudit.source = "GLPARAMETERSSERVICE";
      glAudit.ipAddress = ipAddress;
      glAudit.createdBy = createdBy;
      glAudit.keyDataAsJSON = JSON.stringify(chargesGlParametersObject);
      glAudit.details = `Charges gl paramaters save is failed`;
      glAudit.eventDateTime = Date.now();
      glAudit.status = "FAILURE";
      docketClient.postToDocket(glAudit);
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
      glAudit.name = "GL_PARAMETERS_UPDATE INITIALIZED";
      glAudit.source = "GLPARAMETERSSERVICE";
      glAudit.ipAddress = ipAddress;
      glAudit.createdBy = createdBy;
      glAudit.keyDataAsJSON = JSON.stringify(updateObject);
      glAudit.details = `Charges gl paramaters update is initiated`;
      glAudit.eventDateTime = Date.now();
      glAudit.status = "SUCCESS";
      docketClient.postToDocket(glAudit);
      var result;
      var errors = [];
      _.mapKeys(updateObject, function(value, key) {
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
        let filter = {
          "name": updateObject.schemeType
        };
        schemeType.find(filter, {}, 0, 1, ipAddress, createdBy)
          .then((result) => {
            if (_.isEmpty(result) && !_.isEmpty(updateObject.schemeType)) {
              throw new Error("Invalid Scheme Type.");
            } else {
              collection.update({
                "_id": id
              }, updateObject).then((result) => {
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
          }).catch((e) => {
            debug(`Failed to find SchemeType ${e}`);
            reject(e);
          });
      }
    } catch (e) {
      glAudit.name = "EXCEPTION IN GL_PARAMETERS_UPDATE";
      glAudit.source = "GLPARAMETERSSERVICE";
      glAudit.ipAddress = ipAddress;
      glAudit.createdBy = createdBy;
      glAudit.keyDataAsJSON = JSON.stringify(updateObject);
      glAudit.details = `Charges gl paramaters UPDATE failed`;
      glAudit.eventDateTime = Date.now();
      glAudit.status = "FAILURE";
      docketClient.postToDocket(glAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      glAudit.name = "GL_PARAMETERS_FIND INITIALIZED";
      glAudit.source = "GLPARAMETERSSERVICE";
      glAudit.ipAddress = ipAddress;
      glAudit.createdBy = createdBy;
      glAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      glAudit.details = `Charges gl parameters find is initiated`;
      glAudit.eventDateTime = Date.now();
      glAudit.status = "SUCCESS";
      docketClient.postToDocket(glAudit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of GlParameters found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch GlParameters: ${e}`);
        reject(e);
      });
    } catch (e) {
      glAudit.name = "EXCEPTION IN GL_PARAMETERS_FIND";
      glAudit.source = "GLPARAMETERSSERVICE";
      glAudit.ipAddress = ipAddress;
      glAudit.createdBy = createdBy;
      glAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      glAudit.details = `Charges gl parameters find failed`;
      glAudit.eventDateTime = Date.now();
      glAudit.status = "FAILURE";
      docketClient.postToDocket(glAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};