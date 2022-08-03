/* eslint-disable no-undef */
const axios = require('axios');

describe('Making get request for Review ', () => {

  var getReq;

  beforeEach(function() {

    getReq = (id, sort) => (
      axios.get(`http://localhost:3000/reviews/?product_id=${id}&sort=${sort}`)
    );

  });


  // it('Should sucessfully retrieve data from the database', async() => {
  //   // check status code
  //   await getReq(40438, 'newest')
  //     .then(({data}) => {
  //       expect(data).toBeDefined();
  //       expect(data[0].review_id).toBeDefined();
  //       expect(data[0].rating).toBeDefined();
  //       expect(data[0].recommend).toBeDefined();
  //       expect(data[0].helpfulness).toBeDefined();
  //       expect(data[0].body).toBeDefined();
  //       expect(data[0].photos).toBeDefined();
  //       console.log(data[0].date)
  //     })
  //     .catch((err) => console.log(err));

  // });

  it('Should handle different sorting options', async() => {
    // check status code
    await getReq(40438, 'newest')
      .then(async({data}) => {
        await expect(data).toBeDefined();
      })
      .catch((err) => console.log(err));

  });


  it('Should sort according to the option', async() => {
    // check status code
    await getReq(40438, 'helpful')
      .then(async({data}) => {
        await expect(data[0].helpfulness).toBeGreaterThan(data[4].helpfulness);
      })
      .catch((err) => console.log(err));

  });
});

// it('Should sucessfully retrieve data from the database', () => {
// check status code
// getReq(43438)
//   .then((res) => {
//     expect(res.status).toBe(200);
//   });
// // check data
// getReq(43438)
//   .then((res) => {
//     console.log(res.body)
//     expect(data).toBeDefined();
//     expect(data[0].review_id).toBeDefined();
//     expect(data[0].rating).toBeDefined();
//     expect(data[0].recommend).toBeDefined();
//     expect(data[0].helpfulness).toBeDefined();
//     expect(data[0].body).toBeDefined();
//     expect(data[0].photos).toBeDefined();
//   });
// });