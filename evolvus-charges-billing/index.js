const debug = require("debug")("evolvus-charges-billing:index");
const model = require("./model/chargesBillingSchema");
const dbSchema = require("./db/chargesBillingSchema");
const validate = require("jsonschema").validate;
const _ = require('lodash');
const glParameters = require("@evolvus/evolvus-charges-gl-parameters");
const docketClient = require("@evolvus/evolvus-docket-client");
const billAudit = docketClient.audit;
var randomString = require('random-string');
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("billing", dbSchema);
var modelSchema = model.schema;
const sweClient = require("@evolvus/evolvus-swe-client");
const generatePdf = require("@evolvus/evolvus-charges-generate-pdf");
const generateXML = require("@evolvus/evolvus-charges-generate-xml");
var corporateLinkage = require("@evolvus/evolvus-charges-corporate-linkage");
var moment = require("moment");
var fs = require("fs");
let toWords = require('to-words');
var shortid = require("shortid");
var axios = require("axios");
var name = process.env.APPLICATION_NAME || "CHARGES";
var ChargesServiceUrl = process.env.CHARGES_SERVICE_URL || "http://192.168.1.18:9292/api";
var errorCode = process.env.ERROR_CODE || "GB3";
var reattemptInDays = process.env.REATTEMPT_IN_DAYS || 3;


billAudit.application = name;
billAudit.source = "BILLSERVICE";

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
      billAudit.name = "BILLING_SAVE INITIALIZED";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(billingObject);
      billAudit.details = `Charges bill save is initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
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
      billAudit.name = "EXCEPTION ON BILLING_SAVE";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(billingObject);
      billAudit.details = `Charges billing save is failed`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
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
      billAudit.name = "BILLING_UPDATE INITIALIZED";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(updateObject);
      billAudit.details = `Charges billing update is initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
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
                "tenantId": billObject.tenantId,
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
      billAudit.name = "EXCEPTION ON BILLING_UPDATE";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(update);
      billAudit.details = `Charges billing UPDATE failed`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.find = (filter, orderby, skipCount, limit, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      billAudit.name = "BILLING_FIND INITIALIZED";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      billAudit.details = `Charges billing find is initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
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
      billAudit.name = "EXCEPTION ON BILLING_FIND";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = `The filter Object is ${JSON.stringify(filter)}`;
      billAudit.details = `Charges Billing find failed`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.generateBill = (corporate, transactions, billPeriod, createdBy, ipAddress) => {
  return new Promise((resolve, reject) => {
    try {
      billAudit.name = "BILL_GENERATION INITIALIZED";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(corporate);
      billAudit.details = `Charges bill generation initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
      let sum = 0;
      let details = [];
      corporate.chargePlan.chargeCodes.forEach(chargeCode => {
        transactions.forEach(transaction => {
          _.mapKeys(transaction, function (value, key) {
            let object = {};
            if (key == chargeCode.transactionType.code) {
              object.name = chargeCode.transactionType.name;
              object.rate = chargeCode.amount;
              object.transactions = value;
              sum = sum + (chargeCode.amount * Number(value));
              object.actualAmount = object.finalAmount = chargeCode.amount * Number(value);
              object.discount = object.actualAmount - object.finalAmount;
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
        billingObject.tenantId = corporate.tenantId;
        billingObject.utilityCode = corporate.utilityCode;
        billingObject.chargePlan = corporate.chargePlan.name;
        billingObject.createdBy = billingObject.updatedBy = createdBy;
        billingObject.createdDateAndTime = billingObject.billDate = billingObject.updatedDateAndTime = new Date().toISOString();
        billingObject.billPeriod = billPeriod;
        billingObject.actualGSTAmount = billingObject.finalGSTAmount = sum * Number(glAccount[0].GSTRate / 100).toFixed(2);
        billingObject.actualTotalAmount = billingObject.finalTotalAmount = billingObject.actualChargesAmount + billingObject.actualGSTAmount;
        if (billingObject.finalTotalAmount > 0) {
          collection.save(billingObject, ipAddress, createdBy).then((res) => {
            generatePDF(res, corporate, glAccount[0].GSTRate).then(response => {
              var xmlObject = {
                utilityCode: corporate.utilityCode,
                billPeriod: billPeriod,
                billNumber: billingObject.billNumber,
                finalTotalAmount: billingObject.finalTotalAmount,
                billDate: billingObject.billDate
              };
              generateXML.generateXml(corporate.emailId, "I", response.filename, xmlObject).then((xml) => {
                debug(xml);
                resolve(xml);
              }).catch((e) => {
                debug(e);
              });
            }).catch(e => {
              debug(e);
              resolve(e);
            })
          }).catch(e => {
            debug(e);
            reject(e)
          })
        } else {
          debug(`As there are no transactions, Bill will not be generated for the Utility Code ${billingObject.utilityCode}`);
          resolve(`As there are no transactions, Bill will not be generated for the Utility Code ${billingObject.utilityCode}`);
        }
      }).catch(e => {
        debug(e);
        reject(e)
      });
    } catch (error) {
      billAudit.name = "EXCEPTION ON BILL_GENERATION";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(corporate);
      billAudit.details = `Charges billing save is failed`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      debug(error);
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
      billAudit.name = "BILL_WORKFLOW_UPDATE INITIALIZED";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = `update bill with  ${JSON.stringify(update)}`;
      billAudit.details = `bill update method`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
      let emailFormat = "F";
      let GST = 0;
      let flag = "2";
      if (update.processingStatus === "AUTHORIZED") {
        update.billStatus = "CBS_POSTING_SUCCESSFUL";
        emailFormat = "S";
        flag = "1";
      } else if (update.processingStatus === "FAILURE") {
        update.billStatus = "CBS_POSTING_FAILURE";
        var date = new Date(); // Get current Date
        date.setDate(date.getDate() + Number(reattemptInDays));
        update.reattemptDate = date.toISOString();
        emailFormat = "F";
        flag = "0";
      } else {
        update.billStatus = "REJECTED";
      };
      update.reattemptedStatus = update.billStatus;
      Promise.all([collection.findOne({
        "billNumber": billNumber
      }), corporateLinkage.find({
        "utilityCode": utilityCode
      }, {}, 0, 0, ipAddress, createdBy), glParameters.find({}, {}, 0, 0, ipAddress, createdBy)]).then((result) => {
        if (result[0]) {
          GST = result[2][0].GSTRate;
          debug(`calling db update method, filterBill:${billNumber} ,update: ${JSON.stringify(update)}`);
          collection.update({
            "billNumber": billNumber
          }, update).then((resp) => {
            debug("updated successfully", resp);
            if (flag === "1") {
              generatePDF(result[0], result[1][0], GST).then((pdf) => {
                var xmlObject = {
                  utilityCode: utilityCode,
                  billPeriod: result[0].billPeriod,
                  billNumber: billNumber,
                  finalTotalAmount: result[0].finalTotalAmount,
                  billDate: result[0].billDate
                };
                generateXML.generateXml(result[1][0].emailId, emailFormat, pdf.filename, xmlObject).then((xml) => {
                  debug(xml);
                  resolve(xml);
                }).catch((e) => {
                  debug(e);
                  resolve(e);
                });
              }).catch(e => {
                debug(e)
                resolve(e)
              });
            } else if (flag === "0") {
              var xmlObject = {
                utilityCode: utilityCode,
                billPeriod: result[0].billPeriod,
                billNumber: billNumber,
                finalTotalAmount: result[0].finalTotalAmount,
                billDate: result[0].billDate,
                failureReason: result[0].postingFailureReason
              };
              generateXML.generateXml(result[1][0].emailId, emailFormat, null, xmlObject).then((xml) => {
                debug(xml);
                resolve(xml);
              }).catch((e) => {
                debug(e);
                resolve(e);
              });
            } else {
              debug("Record rejected.");
              resolve(resp);
            }
          }).catch((error) => {
            var reference = shortid.generate();
            debug(`update promise failed due to ${error}, and reference Id :${reference}`);
            reject(error);
          });
        } else {
          debug(`Bill ${billNumber} not found`);
          reject(`Bill ${billNumber} not found`);
        }
      }).catch((e) => {
        debug(`Finding bill promise failed`, e);
        reject(e);
      });

    } catch (e) {
      var reference = shortid.generate();
      billAudit.name = "EXCEPTION_ON BILL_WORKFLOWUPDATE";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = `update user with object ${JSON.stringify(update)}`;
      billAudit.details = `caught Exception on user_update ${e.message}`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      debug(`try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};

module.exports.reattempt = (bill, createdBy, ipAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      billAudit.name = "BILL_REATTEMPT INITIALIZED";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(bill);
      billAudit.details = `bill reattempt initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
      let corporateDetails;
      if (bill.errorCode == errorCode) {
        corporateDetails = await corporateLinkage.find({
          "utilityCode": bill.utilityCode
        }, {}, 0, 0, ipAddress, createdBy);       
        var result = await collection.update({
          billNumber: bill.billNumber
        }, {
          finalTotalAmount: bill.finalTotalAmount + corporateDetails[0].returnCharges
        });
        debug("Updated Bill with return charges before Posting to CBS", result);
        if (result.nModified != 1) {
          throw new Error("Not able to update return charges");
        }
      }
      axios.post(`${ChargesServiceUrl}/accountPosting`, {
        billNumber: bill.billNumber
      }, {
        headers: {
          "X-USER": createdBy,
          "X-IP-HEADER": ipAddress
        }
      }).then((res) => {
        let updateObject = {
          "reattemptFlag": "YES",
          "updatedBy": createdBy,
          "updatedDateAndTime": new Date().toISOString(),
          "reattemptedDateAndTime": new Date().toISOString()
        }
        if (res.data.data.statusFlg === "0") {
          updateObject.processingStatus = "AUTHORIZED";
        } else {
          updateObject.processingStatus = "FAILURE";
        }
        collection.findOne({
          billNumber: bill.billNumber
        }).then(billFound => {
          let reasonString = "";
          if (res.data != null && res.data.data != null && res.data.data.errorDesc != null) {
            let reasonStringLength = res.data.data.errorDesc.length;
            if (reasonStringLength > 256) {
              reasonString = res.data.data.errorDesc.substring(0, 20);
            } else {
              reasonString = res.data.data.errorDesc;
            }
          }
          updateObject.postingFailureReason = reasonString;
          updateObject.errorCode = res.data.data.errorCode;
          module.exports.updateWithoutWorkflow(bill.billNumber, updateObject, ipAddress, createdBy).then(() => {
            module.exports.updateWorkflow(billFound.utilityCode, ipAddress, createdBy, bill.billNumber, updateObject).then((updated) => {
              resolve(updated);
            }).catch(e => {
              debug(e);
              resolve(e)
            });
          }).catch(e => {
            debug(e);
            resolve(e)
          })
        }).catch(e => {
          reject(e)
        });
      }).catch(e => {
        debug(e);
        reject(e);
      });
    } catch (error) {
      billAudit.name = "EXCEPTION_ON BILL_REATTEMPT";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(bill);
      billAudit.details = `bill reattempt failed.`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      reject(error);
    }
  });
}

module.exports.updateWithoutWorkflow = (billNumber, updateObject, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (billNumber == null || updateObject == null) {
        throw new Error("IllegalArgumentException: BillNumber or Input value is null or undefined");
      }
      billAudit.name = "BILL_UPDATE_WITHOUT_WRKFLW";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(updateObject);
      billAudit.details = `Charges billing update is initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
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
              debug(`Bill updated successfully without workflow ${JSON.stringify(result)}`);
              resolve(result);
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
      billAudit.name = "EXCEPTION ON BILLING_UPDATE";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(update);
      billAudit.details = `Charges billing UPDATE without workflow failed`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.generatePdf = (filterObj, ipAddress, createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      billAudit.name = "BILL_PDF_GENERATION_FROM_UI";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(filterObj);
      billAudit.details = `Charges billing pdf generation is initiated`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "SUCCESS";
      docketClient.postToDocket(billAudit);
      var result;
      Promise.all([collection.findOne({
        "billNumber": filterObj.billNumber
      }), corporateLinkage.find({
        "utilityCode": filterObj.utilityCode
      }, {}, 0, 0, ipAddress, createdBy), glParameters.find({}, {}, 0, 0, ipAddress, createdBy)]).then((result) => {
        GST = result[2][0].GSTRate;
        generatePDF(result[0], result[1][0], GST).then((response) => {
          resolve(response);
        }).catch((e) => {
          debug(`Finding bill promise failed`, e);
          reject(e);
        });
      }).catch((e) => {
        debug(`Finding bill promise failed`, e);
        reject(e);
      });

    } catch (e) {
      billAudit.name = "EXCEPTION ON BILL_PDF_GENERATION_FROM_UI";
      billAudit.source = "BILLSERVICE";
      billAudit.ipAddress = ipAddress;
      billAudit.createdBy = createdBy;
      billAudit.keyDataAsJSON = JSON.stringify(update);
      billAudit.details = `Charges billing pdf generation failed`;
      billAudit.eventDateTime = Date.now();
      billAudit.status = "FAILURE";
      docketClient.postToDocket(billAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

function generatePDF(billObject, corporateDetails, GSTRate) {
  return new Promise((resolve, reject) => {
    billObject = billObject.toObject();
    var fromDate = moment().subtract(1, 'month').startOf('month').format('DD-MM-YYYY');
    var toDate = moment().subtract(1, 'month').endOf('month').format('DD-MM-YYYY');
    billObject.fromDate = fromDate;
    billObject.toDate = toDate;
    billObject.date = moment(billObject.billDate).format("MMMM DD YYYY");
    if (billObject.finalTotalAmount > 0) {
      if (Number(billObject.finalTotalAmount).toFixed(2) % 1 == 0) {
        billObject.toWords = toWords(billObject.finalTotalAmount, {
          currency: true
        })
      } else {
        billObject.toWords = toWords(Number(billObject.finalTotalAmount).toFixed(2), {
          currency: true
        });
      }
    } else {
      billObject.toWords = "Zero";
    }
    generatePdf.generatePdf(billObject, corporateDetails, GSTRate).then((pdf) => {
      debug("PDF generated successfully.");
      resolve(pdf);
    }).catch(e => {
      debug(e);
      resolve(e)
    });
  });

}

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