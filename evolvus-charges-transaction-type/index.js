const debug = require("debug")("evolvus-charges-transaction-type:index");
const model = require("./model/chargesTransactionTypeSchema");
const dbSchema = require("./db/chargesTransactionTypeSchema").schema;    
const validate = require("jsonschema").validate;
const docketClient=require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;
const Dao = require("@evolvus/evolvus-mongo-dao").Dao; 
const collection = new Dao("chargesTransactionType", dbSchema);

const modelSchema = model.schema;

module.exports = {
  dbSchema,  
  modelSchema
  };

  audit.application = "CHARGES";
  audit.source = "ChargesTransactionType";


module.exports.save = (chargesTransactionTypeObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if(typeof chargesTransactionTypeObject==null) {
        throw new Error("IllegalArgumentException:chargesTransactionTypeObject is null/undefined");
      } else if(ipAddress == null){
        throw new Error("IllegalArgumentException:ipAddress is null/undefined");
      }else if(createdBy == null){
        throw new Error("IllegalArgumentException:createdBy is null/undefined");
      }

      audit.name="ChargesTransactionType_Save";
      audit.keyDataAsJSON=JSON.stringify(chargesTransactionTypeObject);
      audit.details=`chargesTransactionType creation initiated`;
      docketClient.postToDocket(audit);
      var res = validate(chargesTransactionTypeObject, modelSchema);
      debug("validation status: ", JSON.stringify(res));
      if(!res.valid) {
        reject(res.errors);
      }else{
        collection.save(chargesTransactionTypeObject).then((result) => {
          debug(`Saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`Failed to save with error: ${e}`);   
          reject(e);
        });
      }

    } catch (e) {
      audit.name="ChargesTransactionType_ExceptionOnSave";
      audit.keyDataAsJSON=JSON.stringify(chargesTransactionTypeObject);
      audit.details=`Caught Exception on ChargesTransactionType_Save ${e.message}`;
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      audit.name = "CHARGES_TRANSACTIONTYPE_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "";
      audit.details = `Charges transaction type find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of TxnType found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch all transaction types: ${e}`);
        reject(e);
      });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_TRANSACTIONTYPE_FIND";
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
