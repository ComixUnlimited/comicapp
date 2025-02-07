import axios from 'axios';

// This is the proxy handler for Vercel
export default async function handler(req, res) {
  // Only handle GET requests
  if (req.method === 'GET') {
    // Extract the path that will be appended to the target URL (after /api/comics)
    const targetUrl = `https://getcomics.info${req.url.replace('/api/comics', '')}`;
    
    console.log('Proxying request to:', targetUrl); // For debugging purposes

    try {
      // Make the request to the external getcomics.info API
      const response = await axios.get(targetUrl);

      // Set the CORS headers to allow access from any origin
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin
      res.setHeader('Access-Control-Allow-Methods', 'GET');  // Allow only GET
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type

      // Return the data from the external server back to the client
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching data from the external API:', error);

      // Return error if the external API fails
      res.status(500).json({
        message: 'Error fetching data from the external API',
        error: error.message,
      });
    }
  } else {
    // If the method is not GET, return a 404 Not Found
    res.status(404).json({ message: 'Route not found' });
  }
}
