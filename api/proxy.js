import axios from 'axios';

export default async function handler(req, res) {
  // Handle CORS Pre-flight requests (for OPTIONS method)
  if (req.method === 'OPTIONS') {
    // Allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Only allow GET requests for proxying
  if (req.method === 'GET') {
    // Construct the URL for the external API request
    const targetUrl = `https://getcomics.org/${req.query.path.join('/')}`;

    try {
      // Make the request to the external server
      const response = await axios.get(targetUrl);

      // Set the necessary CORS headers for the response
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin to access the data
      res.setHeader('Access-Control-Allow-Methods', 'GET');  // Allow only GET method
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow content-type header

      // Send the external API's response to the client
      res.status(200).json(response.data);
    } catch (error) {
      // If there's an error, send a 500 status code
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Error fetching data from external API' });
    }
  } else {
    // Handle any other methods (e.g., POST) if necessary
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
