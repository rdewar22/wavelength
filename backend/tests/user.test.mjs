import { should, expect, use } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import mongoose from 'mongoose';
import server from '../server.mjs'

use(chaiHttp);

describe('User Authentication Tests', () => {
  let createdUser = null;
  
  before(() => {
    console.log('=== Starting User Authentication Tests ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URI available:', !!process.env.TEST_DATABASE_URI || !!process.env.DATABASE_URI);
  });

  // Make sure your test waits for MongoDB to be ready
  beforeEach(async function() {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once('open', resolve);
        }
      });
    }
    
    // Ping to ensure connection is working
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    }
    console.log('MongoDB connection ready');
  });
  
  it('test default API welcome route...', (done) => {
    console.log('Testing welcome route...');
    
    request.execute(server).get('/test')
      .end((err, res) => {
        if (err) {
          console.error('Welcome route error:', err);
          return done(err);
        }
        
        console.log('Welcome route response:', {
          status: res.status,
          body: res.body
        });
        
        should().exist(res);
        res.should.have.status(200);
        res.body.should.be.a('object');
        const actualVal = res.body.message;
        expect(actualVal).to.be.equal('Welcome to the WAVELENGTH-REST-API')
        
        console.log('✓ Welcome route test passed');
        done();
    });
  });

  it('verify that we can register a user', function(done) {
    const timestamp = Date.now();
    let newUser = {
      user: "TestUser" + timestamp,
      pwd: "Newyorkmets1!" 
    }
    
    console.log('Attempting to register user:', newUser.user);
    createdUser = newUser;

    request.execute(server).post('/register')
      .send(newUser)
      .timeout(15000)
      .end((err, res) => {
        if (err) {
          console.error('Registration failed:', {
            error: err.message,
            code: err.code,
            status: err.status,
            response: err.response ? err.response.text : 'No response'
          });
          return done(err);
        }
        
        console.log('Registration successful:', {
          status: res.status,
          body: res.body,
          headers: res.headers
        });
        
        res.should.have.status(201);
        console.log('✓ User registration test passed');
        done();
      });
  });      
  
  it('verify that we can log in the user we just registered', function(done) {
    if (!createdUser) {
      console.error('No user was created in previous test');
      return done(new Error('No user was created in previous test'));
    }

    this.timeout(5000);

    console.log('Attempting to login user:', createdUser.user);
    
    request.execute(server).post('/auth')
      .send(createdUser)
      .timeout(15000)
      .end((err, res) => {
        if (err) {
          console.error('Login failed:', {
            error: err.message,
            code: err.code,
            status: err.status,
            response: err.response ? err.response.text : 'No response',
            user: createdUser.user
          });
          return done(err);
        }
        
        console.log('Login successful:', {
          status: res.status,
          body: res.body,
          headers: res.headers
        });
        
        res.should.have.status(200);
        console.log('✓ User login test passed');
        done();
      });
  });      
  
  it('should test two values....', () => {
    console.log('Testing basic assertion...');
    let expectedVal = 10;
    let actualVal = 10;
    expect(actualVal).to.be.equal(expectedVal);
    console.log('✓ Basic assertion test passed');
  });
  
  after(() => {
    console.log('=== User Authentication Tests Complete ===');
  });
});