// const axios = require('axios');
// // const {expect} = require('')

// describe('Using API to update helpfulness ', () => {

//   beforeEach( function() => {
//     const getReq = (id) => (axios.get(`http://localhost:3000/reviews/${id}`));
//     const putReq = (id) => (axios.put(`http://localhost:3000/reviews/${id}`));
//   });

//   it('Should increment review for helpfulness', () => {
//     //get the review for comparision
//     var num1;

//     putReq(644155)
//       .then(({num}) => {num1 = num});
//     //update the value
//     putReq(644155)
//       .then(({num}) => {
//         expect(num).toBe(num1 + 1);
//       });
//     //get again to verify

//   });


//   it('Should increment review for helpfulness', () => {

//     //post review

//     //send put request
//       //check return value for correct num

//   });


//   // it('Should allow multiple puts from same sessions-id, but not on same review', () => {
//   //   const review_id1 = 40438;
//   //   const review_id2 = 43438;
//   //   axios.get(`http://localhost:3000/reviews/${review_id1}`)
//   //   .then(({data}) => {  });
//   //   });
// });