require('dotenv').config();
const { Pool } = require('pg');
const _ = require('underscore');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOSTNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

module.exports.db = {

  getReviewList: (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const count = parseInt(req.query.count) || 5;
    const sortOpt = req.query.sort;
    const prod_id = parseInt(req.query.product_id);

    console.log(req.query);

    switch (sortOpt) {
      case('relevant'):
        var sort = 'r.date ASC, helpfulness ASC';
        break;
      case('newest'):
        var sort = 'r.date ASC';
        break;
      case('helpful'):
        var sort = 'helpfulness ASC';
        break;
    }
    console.log(sort);

    pool.query(
      `WITH photos as
      ( SELECT review_id, json_agg(json_build_object('id', rp.id, 'url', url))
        FROM reviews_photos rp JOIN reviews r ON r.id = rp.review_id
        WHERE product_id = ${prod_id}
        GROUP by review_id
      ), revs AS
      ( SELECT r.id, rating, summary, recommend, response, body,
        date, reviewer_name, helpfulness
        FROM reviews r WHERE (r.product_id = ${prod_id} AND reported = false)
        ORDER BY ${sort}
        LIMIT ${count}
        OFFSET ${count * (page - 1)}
      ) SELECT * from revs LEFT JOIN photos ON
       (photos.review_id = revs.id)`
    )
      .then(({rows}) => res.status(200).json(rows))
      .catch(error => res.status(500).send(error));
  },

  //param: product_id
  getProductMetadata: (req, res) => {
    const prod_id = parseInt(req.query.product_id);

    pool.query(
      `WITH chars AS
      ( SELECT c.id, c.name, avg(value) as average
        FROM characteristics c JOIN characteristic_reviews cr
        ON c.id = cr.characteristic_id
        WHERE product_id = ${prod_id} GROUP BY product_id, c.name, c.id
      ), rats as
      ( SELECT rating, count(rating) FROM reviews
        WHERE product_id = ${prod_id} group by rating
        ORDER BY rating asc
      ), stripped as
      ( SELECT json_build_object(
          1, (SELECT (count) from rats where rating = 1),
          2, (SELECT (count) from rats where rating = 2),
          3, (SELECT (count) from rats where rating = 3),
          4, (SELECT (count) from rats where rating = 4),
          5, (SELECT (count) from rats where rating = 5)
        )
      ), cha as
      ( SELECT json_build_object(
          'Comfort',  json_build_object(
            'id', (SELECT id from chars where name = 'Comfort'),
            'value', (SELECT average from chars where name = 'Comfort')
          ),
          'Fit',  json_build_object(
            'id', (SELECT id from chars where name = 'Fit'),
            'value', (SELECT average from chars where name = 'Fit')
          ),
          'Length',  json_build_object(
            'id', (SELECT id from chars where name = 'Length'),
            'value', (SELECT average from chars where name = 'Length')
          ),
          'Quality',  json_build_object(
            'id', (SELECT id from chars where name = 'Quality'),
            'value', (SELECT average from chars where name = 'Quality')
          )
        )
      ), rec as
      ( SELECT json_build_object(
        0, (SELECT count(recommend) from reviews where recommend = 'false' and product_id = ${prod_id} ),
        1, (SELECT count(recommend) from reviews where recommend = 'true' and product_id = ${prod_id} )
        )
      ) SELECT json_build_object(
        'Ratings', (select * from stripped),
        'Recommend', (select * from rec),
        'Characteristics', (select * from cha)
      )`
    )
    .then(({rows}) => res.status(200).json(rows))
    .catch(error => res.status(500).send('Internal Server Error'));
  },

  addReview: (req, res) => {
    const {product_id, rating, summary, body, recommend, name, email, photos, characteristics} = req.query;

    pool.query(
      `INSERT INTO reviews
       (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email)
       VALUES
       (${product_id}, ${rating}, trunc(extract(epoch from now())*1000),
       ${summary}, ${body}, ${recommend}, FALSE, ${name}, ${email})
      RETURNING id;`
    )
      .then(({id}) =>
        _.each(characteristics, ((val, key, list) =>
        pool.query(
          `INSERT INTO characteristic_reviews (characteristic_id, review_id, value)
          VALUES (${key}, ${id}, ${val})`
        )
      ))
      )
  },



  // ( /reviews/:review_id/helpful )
  markReviewHelpful: (req, res) => {
    const rev_id = parseInt(req.params.review_id);

    pool.query(
      `UPDATE reviews r
      SET helpfulness = helpfulness + 1
      WHERE id = ${rev_id}
      RETURNING helpfulness;`
    )
      .then(({num}) => res.status(200).json(num))
      .catch(error => res.status(500).send(error));
  },


  reportReview: (req, res) => {
    const rev_id = parseInt(req.query.review_id);

    pool.query(
      `UPDATE reviews r
      SET helpfulness = helpfulness + 1
      WHERE id = ${rev_id}
      RETURNING helpfulness;`
    )
      .then(({num}) => res.status(200).json(num))
      .catch(error => res.status(500).send('Internal Server Error'));
  }

}
