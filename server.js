require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jobRoutes = require('./routes/jobs');
require('./scheduler');

mongoose.connect(process.env.MONGO_URI);
const app = express();

app.use('/api/jobs', jobRoutes);
app.listen(3000, () => console.log('Server running on port 3000'));
