const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 4000;

// Enable CORS for all origins (be careful with this in production)
app.use(cors());

// Define a route to proxy the request
app.get('/comics/*', async (req, res) => {
  // Create the target URL by removing the '/comics' prefix from the original URL
  const targetUrl = `https://getcomics.info${req.originalUrl.replace('/comics', '')}`;

  console.log('Forwarding request to:', targetUrl);  // Log the full URL being requested

  try {
    // Make the request to the external server (getcomics.info)
    const response = await axios.get(targetUrl);

    // Set the necessary CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin to access the data
    res.setHeader('Access-Control-Allow-Methods', 'GET');  // Allow only GET method
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow content-type header

    // Send the response from the external server back to the client
    res.json(response.data);  // Forward the data from the external API

  } catch (error) {
    console.error('Error fetching data from the external API:', error);

    // If something goes wrong, send a 500 error with detailed message
    res.status(500).send({
      message: 'Error fetching data from the external API',
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
