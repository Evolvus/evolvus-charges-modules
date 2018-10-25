const debug = require("debug")("evolvus-charges-chargePlan.test.db.chargePlan");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const chargePlan = require("../../db/chargePlan");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost/TestchargePlanCollection";

chai.use(chaiAsPromised);

// High level wrapper
// Testing db/chargesGlParameters.js
describe("db chargePlan testing", () => {
      /*
       ** Before doing any tests, first get the connection.
       */
      before((done) => {
        mongoose.connect(MONGO_DB_URL);
        let connection = mongoose.connection;
        connection.once("open", () => {
          debug("ok got the connection");
          done();
        });
      });

      let object1 = {
        // add a valid chargesGlParameters object

      };
      let object2 = {
        // add a valid chargesGlParameters object

      };

      describe("testing chargePlan.save", () => {
        // Testing save
        // 1. Valid chargesGlParameters should be saved.
        // 2. Non chargesGlParameters object should not be saved.
        // 3. Should not save same chargesGlParameters twice.
        beforeEach((done) => {
          chargePlan.deleteAll()
            .then((data) => {
              done();
            });
        });

        it("should save valid chargePlan to database", (done) => {
          let testchargePlanCollection = {
            // add a valid chargesGlParameters object
          };
          let res = chargePlan.save(testchargePlanCollection);
          expect(res)
            .to.eventually.include(testchargePlanCollection)
            .notify(done);
        });

        it("should fail saving invalid object to database", (done) => {
          // not even a  object

          let invalidObject = {
            // add a invalid chargesGlParameters object

          };
          let res = chargePlan.save(invalidObject);
          expect(res)
            .to.be.eventually.rejectedWith("chargePlanCollection validation failed")
            .notify(done);
        });
      });