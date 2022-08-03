/* eslint-disable no-undef */
const axios = require('axios');

describe('Using API to update helpfulness ', () => {

  var putReq, getReq;

  beforeEach( function() {

    getReq = (id) => (axios.get(`http://localhost:3000/reviews/${id}`));
    putReq = (id) => (axios.put(`http://localhost:3000/reviews/${id}/helpful`));

  });

  it('Should increment review for helpfulness',  () => {
    //get the review for comparision
    var num1;

    putReq(43438)
      .then(async({data}) => {
        num1 = data.helpfulness;
        await getReq(43438)
          .then(async({data}) => {
            console.log(`helpful?`, data.helpfulness);
            await expect(data.helpfulness).toBe(num1 + 1);
          });
      })
      .catch((err) => console.log(err));
  });


  // it('Should report the review', () => {



  // });


  // it('Should allow multiple puts from same sessions-id, but not on same review', () => {
  //   const review_id1 = 40438;
  //   const review_id2 = 43438;
  //   axios.get(`http://localhost:3000/reviews/${review_id1}`)
  //   .then(({data}) => {  });
  //   });
});