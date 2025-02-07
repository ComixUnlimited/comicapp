import React, { useState } from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';  // Ensure Firebase is initialized

const SearchProfilePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);  // Track if the user has searched

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle profile search submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      setError('');
      setHasSearched(true);  // Set to true after user submits search
      console.log('Searching for profiles with username:', searchQuery);  // Log the search query

      // Fetch profiles based on the search query
      try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('username', '>=', searchQuery), where('username', '<=', searchQuery + '\uf8ff'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('No profiles found.');
        } else {
          setError('');
          const profileData = querySnapshot.docs.map((doc) => doc.data());
          setProfiles(profileData);  // Set the profiles from the API response
        }
      } catch (err) {
        console.error('Error searching for profiles:', err);  // Log any errors
        setError('Error searching profiles.');
      }
      setLoading(false);
    } else {
      console.log('Search query is empty');
    }
  };

  return (
    <div>
      <h1>Search User Profiles</h1>
      <form onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          placeholder="Enter Username (Case Sensitive)" 
          value={searchQuery} 
          onChange={handleSearchChange} 
        />
        <button type="submit">Search</button>
      </form>

      {/* Display Loading, Error, or Profiles */}
      {loading && <h5>Loading...</h5>}
      {error && <h5>{error}</h5>}

      {/* Only show 'No profiles found' message after user has searched */}
      {!loading && !error && hasSearched && profiles.length === 0 && <p>No profiles found for your search query.</p>}

      <div>
        {/* Display Profiles */}
        {!loading && !error && profiles.length > 0 && (
          <ul>
            {profiles.map((profile, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img 
                  src={profile.profilePicture} // Assuming there's a pictureUrl field in profile data
                  alt={profile.username}
                  style={{ width: '100px', height: 'auto', marginRight: '30px', objectFit: 'cover' }}  // Circle image
                />
                <div style={{ maxWidth: '600px', wordWrap: 'break-word' }}>
                  <h2>
                    {/* Navigate to the user's profile page */}
                    <Link to={`/profile/${profile.username}`} style={{ color: '#e50914', fontWeight: 'bold', textDecoration: 'none' }}>
                      {profile.username}
                    </Link>
                  </h2>
                  <p>{profile.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchProfilePage;
