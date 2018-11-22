const debug = require("debug")("evolvus-charges-corporate-linkage:index");
const _ = require('lodash');
const model = require("./model/chargesCorporateLinkageSchema");
const dbSchema = require("./db/chargesCorporateLinkageSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;
const chargePlan = require("@evolvus/evolvus-charges-charge-plan");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargescorporatelinkage", dbSchema);
var modelSchema = model.schema;

audit.application = "CHARGES";
audit.source = "chargesCorporateLinkage";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (corporateLinkageObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (corporateLinkageObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      audit.name = "CHARGES_CORPORATE_LINKAGE_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(corporateLinkageObject);
      audit.details = `Charges corporate linkage save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      let filter = {
        "name": corporateLinkageObject.chargePlan.toUpperCase()
      };
      chargePlan.find(filter, {}, 0, 1, ipAddress, createdBy).then((result) => {
        if (_.isEmpty(result)) {
          debug("Invalid Charge Plan");
          reject("Invalid Charge Plan");
        } else {
          var res = validate(corporateLinkageObject, modelSchema);
          debug("validation status: ", JSON.stringify(res.valid));
          if (!res.valid) {
            reject(res.errors);
          } else {
            corporateLinkageObject.chargePlan = result[0]._id;
            let filter = {
              "utilityCode": corporateLinkageObject.utilityCode.toUpperCase()
            };
            collection.find(filter, {}, 0, 1).then((findResult) => {
              if (!_.isEmpty(findResult)) {
                throw new Error(`UtilityCode ${corporateLinkageObject.utilityCode.toUpperCase()} is already exists`);
              } else {
                corporateLinkageObject.utilityCode = corporateLinkageObject.utilityCode.toUpperCase();
                collection.save(corporateLinkageObject).then((result) => {
                  debug(`saved successfully ${result}`);
                  resolve(result);
                }).catch((e) => {
                  debug(`failed to save with an error: ${e}`);
                  reject(e);
                });
              }
            }).catch((e) => {
              debug(`Failed to find UtilityCode with an error: ${e}`);
              reject(e);
            });
          }
        }
      }).catch(e => {
        debug(`Finding Charge Plan promise failed: ${e}`);
        reject(e);
      });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_CORPORATE_LINKAGE_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(corporateLinkageObject);
      audit.details = `Charges gl paramaters save is initiated`;
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
      audit.name = "CHARGES_CORPORATE_LINKAGE_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `Charges Corporate Linkage find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var populate = {
        path: 'chargePlan',
        model: 'chargeplan',
        populate: {
          path: 'chargeCodes',
          model: 'chargecode',
          populate: {
            path: 'transactionType',
            model: 'chargesTransactionType'
          }
        }
      };
      collection.findAndPopulate(filter, populate, orderby, skipCount, limit).then((result) => {
        debug(`Number of records found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch records: ${e}`);
        reject(e);
      });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_CORPORATE_LINKAGE_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `Charges Corporate Linkage find failed`;
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
      audit.name = "CHARGES_CORPORATE-LINKAGE_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(updateObject);
      audit.details = `Charges corporate linkage update is initiated`;
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
        let filter = {};
        if (updateObject.chargePlan) {
          filter = {
            "_id": updateObject.chargePlan
          };
        }
        Promise.all([chargePlan.find(filter, {}, 0, 1, ipAddress, createdBy), collection.find({
          "utilityCode": code
        }, {}, 0, 1)]).then((findResult) => {
          if (_.isEmpty(findResult[0][0])) {
            throw new Error(`Invalid chargePlan`);
          } else if (_.isEmpty(findResult[1][0])) {
            throw new Error(`UtilityCode ${code} not Found`);
          } else if ((!_.isEmpty(findResult[1][0])) && (findResult[1][0].utilityCode != code)) {
            throw new Error(`UtilityCode ${code} cannot be modified`);
          } else {
            collection.update({
              "utilityCode": code
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
          }
        }).catch((e) => {
          debug(`Failed in PromiseAll ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_CORPORATE_LINKAGE_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(updateObject);
      audit.details = `Charges corpporate linkage UPDATE failed`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};