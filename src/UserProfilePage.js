import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { db, auth } from './firebase';  // Assuming auth is initialized in firebase.js
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const UserProfilePage = () => {
  const { username } = useParams();  // Extract the username from the URL
  const [profile, setProfile] = useState({
    username: '',
    description: '',
    profilePicture: '',
    uid: '', // Add UID to profile state
  });
  const [comics, setComics] = useState([]);  // State to hold comics
  const [error, setError] = useState('');  // Error state
    const [friendsInfo, setFriendsInfo] = useState([]);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);  // Track if the friend request was sent
  const [hasSentFriendRequest, setHasSentFriendRequest] = useState(false);  // Check if the user has sent a friend request
  const [friends, setFriends] = useState([]); // State to track if they are friends

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
  // Fetch the user profile data based on username
  const fetchProfile = async () => {
    console.log('Fetching profile for username:', username);

    try {
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        console.log('Profile Data:', profileDoc.data());
        const profileData = profileDoc.data();
        setProfile(profileData);
        const friends = Array.isArray(profileData.friends) ? profileData.friends : [];

        // Fetch the friends data (usernames and profile pictures)
        const friendsInfoData = await Promise.all(
            friends.map(async (uid) => await fetchUserData(uid))
          );
    
          console.log('Fetched Friends Info:', friendsInfoData);  // Log friends data
    
          setFriendsInfo(friendsInfoData.filter(Boolean)); // filter out null responses
        // Check if the current user is already friends with this profile
        const currentUserUid = auth.currentUser.uid;

        // Check if the logged-in user is already friends
        if (profileData.friends && profileData.friends.includes(currentUserUid)) {
          setIsFriendRequestSent(true);  // Already friends, show "Friend Request Sent"
          setFriends(profileData.friends);  // Set friends data to show the UI
        }

        // Check if the current user has sent a friend request to this user
        if (profileData.receivedFriendRequests && profileData.receivedFriendRequests.includes(currentUserUid)) {
          setHasSentFriendRequest(true);
        }
      } else {
        console.log('Profile not found for username:', username);
        setError('Profile not found.');
      }
    } catch (err) {
      console.error('Error fetching profile: ', err);
      setError('Error fetching profile data.');
    }
  };

  // Fetch the user's comics from Firestore
  const fetchComics = async () => {
    try {
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();

        // Now, instead of querying a separate comics collection, use the comics array directly from the profile
        const comicsData = profileData.comics || [];  // Default to an empty array if no comics
        setComics(comicsData);
      } else {
        console.log('Profile not found for username:', username);
        setError('Profile not found.');
      }
    } catch (err) {
      console.error('Error fetching comics: ', err);
      setError('Error fetching comics.');
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
      return b.rating - a.rating; // Sort by rating if status is the same
    });
  };

  // Method to send a friend request to the user
  const sendFriendRequest = async () => {
    const currentUser = auth.currentUser;  // Get the logged-in user
    const currentUserUid = currentUser.uid;  // Get the current user's UID
    console.log("Sending friend request from user UID:", currentUserUid);

    if (!profile || !profile.uid) {
      console.error("Profile or Profile UID is missing.");
      setError('Unable to send friend request. Profile not found.');
      return;
    }

    try {
      // Log profile data to verify the content
      console.log("Profile Data:", profile);

      // Get the target user's profile
      const profileRef = doc(db, 'profiles', profile.uid);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        console.log("Profile Data:", profileData);

        // Ensure receivedFriendRequests is an array (initialize if missing)
        let receivedFriendRequests = profileData.receivedFriendRequests || [];
        let sentFriendRequests = profileData.sentFriendRequests || [];
        let friends = profileData.friends || [];

        // Check if the current user is already a friend
        if (friends.includes(currentUserUid)) {
          setError('You are already friends with this user.');
          return;
        }

        // Check if the current user has already sent a friend request
        if (sentFriendRequests.includes(currentUserUid)) {
          setError('Friend request already sent.');
          return;
        }

        // Add current user's UID to the target user's receivedFriendRequests
        receivedFriendRequests.push(currentUserUid);

        // Add the target user's UID to the current user's sentFriendRequests
        sentFriendRequests.push(profile.uid);

        // Update the target user's profile with the new receivedFriendRequests array
        await updateDoc(profileRef, { receivedFriendRequests });

        // Now update the current user's profile to include the target user in their sentFriendRequests
        const currentUserRef = doc(db, 'profiles', currentUserUid);
        const currentUserDoc = await getDoc(currentUserRef);

        if (currentUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          let currentUserSentFriendRequests = currentUserData.sentFriendRequests || [];

          // Add the target user's UID to the current user's sentFriendRequests array
          currentUserSentFriendRequests.push(profile.uid);

          // Update the current user's profile with the new sentFriendRequests array
          await updateDoc(currentUserRef, { sentFriendRequests: currentUserSentFriendRequests });

          // Confirm that the friend request was sent
          setIsFriendRequestSent(true);
          alert('Friend request sent!');
        }
      } else {
        setError('Target user not found.');
      }
    } catch (err) {
      console.error('Error sending friend request: ', err);
      setError('Failed to send friend request');
    }
  };

  useEffect(() => {
    console.log('Component mounted or username changed:', username);
    fetchProfile();
    fetchComics();  // Fetch comics when the component mounts
  }, [username]);  // Re-fetch profile and comics when the username changes

  return (
    <div className="UserProfilePage">
      <h1 style={{ marginTop: '100px' }}>User Profile</h1>

      {/* Only show the error if the profile is not found or another issue occurs */}
      {error && <h3>{error}</h3>}

      {profile && profile.username ? (
        <div className="profile-section">
          <h2>Profile Information</h2>
          <div className="profile-info">
            {profile.profilePicture && (
              <img src={profile.profilePicture} alt="Profile" className="profile-image" style={{ width: '150px', height: 'auto' }} />
            )}
            <h3>{profile.username}</h3>
            <p>{profile.description}</p>

            {/* Add Friend Button */}
            {auth.currentUser && auth.currentUser.uid !== profile.uid && !isFriendRequestSent && !hasSentFriendRequest && (
              <button onClick={sendFriendRequest} className="send-friend-request-btn">
                Send Friend Request
              </button>
            )}

            {/* Display messages based on status */}
            {hasSentFriendRequest && <p>You have already sent a friend request to this user.</p>}
            {isFriendRequestSent && <p>Friend request sent!</p>}
            {friends && friends.includes(auth.currentUser.uid) && <p>You are already friends with this user.</p>}
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>  // Show loading until the profile is available
      )}
      {/* Friends List Section */}
      <div className="friends-list-section">
        <h2>{profile.username}'s Friends</h2>
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
            <li key={comic.id} className="comic-item">
              {/* Comic Image */}
              <img src={comic.coverImage} alt={comic.title} />
              <div className="comic-details">
                <h3>{comic.title}</h3>
                <div style={{ color: 'white' }}>
                  <strong>Rating:</strong> {comic.rating}
                  <strong> Status:</strong> {comic.status}
                </div>
                {comic.review && <p style={{ color: 'white' }}><strong>Review:</strong> {comic.review}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfilePage;
