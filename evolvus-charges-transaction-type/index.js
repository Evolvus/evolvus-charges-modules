const debug = require("debug")("evolvus-charges-transaction-type:index");
const model = require("./model/chargesTransactionTypeSchema");
const dbSchema = require("./db/chargesTransactionTypeSchema").schema;
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const transactionAudit = docketClient.audit;
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("chargesTransactionType", dbSchema);
const name = process.env.APPLICATION_NAME || "CHARGES";
const modelSchema = model.schema;

module.exports = {
  dbSchema,
  modelSchema
};

transactionAudit.application = name;
transactionAudit.source = "TRANSACTIONTYPESERVICE";


module.exports.save = (chargesTransactionTypeObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof chargesTransactionTypeObject == null) {
        throw new Error("IllegalArgumentException:chargesTransactionTypeObject is null/undefined");
      } else if (ipAddress == null) {
        throw new Error("IllegalArgumentException:ipAddress is null/undefined");
      } else if (createdBy == null) {
        throw new Error("IllegalArgumentException:createdBy is null/undefined");
      }

      transactionAudit.name = "ChargesTransactionType_Save";
      transactionAudit.source = "TRANSACTIONTYPESERVICE";
      transactionAudit.keyDataAsJSON = JSON.stringify(chargesTransactionTypeObject);
      transactionAudit.details = `chargesTransactionType creation initiated`;
      docketClient.postToDocket(transactionAudit);
      var res = validate(chargesTransactionTypeObject, modelSchema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        collection.save(chargesTransactionTypeObject).then((result) => {
          debug(`Saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`Failed to save with error: ${e}`);
          reject(e);
        });
      }

    } catch (e) {
      transactionAudit.name = "ChargesTransactionType_ExceptionOnSave";
      transactionAudit.source = "TRANSACTIONTYPESERVICE";
      transactionAudit.keyDataAsJSON = JSON.stringify(chargesTransactionTypeObject);
      transactionAudit.details = `Caught Exception on ChargesTransactionType_Save ${e.message}`;
      docketClient.postToDocket(transactionAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      transactionAudit.name = "CHARGES_TRANSACTIONTYPE_FIND INITIALIZED";
      transactionAudit.source = "TRANSACTIONTYPESERVICE";
      transactionAudit.ipAddress = ipAddress;
      transactionAudit.createdBy = createdBy;
      transactionAudit.keyDataAsJSON = "";
      transactionAudit.details = `Charges transaction type find is initiated`;
      transactionAudit.eventDateTime = Date.now();
      transactionAudit.status = "SUCCESS";
      docketClient.postToDocket(transactionAudit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of TxnType found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch all transaction types: ${e}`);
        reject(e);
      });
    } catch (e) {
      transactionAudit.name = "EXCEPTION IN CHARGES_TRANSACTIONTYPE_FIND";
      transactionAudit.source = "TRANSACTIONTYPESERVICE";
      transactionAudit.ipAddress = ipAddress;
      transactionAudit.createdBy = createdBy;
      transactionAudit.keyDataAsJSON = "";
      transactionAudit.details = ``;
      transactionAudit.eventDateTime = Date.now();
      transactionAudit.status = "FAILURE";
      docketClient.postToDocket(transactionAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};