const debug = require("debug")("evolvus-charges-chargePlan:index");
const _ = require('lodash');
const model = require("./model/chargePlanSchema");
const dbSchema = require("./db/chargePlanSchema").schema;
const validate = require("jsonschema")
  .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const chargeplanAudit = docketClient.audit;
const sweClient = require("@evolvus/evolvus-swe-client");

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargeplan", dbSchema);
const chargeCode = require("@evolvus/evolvus-charges-charge-code");
const name = process.env.APPLICATION_NAME || "CHARGES";
var modelSchema = model.schema;
var shortid = require('shortid');

chargeplanAudit.application = name;
chargeplanAudit.source = "CHARGEPLANSERVICE";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (tenantId, chargePlanObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (chargePlanObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      } else if (ipAddress == null) {
        throw new Error("IllegalArgumentException:ipAddress is null/undefined");
      } else if (createdBy == null) {
        throw new Error("IllegalArgumentException:createdBy is null/undefined");
      }
      chargeplanAudit.name = "CHARGE_PLAN_SAVE INITIALIZED";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = JSON.stringify(chargePlanObject);
      chargeplanAudit.details = `ChargePlan save is initiated`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "SUCCESS";
      docketClient.postToDocket(chargeplanAudit);
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
            "name": chargePlanObject.name.toUpperCase()
          }, {}, 0, 1).then((result) => {
            if (!_.isEmpty(result[0])) {
              throw new Error(`Charge Plan ${chargePlanObject.name.toUpperCase()} already exists`);
            }
            chargePlanObject.name = chargePlanObject.name.toUpperCase();
            collection.save(chargePlanObject).then((result) => {
              debug(`saved successfully ${result}`);
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "CHARGEPLAN",
                "wfEntityAction": "CREATE",
                "createdBy": createdBy,
                "query": result._id,
                "object": chargePlanObject
              };
              debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
              sweClient.initialize(sweEventObject).then((sweResult) => {
                var filterCode = {
                  "tenantId": tenantId,
                  "name": chargePlanObject.name
                };
                debug(`calling db update filterCode :${JSON.stringify(filterCode)} is a parameter`);
                collection.update(filterCode, {
                  "processingStatus": sweResult.data.wfInstanceStatus,
                  "wfInstanceId": sweResult.data.wfInstanceId
                }).then((planObject) => {
                  debug(`collection.update:user updated with workflow status and id:${JSON.stringify(planObject)}`);
                  resolve(chargePlanObject);
                }).catch((e) => {
                  var reference = shortid.generate();
                  debug(`collection.update promise failed due to :${e} and referenceId :${reference}`);
                  reject(e);
                });
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`sweClient.initialize promise failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
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
      chargeplanAudit.name = "EXCEPTION ON CHARGE_PLAN_SAVE";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = JSON.stringify(chargePlanObject);
      chargeplanAudit.details = `ChargePlan save is initiated`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "FAILURE";
      docketClient.postToDocket(chargeplanAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      chargeplanAudit.name = "CHARGE_PLAN_FIND INITIALIZED";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      chargeplanAudit.details = `ChargePlan find is initiated`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "SUCCESS";
      docketClient.postToDocket(chargeplanAudit);
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
      chargeplanAudit.name = "EXCEPTION ON CHARGEPLAN_FIND";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      chargeplanAudit.details = `ChargePlan find failed`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "FAILURE";
      docketClient.postToDocket(chargeplanAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};


module.exports.update = (tenantId, code, updateObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (updateObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      chargeplanAudit.name = "CHARGEPLAN_UPDATE INITIALIZED";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = JSON.stringify(updateObject);
      chargeplanAudit.details = `ChargePlan update is initiated`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "SUCCESS";
      docketClient.postToDocket(chargeplanAudit);
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
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "CHARGEPLAN",
                "wfEntityAction": "UPDATE",
                "createdBy": createdBy,
                "query": findResult[0]._id,
                "object": findResult[0]                   
               };
              debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
              sweClient.initialize(sweEventObject).then((sweResult) => {
                var filterCode = {
                  "tenantId": tenantId,
                  "name": findResult[0].name
                };
                debug(`calling db update filterCode :${JSON.stringify(filterCode)} is a parameter`);
                collection.update(filterCode, {
                  "processingStatus": sweResult.data.wfInstanceStatus,
                  "wfInstanceId": sweResult.data.wfInstanceId
                }).then((planObject) => {
                  debug(`collection.update:chargePlan updated with workflow status and id:${JSON.stringify(codeObject)}`);
                  resolve(planObject);
                }).catch((e) => {
                  var reference = shortid.generate();
                  debug(`collection.update promise failed due to :${e} and referenceId :${reference}`);
                  reject(e);
                });
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`sweClient.initialize promise failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
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
      chargeplanAudit.name = "EXCEPTION ON CHARGEPLAN_UPDATE";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = JSON.stringify(updateObject);
      chargeplanAudit.details = `ChargePlan UPDATE failed`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "FAILURE";
      docketClient.postToDocket(chargeplanAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.updateWorkflow = (tenantId, ipAddress, createdBy, id, update) => {
  debug(`index update method: tenantId :${tenantId}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/id/update is null or undefined");
      }
      chargeplanAudit.name = "CRGPLAN_SWE_UPDATE INITIALIZED";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = `update charge plan with  ${JSON.stringify(update)}`;
      chargeplanAudit.details = `charge plan update method`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "SUCCESS";
      docketClient.postToDocket(chargeplanAudit);
      var filterCode = {
        "tenantId": tenantId,
        "_id": id
      };
      debug(`calling db update method, filterCode: ${JSON.stringify(filterCode)},update: ${JSON.stringify(update)}`);
      collection.update(filterCode, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      var reference = shortid.generate();
      chargeplanAudit.name = "CHRGPLAN_EXCEPTION_ON_SWEUPDATE";
      chargeplanAudit.source = "CHARGEPLANSERVICE";
      chargeplanAudit.ipAddress = ipAddress;
      chargeplanAudit.createdBy = createdBy;
      chargeplanAudit.keyDataAsJSON = `Charge plan user with object ${JSON.stringify(update)}`;
      chargeplanAudit.details = `caught Exception on chargeplan_update ${e.message}`;
      chargeplanAudit.eventDateTime = Date.now();
      chargeplanAudit.status = "FAILURE";
      docketClient.postToDocket(chargeplanAudit);
      debug(`try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};