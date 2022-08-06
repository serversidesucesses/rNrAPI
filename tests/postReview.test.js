/* eslint-disable no-undef */
const axios = require('axios');

describe('Posting a review to the API ', () => {
  const body = {
    product_id: 43848,
    rating: 5,
    summary: `Thatll do pig, thatll do!`,
    body: 'This is how i am going to test this route and see if it works!',
    recommend: 'true',
    name: 'Echasketch',
    email: 'eSketch@aol.com',
    characteristics: {
      '2991': 2,
      '2992': 3,
      '2993': 4,
      '2994': 3
    }
  };

  it('Should sucessfully post a review to the database', async() => {

    await axios.post(`http://localhost:3000/reviews`, body)
      .then(async(res) => {
        await expect(res.status).toBe(201);
      })
      .catch((err) => {
        console.log(body);
        console.error(err);
      });


  });

});