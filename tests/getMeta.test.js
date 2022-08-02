//UNIT TESTS FOR GET REQUEST TO API
// const axios = require('axios');


describe('Making get request for product Meta Data ', () => {

  beforeEach( function() {

    const createReq = (id) => (
      axios.get(`http://localhost:3000/reviews/meta?product_id=${id}`)
    );

  });


  it('Should sucessfully retrieve data from the database', () => {
    //check status code
    createReq(40438)
    .then((res) => {
      expect(res.status).toBe(200);
    });
    //check data
    createReq(780)
    .then((res) => {
      expect(res.data).toBeDefined();
    });
  });


  it('The information should be for the product specified in the request', () => {
    //get the review for comparision
    createReq(40438)
    .then((res) => {
      expect(res.data.id).toBe(40438);
    });
    createReq(780)
    .then((res) => {
      expect(res.data.id).toBe(780);
    });
  });

});