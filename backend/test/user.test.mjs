import { should, expect, use } from 'chai';
import { default as chaiHttp, request } from 'chai-http';
import server from '../server.mjs'

use(chaiHttp);

const req = request.execute(server);


describe('/First Test Collection', () => {
  
  it('test default API welcome route...', (done) => {
    req.get('/test')
      .end((err, res) => {
        should().exist(res);  // Make sure res exists
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