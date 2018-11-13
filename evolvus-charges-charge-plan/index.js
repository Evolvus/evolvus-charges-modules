const debug = require("debug")("evolvus-charges-chargePlan:index");
const _ = require('lodash');
const model = require("./model/chargePlanSchema");
const dbSchema = require("./db/chargePlanSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargeplan", dbSchema);
const chargeCode = require("@evolvus/evolvus-charges-charge-code");
var modelSchema = model.schema;

audit.application = "CHARGES";
audit.source = "chargeplan";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (chargePlanObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (chargePlanObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      audit.name = "CHARGE_PLAN_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(chargePlanObject);
      audit.details = `ChargePlan save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var res = validate(chargePlanObject, modelSchema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        if (chargePlanObject.chargeCodes.length > 0) {
          for (var i = 0; i < chargePlanObject.chargeCodes.length; i++) {
            let filter = {
              "_id": chargePlanObject.chargeCodes[i]
            }
            chargeCode.find(filter, {}, 0, 1, ipAddress, createdBy).then((result) => {
              if (_.isEmpty(result)) {
                throw ("Invalid ChargeCode");
              }
            }).catch((e) => {
              debug(`ChargeCode Find Failed ${e}`);
              reject(e);
            });
          }

          collection.find({
            "name": chargePlanObject.name
          }, {}, 0, 1).then((result) => {
            if (!_.isEmpty(result[0])) {
              throw new Error(`Charge Plan ${chargePlanObject.name} already exists`);
            }
            collection.save(chargePlanObject).then((result) => {
              debug(`saved successfully ${result}`);
              resolve(result);
            }).catch((e) => {
              debug(`failed to save with an error: ${e}`);
              reject(e);
            });
          }).catch((e) => {
            debug(`failed to find with an error: ${e}`);
            reject(e);
          });
        }
      }
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGE_PLAN_SAVE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(chargePlanObject);
      audit.details = `ChargePlan save is initiated`;
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
      audit.name = "CHARGES_PLAN_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `ChargePlan find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var populate = {
        path: 'chargeCodes',
        model: 'chargecode',
        populate: {
          path: 'transactionType',
          model: 'chargesTransactionType'
        }
      };
      collection.findAndPopulate(filter, populate, orderby, skipCount, limit)
        .then((result) => {
          debug(`Number of ChargePlan(s) found is ${result.length}`);
          resolve(result);
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`collection.find promise failed due to ${e} and reference id ${reference}`);
          reject(e);
        });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGEPLAN_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `ChargePlan find failed`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.update = (code, updateObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (updateObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      audit.name = "CHARGEPLAN_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(updateObject);
      audit.details = `ChargePlan update is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
          "name": code
        }
        collection.find(filter, {}, 0, 1).then((findResult) => {
          if (_.isEmpty(findResult[0])) {
            throw new Error(`ChargePlan ${code.toUpperCase()}, not found `);
          }
          if ((!_.isEmpty(findResult[0])) && (findResult[0].name != code)) {

            throw new Error(`ChargePlan Name ${code} cannot be modified`);
          }
          collection.update({
            "name": code
          }, updateObject).then((result) => {
            if (result.nModified == 1) {
              debug(`updated successfully ${result}`);
              resolve(result);
            } else {
              debug(`Not able to update. ${result}`);
              reject("Not able to update.Contact Administrator");
            }
          }).catch((e) => {
            debug(`failed to update with an error: ${e}`);
            reject(e);
          });
        }).catch((e) => {
          debug(`Failed to find with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGEPLAN_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(updateObject);
      audit.details = `ChargePlan UPDATE failed`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};