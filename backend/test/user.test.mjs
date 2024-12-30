import { should, expect, use } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import server from '../server.mjs'
import User from '../model/User.js';

use(chaiHttp);

before(async () => {
  try {
    await User.deleteMany({});
  } catch (err) {
    console.error(err);
    throw err;  // Re-throw the error to fail the test
  }
});

after(async () => {
  try {
    await User.deleteMany({});
  } catch (err) {
    console.error(err);
    throw err;  // Re-throw the error to fail the test
  }
});

// const req = request.execute(server);

describe('/First Test Collection', () => {
  
  it('test default API welcome route...', (done) => {
    request.execute(server).get('/test')
      .end((err, res) => {
        should().exist(res);  // Make sure res exists
        res.should.have.status(200);
        res.body.should.be.a('object');
        const actualVal = res.body.message;
        expect(actualVal).to.be.equal('Welcome to the WAVELENGTH-REST-API')
        done();
    });
  });

  it('verify that we can register a user', (done) => {
    let newUser = {
      user: "Robby",
      pwd: "Newyorkmets1!" 
    }

    request.execute(server).post('/register')
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });      

  it('should test two values....', () => {
    let expectedVal = 10;
    let actualVal = 10;
    expect(actualVal).to.be.equal(expectedVal);
  });
});