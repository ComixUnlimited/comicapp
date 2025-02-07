import React, { useState } from 'react';
import { auth } from './firebase'; // Firebase Auth import
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth'; // Import functions
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for redirection
import { db } from './firebase'; // Firestore import
import { doc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore'; // Firestore functions

const SignUp = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // State for username
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to navigate to a different route

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error messages

    try {
      // Check if the email is already taken
      const emailMethods = await fetchSignInMethodsForEmail(auth, email);

      if (emailMethods.length > 0) {
        setError('This email is already registered. Please use another one.');
        return;
      }

      // Check if the username is already taken by querying the profiles collection
      const profilesQuery = query(collection(db, 'profiles'), where('username', '==', username));
      const querySnapshot = await getDocs(profilesQuery);

      if (!querySnapshot.empty) {
        setError('This username is already taken! Please choose another one.');
        return;
      }

      // Create a user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification after sign-up
      await sendEmailVerification(user);

      // Store the user profile with username and uid in Firestore, initializing arrays for friends, friendRequests, and comics
      await setDoc(doc(db, 'profiles', user.uid), {
        uid: user.uid, // Save the UID as part of the profile document
        username: username,
        email: email,
        profilePicture: '', // Add the profile picture URL here if needed
        description: '', // Add description here if needed
        friends: [], // Empty array to store friend UIDs
        friendRequests: [], // Empty array to store friend request UIDs
        comics: [], // Empty array to store comic data
      });

      // Optionally: Show a message to tell the user to check their email for verification
      alert('Please check your email for verification before logging in.');

      setUser(user); // Set user state to logged-in user

      // Redirect to home page after successful sign-up
      navigate('/'); // Redirect to the homepage after sign-up
    } catch (err) {
      setError(err.message); // Display any errors during sign-up
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
