import axios from 'axios';

export default async function handler(req, res) {
  // Construct the URL for the external API request
  const targetUrl = `https://getcomics.org/${req.query.path.join('/')}`;

  try {
    // Make the request to the external server
    const response = await axios.get(targetUrl);

    // Set the CORS headers for the response
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
}
