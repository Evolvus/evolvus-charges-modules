const debug = require("debug")("evolvus-charges-corporate-linkage:index");
const _ = require('lodash');
const model = require("./model/chargesCorporateLinkageSchema");
const dbSchema = require("./db/chargesCorporateLinkageSchema").schema;
const validate = require("jsonschema")
 .validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const corporateAudit = docketClient.audit;
const chargePlan = require("@evolvus/evolvus-charges-charge-plan");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargescorporatelinkage", dbSchema);
const sweClient = require("@evolvus/evolvus-swe-client");
var modelSchema = model.schema;
const name=process.env.APPLICATION_NAME || "CHARGES";
var shortid = require('shortid');
corporateAudit.application = name;
corporateAudit.source = "CORPORATELINKAGESERVICE";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (tenantId, corporateLinkageObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (corporateLinkageObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      debug("this is akshatha");
      corporateAudit.name = "CORPORATELINKAGE_SAVE INITIALIZED";
      corporateAudit.source = "CORPORATELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = JSON.stringify(corporateLinkageObject);
      corporateAudit.details = `Charges corporate linkage save is initiated`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "SUCCESS";
      docketClient.postToDocket(corporateAudit);
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
                  var sweEventObject = {
                    "tenantId": tenantId,
                    "wfEntity": "CHARGELINKAGE",
                    "wfEntityAction": "CREATE",
                    "createdBy": createdBy,
                    "query": result._id,
                    "object": corporateLinkageObject
                  };
                  debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
                  sweClient.initialize(sweEventObject).then((sweResult) => {
                    var filterCode = {
                      "tenantId": tenantId,
                      "utilityCode": corporateLinkageObject.utilityCode
                    };
                    debug(sweResult.data.wfInstanceStatus);
                    debug(`calling db update filterCode :${JSON.stringify(filterCode)} is a parameter`);
                    collection.update(filterCode, {
                      "processingStatus": sweResult.data.wfInstanceStatus,
                      "wfInstanceId": sweResult.data.wfInstanceId
                    }).then((planObject) => {
                      debug(`collection.update:user updated with workflow status and id:${JSON.stringify(planObject)}`);
                      resolve(corporateLinkageObject);
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
      corporateAudit.name = "EXCEPTION ON CORP_LINKAGE_UPDATE";
      corporateAudit.source = "CORPORATELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = JSON.stringify(corporateLinkageObject);
      corporateAudit.details = `Charges gl paramaters save is failed`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "FAILURE";
      docketClient.postToDocket(corporateAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      corporateAudit.name = "CORPORATELINKAGE_FIND INITIALIZED";
      corporateAudit.source = "CORPORATELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      corporateAudit.details = `Charges Corporate Linkage find is initiated`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "SUCCESS";
      docketClient.postToDocket(corporateAudit);
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
      corporateAudit.name = "EXCEPTION ON CORP_LINKAGE_FIND";
      corporateAudit.source = "CORPORATELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      corporateAudit.details = `Charges Corporate Linkage find failed`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "FAILURE";
      docketClient.postToDocket(corporateAudit);
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
      corporateAudit.name = "CORP_LINKAGE_UPDATE INITIALIZED";
      corporateAudit.source = "CORPORATELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = JSON.stringify(updateObject);
      corporateAudit.details = `Charges corporate linkage update is initiated`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "SUCCESS";
      docketClient.postToDocket(corporateAudit);
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
            // "_id": updateObject.chargePlan
            "name": updateObject.chargePlan
          };
        }
        Promise.all([chargePlan.find(filter, {}, 0, 1, ipAddress, createdBy), collection.find({
          "utilityCode": code
        }, {}, 0, 1)]).then((findResult) => {
          debug(findResult[0][0]);
          debug(findResult[1][0]);
          if (_.isEmpty(findResult[0][0])) {
            throw new Error(`Invalid chargePlan`);
          } else if (_.isEmpty(findResult[1][0])) {
            throw new Error(`UtilityCode ${code} not Found`);
          } else if ((!_.isEmpty(findResult[1][0])) && (findResult[1][0].utilityCode != code)) {
            throw new Error(`UtilityCode ${code} cannot be modified`);
          } else {
            updateObject.chargePlan = findResult[0][0]._id;
            collection.update({
              "utilityCode": code
            }, updateObject).then((result) => {
              if (result.nModified == 1) {
                debug(`updated successfully ${result}`);
                  var sweEventObject = {
                    "tenantId": tenantId,
                    "wfEntity": "CHARGELINKAGE",
                    "wfEntityAction": "UPDATE",
                    "createdBy": createdBy,
                    "query": findResult[1][0]._id,
                    "object": updateObject                   
                   };
                  debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
                  sweClient.initialize(sweEventObject).then((sweResult) => {
                    var filterCode = {
                      "tenantId": tenantId,
                      "utilityCode": code
                    };
                    debug(`calling db update filterCode :${JSON.stringify(filterCode)} is a parameter`);
                    collection.update(filterCode, {
                      "processingStatus": sweResult.data.wfInstanceStatus,
                      "wfInstanceId": sweResult.data.wfInstanceId
                    }).then((planObject) => {
                      debug(`collection.update:chargeLinkage updated with workflow status and id:${JSON.stringify(codeObject)}`);
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
      corporateAudit.name = "EXCEPTION ON CORP_LINKAGE_UPDATE";
      corporateAudit.source = "CORPORATELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = JSON.stringify(updateObject);
      corporateAudit.details = `Charges corpporate linkage UPDATE failed`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "FAILURE";
      docketClient.postToDocket(corporateAudit);
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
      corporateAudit.name = "CRGLINKAGE_SWE_UPDATE INITIALIZED";
      corporateAudit.source = "CHARGELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = `update charge linkage with  ${JSON.stringify(update)}`;
      corporateAudit.details = `charge linkage update method`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "SUCCESS";
      docketClient.postToDocket(corporateAudit);
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
      corporateAudit.name = "CHRGLINKAGE_EXCEPTION_ON_SWEUPDATE";
      corporateAudit.source = "CHARGELINKAGESERVICE";
      corporateAudit.ipAddress = ipAddress;
      corporateAudit.createdBy = createdBy;
      corporateAudit.keyDataAsJSON = `Charge Linkage user with object ${JSON.stringify(update)}`;
      corporateAudit.details = `caught Exception on chargelinkage_update ${e.message}`;
      corporateAudit.eventDateTime = Date.now();
      corporateAudit.status = "FAILURE";
      docketClient.postToDocket(corporateAudit);
      debug(`try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};