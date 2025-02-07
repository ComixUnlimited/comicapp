// api/proxy.js

const axios = require('axios');
const cors = require('cors')({ origin: '*' });  // Enable CORS for all origins

module.exports = async (req, res) => {
  cors(req, res, async () => { // Enable CORS for each request

    // Create the target URL by removing the '/comics' prefix from the original URL
    const targetUrl = `https://getcomics.info${req.url.replace('/comics', '')}`;

    console.log('Forwarding request to:', targetUrl);  // Log the full URL being requested

    try {
      // Make the request to the external server (getcomics.info)
      const response = await axios.get(targetUrl, {
        headers: {
          // Add a User-Agent header to mimic a browser (helps to avoid blocking by some APIs)
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });

      // Set the necessary CORS headers for the response
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin to access the data
      res.setHeader('Access-Control-Allow-Methods', 'GET');  // Allow only GET method
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow content-type header

      // Send the response from the external server back to the client
      res.json(response.data);  // Forward the data from the external API

    } catch (error) {
      console.error('Error fetching data from the external API:', error.response ? error.response.data : error.message);

      // If something goes wrong, send a 500 error with a detailed message
      res.status(500).send({
        message: 'Error fetching data from the external API',
        error: error.response ? error.response.data : error.message,
      });
    }
  });
};
