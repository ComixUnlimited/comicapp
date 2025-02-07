import axios from 'axios';

export default async function handler(req, res) {
  // Log incoming request for debugging
  console.log('Received request:', req.method, req.url);

  // Define the route for proxying comics requests
  if (req.method === 'GET') {
    // Create the target URL by removing '/api/comics' from the original request URL
    const targetUrl = `https://getcomics.info${req.url.replace('/api/comics', '')}`;

    // Log the target URL to see where it's forwarding the request
    console.log('Forwarding request to:', targetUrl);  // Log the full URL being requested

    try {
      // Make the request to the external server (getcomics.info)
      const response = await axios.get(targetUrl);

      // Log the response data for debugging (ensure it doesn't print too much data)
      console.log('Received data from target:', response.status, response.data ? 'Data received' : 'No data');

      // Set the CORS headers to allow any origin and all HTTP methods
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin to access the data
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');  // Allow all HTTP methods
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');  // Allow common headers

      // Handle preflight (OPTIONS) requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // Send the response from the external server back to the client
      res.status(200).json(response.data);  // Forward the data from the external API
    } catch (error) {
      console.error('Error fetching data from the external API:', error);

      // Log error for debugging
      console.log('Error details:', error.message);

      // If something goes wrong, send a 500 error with a detailed message
      res.status(500).json({
        message: 'Error fetching data from the external API',
        error: error.message,
      });
    }
  } else {
    // Handle unsupported methods or routes
    console.log('Method not supported:', req.method);
    res.status(404).json({ message: 'Route not found' });
  }
}
