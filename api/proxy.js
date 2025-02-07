// api/proxy.js
const axios = require('axios');
const cors = require('cors')({ origin: '*' });

module.exports = async (req, res) => {
  cors(req, res, async () => {
    const targetUrl = `https://getcomics.info${req.url.replace('/comics', '')}`;

    console.log('Forwarding request to:', targetUrl);  // Log the URL being requested

    try {
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });

      // Set CORS headers for the response
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Send the data from the external server back to the client
      res.json(response.data);
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
