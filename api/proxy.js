import axios from 'axios';

export default async function handler(req, res) {
  // Handle CORS Pre-flight requests (for OPTIONS method)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');  // Allow GET and OPTIONS methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header
    res.status(200).end();
    return;
  }

  // Only allow GET requests for proxying
  if (req.method === 'GET') {
    // Construct the target URL for the external API request
    // Check if `req.query.path` is being passed correctly
    const targetUrl = `https://getcomics.info/${req.query.path ? req.query.path.join('/') : ''}`;

    console.log('Forwarding request to:', targetUrl);  // Log the target URL

    try {
      // Make the request to the external server
      const response = await axios.get(targetUrl);

      // Set CORS headers for the response
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin
      res.setHeader('Access-Control-Allow-Methods', 'GET');  // Allow only GET method
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header

      // Send the external API's response to the client
      res.status(200).json(response.data);
    } catch (error) {
      // If an error occurs, send a 500 status with a message
      console.error('Error fetching data from external API:', error);
      res.status(500).json({ message: 'Error fetching data from external API', error: error.message });
    }
  } else {
    // Handle any other methods (e.g., POST) if necessary
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
