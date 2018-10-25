const debug = require("debug")("evolvus-charges-gl-parameters.test.db.chargesGlParameters");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const chargesGlParameters = require("../../db/chargesGlParameters");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost/TestchargesGlParametersCollection";

chai.use(chaiAsPromised);

// High level wrapper
// Testing db/chargesGlParameters.js
describe("db chargesGlParameters testing", () => {
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

  describe("testing chargesGlParameters.save", () => {
    // Testing save
    // 1. Valid chargesGlParameters should be saved.
    // 2. Non chargesGlParameters object should not be saved.
    // 3. Should not save same chargesGlParameters twice.
    beforeEach((done) => {
      chargesGlParameters.deleteAll()
        .then((data) => {
          done();
        });
    });

    it("should save valid chargesGlParameters to database", (done) => {
      let testchargesGlParametersCollection = {
        // add a valid chargesGlParameters object
      };
      let res = chargesGlParameters.save(testchargesGlParametersCollection);
      expect(res)
        .to.eventually.include(testchargesGlParametersCollection)
        .notify(done);
    });

    it("should fail saving invalid object to database", (done) => {
      // not even a  object

      let invalidObject = {
        // add a invalid chargesGlParameters object

      };
      let res = chargesGlParameters.save(invalidObject);
      expect(res)
        .to.be.eventually.rejectedWith("chargesGlParametersCollection validation failed")
        .notify(done);
    });
  });

  describe("testing chargesGlParameters.findAll by limit",()=> {
    // 1. Delete all records in the table and insert
    //    4 new records.
    // find -should return an array of size equal to value of limit with the
    // roleMenuItemMaps.
    // Caveat - the order of the roleMenuItemMaps fetched is indeterminate

    // delete all records and insert four roleMenuItemMaps
      beforeEach((done)=> {
        chargesGlParameters.deleteAll().then(()=> {
          chargesGlParameters.save(object1).then((res)=> {
            chargesGlParameters.save(object2).then((res)=> {
              chargesGlParameters.save(object1).then((res)=> {
                chargesGlParameters.save(object2).then((res)=> {
                  done();
                });
              });
            });
          });
        });
      });

      it("should return limited number of records",(done)=> {
        let res = chargesGlParameters.findAll(3);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(3);
            expect(docs[0])
              .to.include(object1);
            done();
          }, (err) => {
            done(err);
          })
          .catch((e) => {
            done(e);
          });
      });

      it("should return all records if value of limit parameter is less than 1 i.e, 0 or -1",(done)=> {
        let res = chargesGlParameters.findAll(-1);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(4);
            expect(docs[0])
              .to.include(object1);
            done();
          }, (err) => {
            done(err);
          })
          .catch((e) => {
            done(e);
          });
      });
  });

  describe("testing roleMenuItemMap.find without data", () => {
    // delete all records
    // find should return empty array
    beforeEach((done) => {
      chargesGlParameters.deleteAll()
        .then((res) => {
          done();
        });
    });

    it("should return empty array i.e. []", (done) => {
      let res = chargesGlParameters.findAll(2);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(0);
          expect(docs)
            .to.eql([]);
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });
  });

  describe("testing chargesGlParameters.findById", () => {
    // Delete all records, insert one record , get its id
    // 1. Query by this id and it should return one chargesGlParameters
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    // 5. Query with arbitrary object
    let testObject = {
      //add a valid chargesGlParameters object

    };
    var id;
    beforeEach((done) => {
      chargesGlParameters.deleteAll()
        .then((res) => {
          chargesGlParameters.save(testObject)
            .then((savedObj) => {
              id = savedObj._id;
              done();
            });
        });
    });

    it("should return chargesGlParameters identified by Id ", (done) => {
      let res = chargesGlParameters.findById(id);
      expect(res)
        .to.eventually.include(testObject)
        .notify(done);
    });

    it("should return null as no chargesGlParameters is identified by this Id ", (done) => {
      let badId = new mongoose.mongo.ObjectId();
      let res = chargesGlParameters.findById(badId);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing chargesGlParameters.findOne", () => {
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return one chargesGlParameters
    // 2. Query by an arbitrary attribute value and it should return {}

    // delete all records and insert two chargesGlParameterss
    beforeEach((done) => {
      chargesGlParameters.deleteAll()
        .then((res) => {
          chargesGlParameters.save(object1)
            .then((res) => {
              chargesGlParameters.save(object2)
                .then((savedObj) => {
                  done();
                });
            });
        });
    });

    it("should return object for valid attribute value", (done) => {
      // take one valid attribute and its value
      let attributename="";
      let attributeValue="";
      let res = chargesGlParameters.findOne(attributename, attributeValue);
      expect(res)
        .to.eventually.include(object1)
        .notify(done);
    });

    it("should return null as no chargesGlParameters is identified by this attribute ", (done) => {
      let res = chargesGlParameters.findOne(validAttribute, invalidValue);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing chargesGlParameters.findMany", () => {
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return all chargesGlParameterss having attribute value
    // 2. Query by an arbitrary attribute value and it should return {}
    let chargesGlParameters1={
      //add valid object

    };
    let chargesGlParameters2={
      //add valid object with one attribute value same as "chargesGlParameters1"

    };
    // delete all records and insert two chargesGlParameterss
    beforeEach((done) => {
      chargesGlParameters.deleteAll()
        .then((res) => {
          chargesGlParameters.save(chargesGlParameters1)
            .then((res) => {
              chargesGlParameters.save(chargesGlParameters2)
                .then((savedObj) => {
                  done();
                });
            });
        });
    });

    it("should return array of objects for valid attribute value", (done) => {
      // take one valid attribute and its value
      let attributename="";
      let attributeValue="";
      let res = chargesGlParameters.findMany(attributename, attributeValue);
      expect(res).to.eventually.be.a("array");
      //enter proper length according to input attribute
      expect(res).to.eventually.have.length(1);
      done();
    });

    it("should return empty array as no chargesGlParameters is identified by this attribute ", (done) => {
      let res = chargesGlParameters.findMany(validAttribute, invalidValue);
      expect(res)
        .to.eventually.to.eql([])
        .notify(done);
    });
  });
});
