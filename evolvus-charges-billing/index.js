const debug = require("debug")("evolvus-charges-billing:index");
const model = require("./model/chargesBillingSchema")
  .schema;
const dbSchema = require("./db/chargesBillingSchema");
const validate = require("jsonschema").validate;
const _ = require('lodash');
const glParameters = require("@evolvus/evolvus-charges-gl-parameters");
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = docketClient.audit;
var randomString = require('random-string');
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("billing", dbSchema);
var modelSchema = model.schema;

audit.application = "CHARGES";
audit.source = "Billing";

module.exports = {
  modelSchema,
  dbSchema
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (billingObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (billingObject == null) {
        throw new Error("IllegalArgumentException: Input value is null or undefined");
      }
      audit.name = "CHARGES_BILLING_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(billingObject);
      audit.details = `Charges gl paramaters save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var res = validate(billingObject, modelSchema);
      debug("validation status: ", JSON.stringify(res.valid));
      if (!res.valid) {
        reject(res.errors);
      } else {
        collection.save(billingObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_BILLING_SAVE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(billingObject);
      audit.details = `Charges billing save is initiated`;
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
      audit.name = "CHARGES_BILLING_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(updateObject);
      audit.details = `Charges billing update is initiated`;
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
        collection.update({ "_id": id }, updateObject).then((result) => {
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
      audit.name = "EXCEPTION IN CHARGES_BILLING_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(update);
      audit.details = `Charges billing UPDATE failed`;
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
      audit.name = "CHARGES_BILLING_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `Charges billing find is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      collection.find(filter, orderby, skipCount, limit).then((result) => {
        debug(`Number of Bills found is ${result.length}`);
        resolve(result);
      }).catch((e) => {
        debug(`failed to fetch GlParameters: ${e}`);
        reject(e);
      });
    } catch (e) {
      audit.name = "EXCEPTION IN CHARGES_BILLING_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      audit.details = `Charges Billing find failed`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.generateBill = (corporate, transactions, createdBy, ipAddress) => {
  return new Promise((resolve, reject) => {
    try {
      let sum = 0;
      corporate.chargePlan.chargeCodes.forEach(chargeCode => {
        transactions.forEach(transaction => {
          _.mapKeys(transaction, function (value, key) {
            if (key == chargeCode.transactionType.code) {
              sum = sum + (chargeCode.amount * Number(value));
            }
          });
        });
      });

      glParameters.find({}, {}, 0, 0, ipAddress, createdBy).then((glAccount) => {
        billingObject = {};
        billingObject.actualChargesAmount = billingObject.finalChargesAmount = sum;
        billingObject.billFrequency = "Monthly";
        billingObject.billNumber = randomString({
          length: 10,
          numeric: true,
          letters: false,
          special: false
        });
        billingObject.corporateName = corporate.corporateName;
        billingObject.utilityCode = corporate.utilityCode;
        billingObject.createdBy = billingObject.updatedBy = createdBy;
        billingObject.createdDateAndTime = billingObject.billDate = billingObject.updatedDateAndTime = new Date().toISOString();
        billingObject.billPeriod = "JAN2018";
        billingObject.actualGSTAmount = billingObject.finalGSTAmount = sum * (glAccount[0].GSTRate / 100);
        billingObject.actualTotalAmount = billingObject.finalTotalAmount = billingObject.actualChargesAmount + billingObject.actualGSTAmount;
        collection.save(billingObject, ipAddress, createdBy).then((res) => {
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    } catch (error) {
      reject(error);
    }

  });

};


module.exports.billingObject = {
  corporateName: "",
  utilityCode: "",
  billPeriod: "",
  billFrequency: "Monthly",
  actualChargesAmount: 0,
  actualGSTAmount: 0,
  actualTotalAmount: 0,
  finalChargesAmount: 0,
  finalGSTAmount: 0,
  finalTotalAmount: 0,
  createdBy: "",
  createdDateAndTime: "",
  updatedBy: "",
  updatedDateAndTime: ""
};



