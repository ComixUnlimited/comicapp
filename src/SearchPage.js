import React, { useState } from 'react';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import { getComicsThroughSearch } from './search';  // Import the function from your API file

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Track if the user has searched

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      setError('');
      setHasSearched(true);  // Set to true after user submits search
      console.log('Searching for:', searchQuery);  // Log the search query

      // Use the getComicsThroughSearch function to fetch results
      getComicsThroughSearch(searchQuery, 1)
        .then(comicsData => {
          console.log('Comics fetched:', comicsData);  // Log the fetched comics data
          
          // Log the structure of the first comic in the response
          if (comicsData.length > 0) {
            console.log('First comic data structure:', comicsData[0]);
          }

          setComics(comicsData);  // Set the comics data from the API response
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching comics:', err);  // Log any errors from the API call
          setError('No comics found.');
          setLoading(false);
        });
    } else {
      console.log('Search query is empty');
    }
  };

  return (
    <div>
      <h1>Search Comics</h1>
      <form onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          placeholder="Enter Comic Name" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <button type="submit">Search</button>
      </form>

      {/* Display Loading, Error, or Comics */}
      {loading && <h5>Loading...</h5>}
      {error && <h5>{error}</h5>}
      
      {/* Only show 'No comics found' message after user has searched */}
      {!loading && !error && hasSearched && comics.length === 0 && <p>No comics found for your search query.</p>}

      <div>
        {/* Display Comics */}
        {!loading && !error && comics.length > 0 && (
          <ul>
            {comics.map((comic, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img 
                  src={comic.coverPage} 
                  alt={comic.title} 
                  style={{ width: '100px', height: '150px', marginRight: '20px' }} 
                />
                <div style={{ maxWidth: '600px', wordWrap: 'break-word' }}>
                  <h2>
                    {/* Apply red styling to the comic title */}
                    <Link 
                      to={`/comic/${comic.title}`} 
                      style={{ color: '#e50914', fontWeight: 'bold', textDecoration: 'none' }}  // Red color and no underline
                    >
                      {comic.title}
                    </Link>
                  </h2>
                  <h5>{comic.description}</h5>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
