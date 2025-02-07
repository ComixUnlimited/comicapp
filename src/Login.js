import React, { useState } from 'react';
import { auth } from './firebase'; // Firebase Auth import
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import sendEmailVerification
import { useNavigate } from 'react-router-dom'; // For navigation

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Navigation hook

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the email is verified
      if (user.emailVerified) {
        setUser(user); // Set user state

        // Redirect to home page after successful login
        navigate('/'); // Use navigate to redirect to the homepage
      } else {
        // If email is not verified, send verification email
        setError('Your email is not verified. A verification email has been sent.');
        await sendEmailVerification(user); // Send verification email

        // Optionally log out the user after sending verification email
        await auth.signOut();
        setUser(null);
      }
    } catch (err) {
      // Log the entire error object to the console to inspect its structure
      console.error("Full Firebase error:", err);

      // Custom error handling based on Firebase error codes
      if (err.code) {
        setError('Either email/password is invalid. Please try again.');
      }
    }
  };

  return (
    <div>
      <h1>Welcome to ComixUnlimited!</h1>
      <h2>Login</h2>
      {/* Display error if there is any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
