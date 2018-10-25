const debug = require("debug")("evolvus-charges-scheme-type.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost/TestchargesSchemeTypeCollection";
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const chargesSchemeType = require("../index");
const db = require("../db/chargesSchemeType");

describe('chargesSchemeType model validation', () => {
  let chargesSchemeTypeObject = {
    // add a valid chargesSchemeType Object here

  };

  let invalidObject={
    //add invalid chargesSchemeType Object here

  };

  let undefinedObject; // object that is not defined
  let nullObject = null; // object that is null

  // before we start the tests, connect to the database
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
        debug("ok got the connection");
        done();
    });
  });

  describe("validation against jsonschema",()=> {
    it("valid chargesSchemeType should validate successfully", (done) => {
      try {
        var res = chargesSchemeType.validate(chargesSchemeTypeObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid chargesSchemeType object should not throw exception: ${e}`);
      }
    });

    it("invalid chargesSchemeType should return errors", (done) => {
      try {
        var res = chargesSchemeType.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if("should error out for undefined objects", (done) => {
      try {
        var res = chargesSchemeType.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if("should error out for null objects", (done) => {
      try {
        var res = chargesSchemeType.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("testing chargesSchemeType.save method",()=> {

    beforeEach((done)=> {
      db.deleteAll().then((res)=> {
        done();
      });
    });

    it('should save a valid chargesSchemeType object to database', (done) => {
      try {
        var result = chargesSchemeType.save(chargesSchemeTypeObject);
        //replace anyAttribute with one of the valid attribute of a chargesSchemeType Object
        expect(result)
          .to.eventually.have.property("anyAttribute")
          .to.eql(chargesSchemeTypeObject.anyAttribute)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving chargesSchemeType object should not throw exception: ${e}`);
      }
    });

    it('should not save a invalid chargesSchemeType object to database', (done) => {
      try {
        var result = chargesSchemeType.save(invalidObject);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing chargesSchemeType.getAll when there is data in database', () => {
    let object1={
      //add one valid chargesSchemeType object here

    },object2={
      //add one more valid chargesSchemeType object here

    };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            db.save(object1).then((res)=> {
              done();
            });
          });
        });
      });
    });

    it('should return limited records as specified by the limit parameter', (done) => {
      try {
        let res = chargesSchemeType.getAll(2);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(2);
            done();
          });
      } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return all records if limit is -1', (done) => {
      try {
        let res = chargesSchemeType.getAll(-1);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(3);
            done();
          });
      } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for null value of limit', (done) => {
      try {
        let res = chargesSchemeType.getAll(null);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for undefined value of limit', (done) => {
      try {
        let undefinedLimit;
        let res = chargesSchemeType.getAll(undefinedLimit);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing chargesSchemeType.getAll when there is no data', () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should return empty array when limit is -1', (done) => {
      try {
        let res = chargesSchemeType.getAll(-1);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(0);
            expect(docs)
              .to.eql([]);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty array when limit is positive value ', (done) => {
      try {
        let res = chargesSchemeType.getAll(2);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(0);
            expect(docs)
              .to.eql([]);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });

  describe('testing getById', () => {
    // Insert one record , get its id
    // 1. Query by this id and it should return one chargesSchemeType object
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    var id;
    beforeEach((done) => {
      db.save(chargesSchemeTypeObject).then((res) => {
        id = res._id;
        done();
      });
    });

    it('should return one chargesSchemeType matching parameter id', (done) => {
      try {
        var res = chargesSchemeType.getById(id);
        expect(res).to.eventually.have.property('_id')
          .to.eql(id)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no chargesSchemeType is identified by this Id ', (done) => {
      try {
        let badId = new mongoose.mongo.ObjectId();
        var res = chargesSchemeType.getById(badId);
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      try {
        let undefinedId;
        let res = chargesSchemeType.getById(undefinedId);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      try {
        let res = chargesSchemeType.getById(null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should be rejected for arbitrary object as Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value
      let id = chargesSchemeTypeObject;
      let res = chargesSchemeType.getById(id);
      expect(res)
        .to.eventually.to.be.rejectedWith("must be a single String of 12 bytes")
        .notify(done);
    });

  });

  describe("testing chargesSchemeType.getOne",()=> {
    let object1={
      //add one valid chargesSchemeType object here

    },object2={
      //add one more valid chargesSchemeType object here

    };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
              done();
          });
        });
      });
    });

    it("should return one chargesSchemeType record identified by attribute",(done)=> {
      try {
        // take one attribute from object1 or object2 and its value
        let res = chargesSchemeType.getOne(attribute of object1/object2,its value);
        expect(res)
          .to.eventually.be.a("object")
          .to.have.property('attribute of object1/object2')
          .to.eql('attribute value')
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no chargesSchemeType is identified by this attribute', (done) => {
      try {
        // replace validAttribute and add a bad value to it
        var res = chargesSchemeType.getOne(validAttribute,badValue);
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
      try {
        //replace validvalue with a valid value for an attribute
        let undefinedAttribute;
        let res = chargesSchemeType.getOne(undefinedAttribute,validValue);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
      try {
        // replace validAttribute with a valid attribute name
        let undefinedValue;
        let res = chargesSchemeType.getOne(validAttribute,undefinedValue);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null attribute parameter ", (done) => {
      try {
        //replace validValue with a valid value for an attribute
        let res = chargesSchemeType.getOne(null,validValue);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null value parameter ", (done) => {
      try {
        //replace attributeValue with a valid attribute name
        let res = chargesSchemeType.getOne(attributeValue,null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });


  describe("testing chargesSchemeType.getMany",()=> {
      let object1={
        //add one valid chargesSchemeType object here

      },object2={
        //add one more valid chargesSchemeType object here

      };
      beforeEach((done) => {
        db.deleteAll().then((res) => {
          db.save(object1).then((res) => {
            db.save(object2).then((res) => {
                done();
            });
          });
        });
      });

      it("should return array of chargesSchemeType records identified by attribute",(done)=> {
        try {
          // take one attribute from object1 or object2 and its value
          let res = chargesSchemeType.getMany(attribute of object1/object2,its value);
          expect(res).to.eventually.be.a("array");
          //enter proper length according to input value
          expect(res).to.eventually.have.length(1);
          done();
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it('should return empty array i.e. [] as no chargesSchemeType is identified by this attribute', (done) => {
        try {
          // replace validAttribute and add a bad value to it
          var res = chargesSchemeType.getMany(validAttribute,badValue);
          expect(res).to.eventually.to.eql([])
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
        try {
          //replace validvalue with a valid value for an attribute
          let undefinedAttribute;
          let res = chargesSchemeType.getMany(undefinedAttribute,validValue);
          expect(res)
            .to.eventually.to.be.rejectedWith("IllegalArgumentException")
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
        try {
          // replace validAttribute with a valid attribute name
          let undefinedValue;
          let res = chargesSchemeType.getMany(validAttribute,undefinedValue);
          expect(res)
            .to.eventually.to.be.rejectedWith("IllegalArgumentException")
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it("should throw IllegalArgumentException for null attribute parameter ", (done) => {
        try {
          //replace validValue with a valid value for an attribute
          let res = chargesSchemeType.getMany(null,validValue);
          expect(res)
            .to.eventually.to.be.rejectedWith("IllegalArgumentException")
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it("should throw IllegalArgumentException for null value parameter ", (done) => {
        try {
          //replace attributeValue with a valid attribute name
          let res = chargesSchemeType.getMany(attributeValue,null);
          expect(res)
            .to.eventually.to.be.rejectedWith("IllegalArgumentException")
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });
    });
});
