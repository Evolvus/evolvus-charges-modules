const debug = require("debug")("evolvus-charges-billing:index");
const model = require("./model/chargesBillingSchema");
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
const sweClient = require("@evolvus/evolvus-swe-client");
const generatePdf=require("@evolvus/evolvus-charges-generate-pdf");
const sendEmail=require("@evolvus/evolvus-charges-email-service");
var moment=require("moment");

audit.application = "CHARGES";
audit.source = "Billing";

module.exports = {
  modelSchema,
  dbSchema,
  filterAttributes
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

module.exports.update = (billNumber, updateObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (billNumber == null || updateObject == null) {
        throw new Error("IllegalArgumentException: BillNumber or Input value is null or undefined");
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
        collection.findOne({
          "billNumber": billNumber
        }).then((billObject) => {
          if (billObject) {

            collection.update({
              "billNumber": billNumber
            }, updateObject).then((result) => {
              debug(`Bill updated successfully ${JSON.stringify(result)}`);
              var sweEventObject = {
                "tenantId": billObject.utilityCode,
                "wfEntity": "BILL",
                "wfEntityAction": "UPDATE",
                "createdBy": createdBy,
                "query": billNumber,
                "object": billObject
              };
              sweClient.initialize(sweEventObject).then((sweResult) => {
                var filterBill = {
                  "utilityCode": billObject.utilityCode,
                  "billNumber": billNumber
                };
                debug(`calling db update filterBill :${JSON.stringify(filterBill)} is a parameter`);
                collection.update(filterBill, {
                  "billStatus": sweResult.data.wfInstanceStatus,
                  "wfInstanceId": sweResult.data.wfInstanceId
                }).then((bill) => {
                  debug(`collection.update:bill updated with workflow status and id:${JSON.stringify(bill)}`);
                  resolve(bill);
                }).catch((e) => {
                  debug("updating workflow status and id promise failed", e);
                  reject(e)
                });
              }).catch((e) => {
                debug(`SWE initialize promise failed: ${e}`);
                reject(e);
              });
            }).catch((e) => {
              debug(`Bill update promise failed: ${e}`);
              reject(e);
            });
          } else {
            debug(`Bill ${billNumber} not found`);
            reject(`Bill ${billNumber} not found`);
          }
        }).catch((e) => {
          debug(`Finding bill promise failed`, e);
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
      let filterObject = _.pick(filter, filterAttributes);
      if (filter.fromDate != null && filter.toDate != null) {
        filterObject = {
          $and: [{
            $and: [filterObject]
          },
          {
            $and: [{
              billDate: {
                $gte: filter.fromDate
              }
            }, {
              billDate: {
                $lte: filter.toDate
              }
            }]
          }
          ]
        };
      }
      collection.find(filterObject, orderby, skipCount, limit).then((result) => {
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

module.exports.generateBill = (corporate, transactions, billPeriod, createdBy, ipAddress) => {
  return new Promise((resolve, reject) => {
    try {
      let sum = 0;
      let details = [];
      corporate.chargePlan.chargeCodes.forEach(chargeCode => {
        transactions.forEach(transaction => {
          _.mapKeys(transaction, function (value, key) {
            let object = {};
            if (key == chargeCode.transactionType.code) {
              object.name = chargeCode.transactionType.name;
              object.rate = chargeCode.amount;
              object.number = value;
              object.plan = corporate.chargePlan.name;
              sum = sum + (chargeCode.amount * Number(value));
              object.sum = chargeCode.amount * Number(value);
              details.push(object);
            }
          });
        });
      });

      glParameters.find({}, {}, 0, 0, ipAddress, createdBy).then((glAccount) => {
        billingObject = {};
        billingObject.details = details;
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
        billingObject.billPeriod = billPeriod;
        billingObject.actualGSTAmount = billingObject.finalGSTAmount = sum * (glAccount[0].GSTRate / 100);
        billingObject.actualTotalAmount = billingObject.finalTotalAmount = billingObject.actualChargesAmount + billingObject.actualGSTAmount;
        collection.save(billingObject, ipAddress, createdBy).then((res) => {
          generatePdf.generatePdf(res, corporate, glAccount[0].GSTRate).then((pdf) => {
            debug("PDF generated successfully.");
            var emailDetails = {
              utilityCode: corporate.utilityCode,
              billPeriod: res.billPeriod,
              billDate:moment(res.billDate).format("MMMM DD YYYY"),
              finalTotalAmount: res.finalTotalAmount,
              billNumber: res.billNumber
            };
            sendEmail.sendMail(corporate.emailId, emailDetails, pdf.filename).then((email) => {
              debug("Email sent.");
              resolve(email);
            }).catch(e => {
              debug(e);
              reject(e);
            })
          }).catch(e => {
            debug(e);
            reject(e)
          });

        }).catch(e => {
          reject(e)
        })
      })
    } catch (error) {
      reject(error);
    }

  });

};

module.exports.updateWorkflow = (utilityCode, ipAddress, createdBy, billNumber, update) => {
  debug(`index update workflow method: utilityCode :${utilityCode}, billNumber :${billNumber}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (utilityCode == null || billNumber == null || update == null) {
        throw new Error("IllegalArgumentException:utilityCode or billNumber or input is null or undefined");
      }
      audit.name = "BILL_WORKFLOW_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update bill with  ${JSON.stringify(update)}`;
      audit.details = `bill update method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      if (update.processingStatus === "AUTHORIZED") {
        update.billStatus = "CBS_POSTING_SUCCESSFUL";
      } else if (update.processingStatus === "FAILURE") {
        update.billStatus = "CBS_POSTING_FAILURE";
      } else {
        update.billStatus = "REJECTED";
      }
      var filterBill = {
        "utilityCode": utilityCode,
        "billNumber": billNumber
      };
      debug(`calling db update method, filterBill: ${JSON.stringify(filterBill)},update: ${JSON.stringify(update)}`);
      collection.update(filterBill, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      var reference = shortid.generate();
      audit.name = "BILL_EXCEPTION_ON_WORKFLOWUPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with object ${JSON.stringify(update)}`;
      audit.details = `caught Exception on user_update ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
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