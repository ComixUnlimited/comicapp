import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase'; 
import { getComicsThroughSearch } from './search'; 
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const ComicDetailPage = ({ user }) => {
  const { comicTitle } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alreadyInList, setAlreadyInList] = useState(false);

  useEffect(() => {
    const fetchComicDetails = async () => {
      try {
        const comicsData = await getComicsThroughSearch(comicTitle, 1); 
        if (comicsData.length > 0) {
          setComic(comicsData[0]);  
        } else {
          setError('Comic not found.');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load comic details');
        setLoading(false);
      }
    };

    const checkIfComicInList = async () => {
      try {
        if (user) {
          const profileRef = doc(db, 'profiles', user.uid);
          const profileDoc = await getDoc(profileRef);
          if (profileDoc.exists()) {
            const comics = profileDoc.data().comics || [];
            const comicExists = comics.some(c => c.title === comicTitle);
            setAlreadyInList(comicExists);
          }
        }
      } catch (err) {
        console.error('Error checking comic list: ', err);
      }
    };

    if (comicTitle) {
      fetchComicDetails();
      checkIfComicInList();
    }
  }, [comicTitle, user]);

  const handleAddComic = async () => {
    if (user) {
      try {
        const comicToAdd = { 
          title: comic.title, 
          rating: 0, 
          status: 'Want to Read',  
          coverImage: comic.coverPage, 
        };

        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);
        if (profileDoc.exists()) {
          const comics = profileDoc.data().comics || [];
          // Only add the comic if it's not already in the list
          if (!comics.some(c => c.title === comic.title)) {
            comics.push(comicToAdd);
            await updateDoc(profileRef, { comics });
            alert(`${comic.title} added to your comic list!`);
            setAlreadyInList(true);
          } else {
            alert('This comic is already in your list!');
          }
        }
      } catch (err) {
        console.error('Error adding comic to profile: ', err);
        alert('Failed to add comic to your list');
      }
    } else {
      alert('Please log in to add comics to your list');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {comic && (
        <div>
          <h1>{comic.title}</h1>
          <img 
            src={comic.coverPage} 
            alt={comic.title} 
            style={{ width: '450px', height: 'auto', objectFit: 'contain' }} 
          />
          <h2>{comic.description}</h2>

          {/* Display additional information if available */}
          {comic.information && (
            <>
              <p><strong>Year:</strong> {comic.information.Year}</p>
              <p><strong>Size:</strong> {comic.information.Size}</p>
              <p><strong>Format:</strong> {comic.information.ImageFormat}</p>
            </>
          )}

          {/* Display Download Links */}
          <h5>Download Links</h5>
          <ul>
  {Object.entries(comic.downloadLinks).map(([key, link]) => (
    <li key={key}>
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="no-link-style"  // Add this class to the <a> tag
      >
        {key}
      </a>
    </li>
  ))}
</ul>

          {/* Add to Comic List Button */}
          {user && !alreadyInList && (
            <button 
              onClick={handleAddComic} 
              className="add-to-comic-list-btn"
            >
              Add to My Comic List
            </button>
          )}
          {alreadyInList && <p>This comic is already in your list!</p>}
        </div>
      )}
    </div>
  );
};

export default ComicDetailPage;
