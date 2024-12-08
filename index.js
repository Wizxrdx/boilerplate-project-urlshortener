require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

shorturls = [];

// POST endpoint to create a short URL
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;
  console.log(req.body.url);

  // Extract hostname from the URL
  let hostname;
  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname;
    if (!/^https?:\/\//.test(url)) {
      // Check if URL starts with "http://" or "https://"
      throw new Error('Invalid URL');
    }
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  // Perform DNS lookup to validate hostname
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Add to shorturls
    const short_url = shorturls.length;
    shorturls[short_url] = url;

    // Send response
    res.json({
      original_url: url,
      short_url,
    });
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const short_url = parseInt(req.params.short_url, 10);

  // Check if short_url exists
  if (isNaN(short_url) || !shorturls[short_url]) {
    return res.json({ error: 'invalid url' });
  }

  // Redirect to the original URL
  res.redirect(shorturls[short_url]);
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
