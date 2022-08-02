require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db.js').db;

app.use(express.json());
app.use(cors());



app.get('/reviews', db.getReviewList);

app.get('/reviews/meta', db.getProductMetadata);

app.post('/reviews', db.addReview);

app.put('/reviews/:review_id/helpful', db.markReviewHelpful);

app.put('/reviews/:review_id/report', db.reportReview);


const PORT = process.env.PORT || 3000;

app.listen(PORT);

console.log(`Server listening at http://localhost:${PORT}`);
