import axios from 'axios';

export default async function handler(req, res) {
  console.log("Proxy request received:", req.query.path);  // Add this line

  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS Pre-flight requests (for OPTIONS method)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests for proxying
  if (req.method === 'GET') {
    const targetUrl = `https://getcomics.org/${req.query.path.join('/')}`;

    try {
      const response = await axios.get(targetUrl);

      // Send the external API's response to the client
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching data from external API:', error);
      res.status(500).json({ message: 'Error fetching data from external API', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
