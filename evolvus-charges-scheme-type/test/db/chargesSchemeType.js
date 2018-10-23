const debug = require("debug")("evolvus-charges-scheme-type.test.db.chargesSchemeType");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const chargesSchemeType = require("../../db/chargesSchemeType");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost/TestchargesSchemeTypeCollection";

chai.use(chaiAsPromised);

// High level wrapper
// Testing db/chargesSchemeType.js
describe("db chargesSchemeType testing", () => {
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
    // add a valid chargesSchemeType object

  };
  let object2 = {
  // add a valid chargesSchemeType object

  };

  describe("testing chargesSchemeType.save", () => {
    // Testing save
    // 1. Valid chargesSchemeType should be saved.
    // 2. Non chargesSchemeType object should not be saved.
    // 3. Should not save same chargesSchemeType twice.
    beforeEach((done) => {
      chargesSchemeType.deleteAll()
        .then((data) => {
          done();
        });
    });

    it("should save valid chargesSchemeType to database", (done) => {
      let testchargesSchemeTypeCollection = {
        // add a valid chargesSchemeType object
      };
      let res = chargesSchemeType.save(testchargesSchemeTypeCollection);
      expect(res)
        .to.eventually.include(testchargesSchemeTypeCollection)
        .notify(done);
    });

    it("should fail saving invalid object to database", (done) => {
      // not even a  object

      let invalidObject = {
        // add a invalid chargesSchemeType object

      };
      let res = chargesSchemeType.save(invalidObject);
      expect(res)
        .to.be.eventually.rejectedWith("chargesSchemeTypeCollection validation failed")
        .notify(done);
    });
  });

  describe("testing chargesSchemeType.findAll by limit",()=> {
    // 1. Delete all records in the table and insert
    //    4 new records.
    // find -should return an array of size equal to value of limit with the
    // roleMenuItemMaps.
    // Caveat - the order of the roleMenuItemMaps fetched is indeterminate

    // delete all records and insert four roleMenuItemMaps
      beforeEach((done)=> {
        chargesSchemeType.deleteAll().then(()=> {
          chargesSchemeType.save(object1).then((res)=> {
            chargesSchemeType.save(object2).then((res)=> {
              chargesSchemeType.save(object1).then((res)=> {
                chargesSchemeType.save(object2).then((res)=> {
                  done();
                });
              });
            });
          });
        });
      });

      it("should return limited number of records",(done)=> {
        let res = chargesSchemeType.findAll(3);
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
        let res = chargesSchemeType.findAll(-1);
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
      chargesSchemeType.deleteAll()
        .then((res) => {
          done();
        });
    });

    it("should return empty array i.e. []", (done) => {
      let res = chargesSchemeType.findAll(2);
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

  describe("testing chargesSchemeType.findById", () => {
    // Delete all records, insert one record , get its id
    // 1. Query by this id and it should return one chargesSchemeType
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    // 5. Query with arbitrary object
    let testObject = {
      //add a valid chargesSchemeType object

    };
    var id;
    beforeEach((done) => {
      chargesSchemeType.deleteAll()
        .then((res) => {
          chargesSchemeType.save(testObject)
            .then((savedObj) => {
              id = savedObj._id;
              done();
            });
        });
    });

    it("should return chargesSchemeType identified by Id ", (done) => {
      let res = chargesSchemeType.findById(id);
      expect(res)
        .to.eventually.include(testObject)
        .notify(done);
    });

    it("should return null as no chargesSchemeType is identified by this Id ", (done) => {
      let badId = new mongoose.mongo.ObjectId();
      let res = chargesSchemeType.findById(badId);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing chargesSchemeType.findOne", () => {
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return one chargesSchemeType
    // 2. Query by an arbitrary attribute value and it should return {}

    // delete all records and insert two chargesSchemeTypes
    beforeEach((done) => {
      chargesSchemeType.deleteAll()
        .then((res) => {
          chargesSchemeType.save(object1)
            .then((res) => {
              chargesSchemeType.save(object2)
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
      let res = chargesSchemeType.findOne(attributename, attributeValue);
      expect(res)
        .to.eventually.include(object1)
        .notify(done);
    });

    it("should return null as no chargesSchemeType is identified by this attribute ", (done) => {
      let res = chargesSchemeType.findOne(validAttribute, invalidValue);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing chargesSchemeType.findMany", () => {
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return all chargesSchemeTypes having attribute value
    // 2. Query by an arbitrary attribute value and it should return {}
    let chargesSchemeType1={
      //add valid object

    };
    let chargesSchemeType2={
      //add valid object with one attribute value same as "chargesSchemeType1"

    };
    // delete all records and insert two chargesSchemeTypes
    beforeEach((done) => {
      chargesSchemeType.deleteAll()
        .then((res) => {
          chargesSchemeType.save(chargesSchemeType1)
            .then((res) => {
              chargesSchemeType.save(chargesSchemeType2)
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
      let res = chargesSchemeType.findMany(attributename, attributeValue);
      expect(res).to.eventually.be.a("array");
      //enter proper length according to input attribute
      expect(res).to.eventually.have.length(1);
      done();
    });

    it("should return empty array as no chargesSchemeType is identified by this attribute ", (done) => {
      let res = chargesSchemeType.findMany(validAttribute, invalidValue);
      expect(res)
        .to.eventually.to.eql([])
        .notify(done);
    });
  });
});
