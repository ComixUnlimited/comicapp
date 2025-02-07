import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigating to the sign-up page
import Login from './Login'; // Import your Login component

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate(); // Hook to navigate to the signup page

  return (
    <div className="login-container">
      {/* Pass setUser prop to the Login component */}
      <Login setUser={setUser} />

      <div className="signup-container">
        <h5>Don't have an account?</h5>
        {/* Add a class to the button for styling */}
        <button className="signup-button" onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
