import axios from 'axios';

export default async function handler(req, res) {
  // Define the route for proxying comics requests
  if (req.method === 'GET' && req.url.startsWith('/comics/')) {
    // Create the target URL by removing the '/comics' prefix from the original URL
    const targetUrl = `https://getcomics.info${req.url.replace('/comics', '')}`;
    console.log('Forwarding request to:', targetUrl);  // Log the full URL being requested

    try {
      // Make the request to the external server (getcomics.info)
      const response = await axios.get(targetUrl);

      // Set CORS headers (optional but needed for frontend apps to access the API)
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin to access the data
      res.setHeader('Access-Control-Allow-Methods', 'GET');  // Allow only GET method
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow content-type header

      // Send the response from the external server back to the client
      res.status(200).json(response.data);  // Forward the data from the external API
    } catch (error) {
      console.error('Error fetching data from the external API:', error);

      // If something goes wrong, send a 500 error with a detailed message
      res.status(500).send({
        message: 'Error fetching data from the external API',
        error: error.message,
      });
    }
  } else {
    // Handle unsupported methods or routes
    res.status(404).send({ message: 'Not Found' });
  }
}
