const debug = require("debug")("evolvus-charges-charge-code:index");
const model = require("./model/chargesChargeCodeSchema");
const db = require("./db/chargesChargeCodeSchema");
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const chargecodeAudit = docketClient.audit;
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargecode", db.schema);
const schemeType = require("@evolvus/evolvus-charges-scheme-type");
const transactionType = require("@evolvus/evolvus-charges-transaction-type");
const _ = require("lodash");

const dbSchema = db.schema;
const modelSchema = model.schema;
const name = process.env.APPLICATION_NAME || "CHARGES";

module.exports = {
  dbSchema,
  modelSchema
};

chargecodeAudit.application = name;
chargecodeAudit.source = "CHARGECODESERVICE";

module.exports.save = (chargesChargeCodeObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof chargesChargeCodeObject == null) {
        throw new Error(
          "IllegalArgumentException: chargesChargeCodeObject is null/undefined"
        );
      } else if (ipAddress == null) {
        throw new Error("IllegalArgumentException:ipAddress is null/undefined");
      } else if (createdBy == null) {
        throw new Error("IllegalArgumentException:createdBy is null/undefined");
      }

      chargecodeAudit.name = "ChargesChargeCode_save";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.keyDataAsJSON = JSON.stringify(chargesChargeCodeObject);
      chargecodeAudit.details = `ChargesChargeCode creation initiated`;
      docketClient.postToDocket(chargecodeAudit);
      var res = validate(chargesChargeCodeObject, modelSchema);
      debug("Validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        getSchemeTypeAndTransactionType(
            chargesChargeCodeObject.schemeType,
            chargesChargeCodeObject.transactionType,
            ipAddress,
            createdBy
          )
          .then(searchResult => {
            if (_.isEmpty(searchResult[0])) {
              throw new Error("Invalid Scheme Type");
            } else if (_.isEmpty(searchResult[1])) {
              throw new Error("Invalid Transaction Type");
            } else {
              chargesChargeCodeObject.transactionType = searchResult[1][0]._id;
              let filter = {
                "name": chargesChargeCodeObject.name.toUpperCase()
              };
              collection.find(filter, {}, 0, 1).then((findResult) => {
                if (!_.isEmpty(findResult)) {
                  throw new Error(`ChargeCode ${chargesChargeCodeObject.name.toUpperCase()} is already exists`);
                } else {
                  chargesChargeCodeObject.name = chargesChargeCodeObject.name.toUpperCase();
                  collection
                    .save(chargesChargeCodeObject)
                    .then(result => {
                      debug(`saved successfully ${result}`);
                      resolve(result);
                    })
                    .catch(e => {
                      debug(`failed to save with an error: ${e}`);
                      reject(e);
                    });
                }
              }).catch((e) => {
                debug(`Failed to find With an error ${e}`);
                reject(e);
              });
            }
          })
          .catch(error => {
            debug(`failed to fetch Scheme Type and Transaction Type: ${error}`);
            reject(error);
          });
      }
    } catch (e) {
      chargecodeAudit.name = "ChargesChargeCode_ExceptionOnSave";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.keyDataAsJSON = JSON.stringify(chargesChargeCodeObject);
      chargecodeAudit.details = `Caught Exception on chargesChargeCode_save ${e.message}`;
      docketClient.postToDocket(chargecodeAudit);
      debug(`Caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (
  filter,
  orderby,
  skipCount,
  limit,
  ipAddress,
  createdBy
) => {
  return new Promise((resolve, reject) => {
    try {
      chargecodeAudit.name = "CHARGES_CODE_FIND INITIALIZED";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.ipAddress = ipAddress;
      chargecodeAudit.createdBy = createdBy;
      chargecodeAudit.keyDataAsJSON = "";
      chargecodeAudit.details = `Charges Code find is initiated`;
      chargecodeAudit.eventDateTime = Date.now();
      chargecodeAudit.status = "SUCCESS";
      docketClient.postToDocket(chargecodeAudit);
      let populate = ["transactionType"];
      collection
        .findAndPopulate(filter, populate, orderby, skipCount, limit)
        .then(result => {
          debug(`Number of Charge Code found is ${result.length}`);
          resolve(result);
        })
        .catch(e => {
          debug(`failed to fetch Charge Codes: ${e}`);
          reject(e);
        });
    } catch (e) {
      chargecodeAudit.name = "EXCEPTION IN CHARGES_CODE_FIND";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.ipAddress = ipAddress;
      chargecodeAudit.createdBy = createdBy;
      chargecodeAudit.keyDataAsJSON = "";
      chargecodeAudit.details = ``;
      chargecodeAudit.eventDateTime = Date.now();
      chargecodeAudit.status = "FAILURE";
      docketClient.postToDocket(chargecodeAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

getSchemeTypeAndTransactionType = (
  schemeTypeName,
  transactionTypeName,
  ipAddress,
  createdBy
) => {
  return new Promise((resolve, reject) => {
    try {
      chargecodeAudit.name = "SCHEMETYPE_FIND and TRANSACTION_FIND INITIALIZED";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.ipAddress = ipAddress;
      chargecodeAudit.createdBy = createdBy;
      chargecodeAudit.keyDataAsJSON = "";
      chargecodeAudit.details = `SchemeType and TransactionType Find is initiated`;
      chargecodeAudit.eventDateTime = Date.now();
      chargecodeAudit.status = "SUCCESS";
      docketClient.postToDocket(chargecodeAudit);

      var schemeTypeFilter = {
        name: schemeTypeName
      };

      var transactionTypeFilter = {
        name: transactionTypeName
      };

      Promise.all([
          schemeType.find(schemeTypeFilter, {}, 0, 1, ipAddress, createdBy),
          transactionType.find(
            transactionTypeFilter, {},
            0,
            1,
            ipAddress,
            createdBy
          )
        ])
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          reject(`Failed to fetch Scheme Type and Transaction Type : ${error}`);
        });
    } catch (e) {
      chargecodeAudit.name = "EXCEPTION IN SCHEMETYPE_FIND and TRANSACTIONTYPE_FIND";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.ipAddress = ipAddress;
      chargecodeAudit.createdBy = createdBy;
      chargecodeAudit.keyDataAsJSON = "";
      chargecodeAudit.details = ``;
      chargecodeAudit.eventDateTime = Date.now();
      chargecodeAudit.status = "FAILURE";
      docketClient.postToDocket(chargecodeAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.update = (code, updateObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (updateObject == null) {
        throw new Error(
          "IllegalArgumentException: Input value is null or undefined"
        );
      } else {
        let filter = {};
        let filter1 = {};
        if (updateObject.schemeType && updateObject.transactionType) {
          filter = {
            "name": updateObject.schemeType
          };
          filter1 = {
            "_id": updateObject.transactionType
          };
        } else if (updateObject.schemeType) {
          filter = {
            "name": updateObject.schemeType
          };
        } else if (updateObject.transactionType) {
          filter1 = {
            "_id": updateObject.transactionType
          };
        }
        chargecodeAudit.name = "CHARGECODE_UPDATE INITIALIZED";
        chargecodeAudit.ipAddress = ipAddress;
        chargecodeAudit.createdBy = createdBy;
        chargecodeAudit.keyDataAsJSON = JSON.stringify(updateObject);
        chargecodeAudit.details = `ChargeCode update is initiated`;
        chargecodeAudit.eventDateTime = Date.now();
        chargecodeAudit.status = "SUCCESS";
        docketClient.postToDocket(chargecodeAudit);
        Promise.all([schemeType.find(filter, {}, 0, 1, ipAddress, createdBy), transactionType.find(filter1, {}, 0, 1, ipAddress, createdBy)]).then((findResult) => {
          if (_.isEmpty(findResult[0])) {
            throw new Error("Invalid Scheme Type");
          } else if (_.isEmpty(findResult[1])) {
            throw new Error("Invalid Transaction Type");
          } else {
            collection.find({
              "name": code
            }, {}, 0, 1).then((findResult) => {
              if (_.isEmpty(findResult[0])) {
                throw new Error("Invalid ChargeCode");
              } else if ((!_.isEmpty(findResult[0])) && (findResult[0].name != code)) {
                throw new Error(`ChargeCode Name ${code} cannot be modified`);
              } else {
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
                  debug(`Failed to update with an error ${e}`);
                  reject(e);
                });
              }
            }).catch((e) => {
              debug(`Failed to Find chargeCode with an error ${e}`);
              reject(e);
            });
          }
        }).catch((e) => {
          debug(`Failed in promiseAll ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      chargecodeAudit.name = "EXCEPTION IN CHARGECODE_UPDATE";
      chargecodeAudit.source = "CHARGECODESERVICE";
      chargecodeAudit.ipAddress = ipAddress;
      chargecodeAudit.createdBy = createdBy;
      chargecodeAudit.keyDataAsJSON = JSON.stringify(updateObject);
      chargecodeAudit.details = `ChargeCode UPDATE failed`;
      chargecodeAudit.eventDateTime = Date.now();
      chargecodeAudit.status = "FAILURE";
      docketClient.postToDocket(chargecodeAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};