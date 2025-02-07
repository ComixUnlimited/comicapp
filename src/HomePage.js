import React, { useState, useEffect } from 'react';
import { getMarvelComics } from './marvelcomics'; 
import { getDCComics } from './dccomics';
import { Link } from 'react-router-dom';  // Import the Link component for navigation
import logo from './logo.jpg';  // Assuming you have a logo image

const HomePage = () => {
  const [marvelComics, setMarvelComics] = useState([]);
  const [dcComics, setDcComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComics = async () => {
    setLoading(true);
    setError('');  // Reset error state

    try {
      console.log("Fetching Marvel comics...");
      const marvelResults = await getMarvelComics(1);  // Fetch Marvel comics
      console.log("Marvel comics fetched:", marvelResults);  // Log the Marvel comics response

      console.log("Fetching DC comics...");
      const dcResults = await getDCComics(1);  // Fetch DC comics
      console.log("DC comics fetched:", dcResults);  // Log the DC comics response

      setMarvelComics(marvelResults);  // Set Marvel comics state
      setDcComics(dcResults);  // Set DC comics state

    } catch (err) {
      console.error('Error fetching comics:', err);
      setError('Failed to load comics. Please try again later.');
    } finally {
      setLoading(false);  // Stop loading after data fetch
    }
  };

  useEffect(() => {
    fetchComics();  // Fetch comics once component is mounted
  }, []);  // Empty dependency array ensures this only runs once after component mount

  return (
    <div className="HomePage">
      <div className="homepage-logo">
        <img src={logo} alt="ComixUnlimited Logo" className="logo" />
      </div>
      <h1>ComixUnlimited</h1>

      {/* Display error message if any */}
      {error && <p className="error">{error}</p>}

      {/* Marvel Comics Section */}
      <div>
        <h2>Marvel Comics</h2>
        <div className="comics-scroll">
          {loading ? (
            <h2>Loading Marvel comics...</h2>
          ) : marvelComics.length > 0 ? (
            marvelComics.map((comic, index) => (
              <div key={index} className="comic-card">
                <h4>
                  <Link 
                    to={`/comic/${comic.title}`} 
                    style={{ color: '#e50914', fontWeight: 'bold', textDecoration: 'none' }}  // Red color and no underline
                    >
                    {comic.title}
                    </Link>
                </h4>

                {/* Show cover image */}
                {comic.coverPage && (
                  <img
                    src={comic.coverPage}  // Use coverPage URL from API
                    alt={comic.title}
                    className="comic-cover"
                  />
                )}

                {/* Remove description (or show a short one, if desired) */}
                {/* {comic.description && <p>{comic.description}</p>} */}
              </div>
            ))
          ) : (
            <p>No Marvel comics found.</p>
          )}
        </div>
      </div>

      {/* DC Comics Section */}
      <div>
        <h2>DC Comics</h2>
        <div className="comics-scroll">
          {loading ? (
            <h2>Loading DC comics...</h2>
          ) : dcComics.length > 0 ? (
            dcComics.map((comic, index) => (
              <div key={index} className="comic-card">
                <h4>
                <Link 
                  to={`/comic/${comic.title}`} 
                  style={{ color: '#e50914', fontWeight: 'bold', textDecoration: 'none' }}  // Red color and no underline
                  >
                  {comic.title}
                  </Link>
                </h4>

                {/* Show cover image */}
                {comic.coverPage && (
                  <img
                    src={comic.coverPage}  // Use coverPage URL from API
                    alt={comic.title}
                    className="comic-cover"
                  />
                )}

                {/* Remove description (or show a short one, if desired) */}
                {/* {comic.description && <p>{comic.description}</p>} */}
              </div>
            ))
          ) : (
            <p>No DC comics found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
