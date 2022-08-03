require('dotenv').config();
const { Pool } = require('pg');
const _ = require('underscore');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOSTNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432
});

module.exports.db = {

  getReviewList: (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const count = parseInt(req.query.count) || 5;
    const sortOpt = req.query.sort;
    const prod_id = parseInt(req.query.product_id);

    console.log(req.query);

    var sort;
    switch (sortOpt) {
      case('relevant'):
        sort = 'r.date ASC, helpfulness ASC';
        break;
      case('newest'):
        sort = 'r.date ASC';
        break;
      case('helpful'):
        sort = 'helpfulness DESC';
        break;
    }

    if(!sort) {
      res.status(404).send('No sorting parameter specified');
    } else {

      pool.query(
        `WITH photos as
        ( SELECT review_id, json_agg(json_build_object('id', rp.id, 'url', url)) as photos
          FROM reviews_photos rp JOIN reviews r ON r.id = rp.review_id
          WHERE product_id = ${prod_id}
          GROUP by review_id
        ), revs AS
        ( SELECT r.id as review_id, rating, summary, recommend, response, body,
          date, reviewer_name, helpfulness
          FROM reviews r WHERE (r.product_id = ${prod_id} AND reported = false)
          ORDER BY ${sort}
          LIMIT ${count}
          OFFSET ${count * (page - 1)}
        ) SELECT * from revs LEFT JOIN photos USING
        (review_id)`
      )
        .then(({rows}) => {
          rows.map((row) => row.date = new Date(row.date * 1))
          res.status(200).json(rows);
        })
        .catch(err => res.status(500).send(err));
    }
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
        ) as Ratings
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
        ) as Characteristics
      ), rec as
      ( SELECT json_build_object(
        0, (SELECT count(recommend) from reviews where recommend = 'false' and product_id = ${prod_id} ),
        1, (SELECT count(recommend) from reviews where recommend = 'true' and product_id = ${prod_id} )
        ) as Recommend
      ) SELECT * from
        stripped,
        rec,
        cha`
    )
      .then(({rows}) => {
        rows = rows[0];
        rows.product_id = prod_id;
        res.status(200).json(rows)
      })
      .catch(err => res.status(500).send(err));
  },

  addReview: (req, res) => {

    const {product_id, rating, summary, body, recommend, name, email, photos, characteristics} = req.body;

    pool.query(
      `INSERT INTO reviews
                   (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email)
       VALUES ($1, $2, trunc(extract(epoch from now())*1000), $3, $4 , $5, FALSE, $6, $7)
      RETURNING id;`, [product_id, rating, summary, body, recommend, name, email]
    )
      .then(({rows}) => {
        const id = rows[0].id;

        if (photos) {
          _.each(photos, (elem) => {
            pool.query(
              `INSERT INTO reviews_photos (review_id, url)
              VALUES (${id}, ${elem})`
            )
              .catch((err) => console.log(`PHOTOS ERROR: ${err}`));
          });
        }
        _.each(characteristics, ((val, key) =>
          pool.query(
            `INSERT INTO characteristic_reviews (characteristic_id, review_id, value)
            VALUES (${key}, ${id}, ${val})`
          )
            .catch((err) => console.log(`CHARACTERISTIC ERROR: ${err}`))
        ));

        res.status(201).json('Posted!');
      })
      .catch((err) => (console.log(`POST REVIEW: ${err}`)));

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
      .then(({num}) => res.status(204).json(num))
      .catch(err => res.status(500).send(err));
  },


  reportReview: (req, res) => {

    const rev_id = parseInt(req.params.review_id);
    console.log(rev_id);

    pool.query(
      `UPDATE reviews r
      SET reported = true
      WHERE id = ${rev_id}
      RETURNING helpfulness;`
    )
      .then(({num}) => res.status(204).json(num))
      .catch(err => res.status(500).send(err));
  }

};
