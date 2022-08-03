/* eslint-disable no-undef */
const axios = require('axios');

describe('Making get request for product Meta Data ', () => {

  var createReq;

  beforeEach(function() {

    createReq = (id) => (
      axios.get(`http://localhost:3000/reviews/meta?product_id=${id}`)
    );

  });


  it('Should sucessfully retrieve data from the database', async () => {
    // check status code
    await createReq(40438)
      .then(async (res) => {
        await expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      });

  });


  it('The information should be for the product specified in the request', async () => {
    // get the review for comparision
    await createReq(43438)
      .then(async ({data}) => {
        await expect(data.product_id).toBe(43438);
      })

  });

});