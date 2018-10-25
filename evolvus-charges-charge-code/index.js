const debug = require("debug")("evolvus-charges-charge-code:index");
const model = require("./model/chargesChargeCodeSchema");
const db = require("./db/chargesChargeCodeSchema");
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargeCode", db.schema);
const schemeType = require("@evolvus/evolvus-charges-scheme-type");
const transactionType = require("@evolvus/evolvus-charges-transaction-type");
const _ = require("lodash");

const dbSchema = db.schema; 
const modelSchema = model.schema;

module.exports = {
  dbSchema,
  modelSchema
};


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

      audit.name = "ChargesChargeCode_save";
      audit.keyDataAsJSON = JSON.stringify(chargesChargeCodeObject);
      audit.details = `ChargesChargeCode creation initiated`;
      docketClient.postToDocket(audit);
      var res = validate(chargesChargeCodeObject, modelSchema);
      debug("Validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      }



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
        })
        .catch(error => {
          debug(`failed to fetch Scheme Type and Transaction Type: ${error}`);
          reject(error);
        });
    } catch (e) {
      audit.name = "ChargesChargeCode_ExceptionOnSave";
      audit.keyDataAsJSON = JSON.stringify(chargesChargeCodeObject);
      audit.details = `Caught Exception on chargesChargeCode_save ${e.message}`;
      docketClient.postToDocket(audit);
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
      audit.name = "CHARGES_CODE_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = `Charges Code find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      collection
        .find(filter, orderby, skipCount, limit)
        .then(result => {
          debug(`Number of Charge Code found is ${result.length}`);
          resolve(result);
        })
        .catch(e => {
          debug(`failed to fetch Charge Codes: ${e}`);
          reject(e);
        });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_CODE_FIND";
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

module.exports.update = (
  chargesChargeCodeObject,
  name,
  ipAddress,
  createdBy
) => {
  return new Promise((resolve, reject) => {
    try {
      audit.name = "CHARGES_CODE_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = `Charges Code update is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var updateObject = {
        name: name
      };
      var schemeTypeFilter = {
        name: chargesChargeCodeObject.name
      };
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
            collection
              .update(updateObject, chargesChargeCodeObject)
              .then(result => {
                debug(`modified successfully ${result}`);
                resolve(result);
              })
              .catch(error => {
                debug(`failed to modify Charge Code: ${error}`);
                reject(error);
              });
          }
        })
        .catch(error => {
          debug(`failed to fetch Scheme Type and Transaction Type: ${error}`);
          reject(error);
        });
    } catch (error) {
      audit.name = "EXCEPTION IN CHARGES_CODE_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = ``;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${error}`);
      reject(error);
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
      audit.name = "SCHEMETYPE_FIND and TRANSACTION_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = `SchemeType and TransactionType Find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);

      var schemeTypeFilter = {
        name: schemeTypeName
      };

      var transactionTypeFilter = {
        name: transactionTypeName
      };

      Promise.all([
        schemeType.find(schemeTypeFilter, {}, 0, 1, ipAddress, createdBy),
        transactionType.find(
          transactionTypeFilter,
          {},
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
      audit.name = "EXCEPTION IN SCHEMETYPE_FIND and TRANSACTIONTYPE_FIND";
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
