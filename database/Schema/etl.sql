COPY product(id,name,slogan,description,category,default_price)
FROM '/home/marzmu/hackreactor/sdc/rateNReviewAPI/database/product.csv' DELIMITER ',' CSV HEADER;

COPY reviews(id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness)
FROM '/home/marzmu/hackreactor/sdc/rateNReviewAPI/database/reviews.csv' DELIMITER ',' CSV HEADER;

COPY reviews_photos(id,review_id,url)
FROM '/home/marzmu/hackreactor/sdc/rateNReviewAPI/database/reviews_photos.csv' DELIMITER ',' CSV HEADER;

COPY characteristic_reviews(id,characteristic_id,review_id,value)
FROM '/home/marzmu/hackreactor/sdc/rateNReviewAPI/database/characteristic_reviews.csv' DELIMITER
 ',' CSV HEADER;

COPY characteristics(id,product_id,name)
FROM '/home/marzmu/hackreactor/sdc/rateNReviewAPI/database/characteristics.csv' DELIMITER ',' CSV HEADER;

