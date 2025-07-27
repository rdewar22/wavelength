import { should, expect, use } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import server from '../server.mjs'

use(chaiHttp);

describe('User Authentication Tests', () => {
  let createdUser = null;
  
  it('test default API welcome route...', (done) => {
    request.execute(server).get('/test')
      .end((err, res) => {
        if (err) return done(err);
        should().exist(res);  // Make sure res exists
        res.should.have.status(200);
        res.body.should.be.a('object');
        const actualVal = res.body.message;
        expect(actualVal).to.be.equal('Welcome to the WAVELENGTH-REST-API')
        done();
    });
  });

  it('verify that we can register a user', function(done) {
    
    let newUser = {
      user: "TestUser" + Date.now(), // Make username unique
      pwd: "Newyorkmets1!" 
    }
    
    createdUser = newUser; // Store for use in login test

    request.execute(server).post('/register')
      .send(newUser)
      .end((err, res) => {
        if (err) {
          console.log('Registration error:', err);
          return done(err);
        }
        console.log('Registration response:', res.status, res.body);
        res.should.have.status(201);
        done();
      });
  });      
  
  it('verify that we can log in the user we just registered', function(done) {
    this.timeout(20000); // Increase timeout for this test
    
    if (!createdUser) {
      return done(new Error('No user was created in previous test'));
    }

    request.execute(server).post('/auth')
      .send(createdUser)
      .end((err, res) => {
        if (err) {
          console.log('Login error:', err);
          return done(err);
        }
        console.log('Login response:', res.status, res.body);
        res.should.have.status(200);
        done();
      });
  });      
  
  it('should test two values....', () => {
    let expectedVal = 10;
    let actualVal = 10;
    expect(actualVal).to.be.equal(expectedVal);
  });
});