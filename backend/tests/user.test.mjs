import { should, expect, use } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import server from '../server.mjs'

use(chaiHttp);

describe('User Authentication Tests', () => {
  
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

  it('verify that we can register a user', (done) => {
    let newUser = {
      user: "Robby",
      pwd: "Newyorkmets1!" 
    }

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
  
  it('verify that we can log in the user we just registered', (done) => {
    // Add a small delay to ensure registration is complete
    setTimeout(() => {
      const user = {
        user: "Robby",
        pwd: "Newyorkmets1!" 
      }

      request.execute(server).post('/auth')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log('Login error:', err);
            return done(err);
          }
          console.log('Login response:', res.status, res.body);
          res.should.have.status(200);
          done();
        });
    }, 100);
  });      
  
  it('should test two values....', () => {
    let expectedVal = 10;
    let actualVal = 10;
    expect(actualVal).to.be.equal(expectedVal);
  });
});