import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ProfilePage = ({ user }) => {
  const [comics, setComics] = useState([]);
  const [profile, setProfile] = useState({
    username: '',
    description: '',
    profilePicture: '',
    originalUsername: '',
    receivedFriendRequests: [],
    friends: [] // Track friends
  });
  const [friendRequestsInfo, setFriendRequestsInfo] = useState([]);
  const [friendsInfo, setFriendsInfo] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingComic, setIsEditingComic] = useState(null);
  const [editedComic, setEditedComic] = useState({
    rating: 0,
    status: 'Want to Read',
    review: '',
  });
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch user data (username and profile picture) based on UID
  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, 'profiles', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log('User not found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching user data: ', err);
    }
  };

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        
        console.log('Fetched Profile Data:', profileData);  // Log profile data
  
        // Make sure receivedFriendRequests and friends are arrays, defaulting to empty arrays if undefined
        const receivedFriendRequests = Array.isArray(profileData.receivedFriendRequests) ? profileData.receivedFriendRequests : [];
        const friends = Array.isArray(profileData.friends) ? profileData.friends : [];
  
        setProfile({
          ...profileData,
          receivedFriendRequests, // Ensure it's an array
          friends, // Ensure it's an array
          originalUsername: profileData.username, // Store the original username
        });
  
        // Fetch the friend requests data (usernames and profile pictures)
        const requestsInfo = await Promise.all(
          receivedFriendRequests.map(async (uid) => await fetchUserData(uid))
        );
  
        console.log('Fetched Friend Requests Info:', requestsInfo);  // Log friend requests data
  
        setFriendRequestsInfo(requestsInfo.filter(Boolean)); // filter out null responses
  
        // Fetch the friends data (usernames and profile pictures)
        const friendsInfoData = await Promise.all(
          friends.map(async (uid) => await fetchUserData(uid))
        );
  
        console.log('Fetched Friends Info:', friendsInfoData);  // Log friends data
  
        setFriendsInfo(friendsInfoData.filter(Boolean)); // filter out null responses
      }
    } catch (err) {
      console.error('Error fetching profile: ', err);
    }
  };

  // Fetch comics data
  const fetchComics = async () => {
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        const comicsData = profileDoc.data().comics || [];
        setComics(comicsData);
      }
    } catch (err) {
      console.error('Error fetching comics: ', err);
    }
  };

  // Check if username is available
  const checkUsernameAvailability = async (newUsername) => {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('username', '==', newUsername));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  // Update profile data
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (profile.username !== profile.originalUsername) {
      const isUsernameAvailable = await checkUsernameAvailability(profile.username);

      if (!isUsernameAvailable) {
        setUsernameError('This username is already taken. Please choose a different one.');
        return;
      } else {
        setUsernameError('');
      }
    }

    try {
      await updateDoc(doc(db, 'profiles', user.uid), profile);
      setIsEditingProfile(false);
      setIsSubmitted(false);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  // Delete comic
  const handleDeleteComic = async (comicTitle) => {
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        const comics = profileDoc.data().comics || [];
        const updatedComics = comics.filter((comic) => comic.title !== comicTitle);
        await updateDoc(profileRef, { comics: updatedComics });
        setComics(updatedComics);
        alert('Comic deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting comic: ', err);
      alert('Failed to delete comic');
    }
  };

  // Edit comic
  const handleEditComic = (comic) => {
    setIsEditingComic(comic.title);
    setEditedComic({
      rating: comic.rating,
      status: comic.status,
      review: comic.review || '',
    });
  };

  // Update comic
  const handleUpdateComic = async (e, comicTitle) => {
    e.preventDefault();
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        const comics = profileDoc.data().comics || [];
        const updatedComics = comics.map((comic) =>
          comic.title === comicTitle ? { ...comic, ...editedComic } : comic
        );
        await updateDoc(profileRef, { comics: updatedComics });
        setComics(updatedComics);
        setIsEditingComic(null);
        alert('Comic updated successfully');
      }
    } catch (err) {
      console.error('Error updating comic: ', err);
      alert('Failed to update comic');
    }
  };

  // Accept friend request
  const handleAcceptFriendRequest = async (requesterUid) => {
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();

        const currentFriends = Array.isArray(profileData.friends) ? profileData.friends : [];
        const updatedReceivedRequests = profileData.receivedFriendRequests.filter(
          (uid) => uid !== requesterUid
        );
        const updatedFriends = [...currentFriends, requesterUid];

        await updateDoc(profileRef, {
          receivedFriendRequests: updatedReceivedRequests,
          friends: updatedFriends,
        });

        setProfile({
          ...profile,
          receivedFriendRequests: updatedReceivedRequests,
          friends: updatedFriends,
        });

        const otherProfileRef = doc(db, 'profiles', requesterUid);
        const otherProfileDoc = await getDoc(otherProfileRef);
        if (otherProfileDoc.exists()) {
          const otherProfileData = otherProfileDoc.data();
          const updatedOtherProfileFriends = [...(Array.isArray(otherProfileData.friends) ? otherProfileData.friends : []), user.uid];

          await updateDoc(otherProfileRef, {
            friends: updatedOtherProfileFriends,
          });
        }

        alert('Friend request accepted');
      }
    } catch (err) {
      console.error('Error accepting friend request: ', err);
      alert('Failed to accept friend request');
    }
  };

  // Reject friend request
  const handleRejectFriendRequest = async (requesterUid) => {
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const updatedReceivedRequests = profileData.receivedFriendRequests.filter(
          (uid) => uid !== requesterUid
        );

        await updateDoc(profileRef, {
          receivedFriendRequests: updatedReceivedRequests,
        });

        setProfile({
          ...profile,
          receivedFriendRequests: updatedReceivedRequests,
        });

        alert('Friend request rejected');
      }
    } catch (err) {
      console.error('Error rejecting friend request: ', err);
      alert('Failed to reject friend request');
    }
  };

  // Sort comics by status and rating
  const sortComics = (comics) => {
    const statusOrder = {
      'Finished': 1,
      'Reading': 2,
      'Want to Read': 3,
    };

    return comics.sort((a, b) => {
      const statusComparison = statusOrder[a.status] - statusOrder[b.status];
      if (statusComparison !== 0) return statusComparison;
      return b.rating - a.rating;
    });
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchComics();
    }
  }, [user]);

  return (
    <div className="ProfilePage">
      <h1 style={{ marginTop: '100px' }}>ComixUnlimited</h1>

      {/* Profile Section */}
      <div className="profile-section">
        <h2>Profile Information</h2>
        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate}>
            <div>
              <label>Username (Case Sensitive):</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                style={{ width: '100%', height: '150px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label>Profile Picture URL:</label>
              <input
                type="text"
                value={profile.profilePicture}
                onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })}
              />
            </div>
            {isSubmitted && usernameError && <p className="error">{usernameError}</p>}
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <div className="profile-info">
            {profile.profilePicture && <img src={profile.profilePicture} alt="Profile" className="profile-image" />}
            <h3>{profile.username}</h3>
            <p>{profile.description}</p>
            <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      <div className="friend-requests-section">
        <h2>Friend Requests</h2>
        <div className="friend-requests">
          {friendRequestsInfo.map((userInfo, index) => (
            <div key={index} className="friend-request-item">
              <img
                src={userInfo.profilePicture}
                alt={userInfo.username}
                className="profile-image"
                style={{ width: '50px', height: 'auto', objectFit: 'cover' }}
              />
              <p>{userInfo.username}</p>
              <button
                onClick={() => handleAcceptFriendRequest(profile.receivedFriendRequests[index])}
              >
                Accept
              </button>
              <button
                onClick={() => handleRejectFriendRequest(profile.receivedFriendRequests[index])}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Friends List Section */}
      <div className="friends-list-section">
        <h2>Your Friends</h2>
        <div>
          {friendsInfo.map((userInfo, index) => (
            <div key={index} className="friend-item">
              <img
                src={userInfo.profilePicture}
                alt={userInfo.username}
                className="profile-img"
                style={{ width: '50px', height: 'auto', objectFit: 'cover' }}
              />
              {/* Navigate to the user's profile page */}
              <Link
                to={`/profile/${userInfo.username}`}
                style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}
                className="friend-username"
              >
                {userInfo.username}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Comics List Section */}
      <div className="comics-list">
        <h2>{profile.username}'s Comics</h2>
        <ul>
          {sortComics(comics).map((comic) => (
            <li key={comic.title} className="comic-item">
              <img src={comic.coverImage} alt={comic.title} />
              <div className="comic-details">
                <h3>{comic.title}</h3>
                <div>
                  <strong>Rating:</strong> {comic.rating}
                  <strong> Status:</strong> {comic.status}
                </div>
                {comic.review && <p><strong>Review:</strong> {comic.review}</p>}
              </div>
              <button onClick={() => handleEditComic(comic)}>Edit</button>
              <button onClick={() => handleDeleteComic(comic.title)}>Delete</button>

              {isEditingComic === comic.title && (
                <form onSubmit={(e) => handleUpdateComic(e, comic.title)}>
                  <div>
                    <label>Rating:</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editedComic.rating}
                      onChange={(e) =>
                        setEditedComic({ ...editedComic, rating: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Status:</label>
                    <select
                      value={editedComic.status}
                      onChange={(e) =>
                        setEditedComic({ ...editedComic, status: e.target.value })
                      }
                    >
                      <option value="Want to Read">Want to Read</option>
                      <option value="Reading">Reading</option>
                      <option value="Finished">Finished</option>
                    </select>
                  </div>
                  <div>
                    <label>Review:</label>
                    <textarea
                      value={editedComic.review}
                      onChange={(e) =>
                        setEditedComic({ ...editedComic, review: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setIsEditingComic(null)}>
                    Cancel
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
