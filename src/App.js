import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import Login from './LoginPage';
import SignUp from './SignUp';
import SearchPage from './SearchPage'; 
import SearchProfilePage from './SearchProfilePage'; 
import ComicDetailPage from './ComicDetailPage';
import UserProfilePage from './UserProfilePage';
import MessagesPage from './MessagesPage'; 
import { auth, signOut } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import logo from './logo.jpg';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AppWithRouter user={user} setUser={setUser} />
    </Router>
  );
};

const AppWithRouter = ({ user, setUser }) => {
  const navigate = useNavigate();  // Use navigate inside this component

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/');  // Redirect to the homepage after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div>
      {/* Taskbar (Navbar) */}
      <nav className="navbar">
        {/* Left side: Logo and Home */}
        <div className="nav-left">
          <img src={logo} alt="ComixUnlimited Logo" className="navbar-logo" />
          <NavLink to="/" className="nav-item" activeClassName="active">
            Home
          </NavLink>
        </div>

        {/* Right side: Search, Profile, Messages, and Logout */}
        <div className="nav-right">
          <NavLink to="/search" className="nav-item" activeClassName="active">
            Search Comics
          </NavLink>
          <NavLink to="/searchprofile" className="nav-item" activeClassName="active">
            Search Profiles
          </NavLink>
          {user && (
            <>
              <NavLink to="/profile" className="nav-item" activeClassName="active">
                Profile
              </NavLink>
              <NavLink to="/messages" className="nav-item" activeClassName="active">
                Messages
              </NavLink>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={user ? <HomePage user={user} /> : <Login setUser={setUser} />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/searchprofile" element={<SearchProfilePage />} />
        <Route path="/comic/:comicTitle" element={<ComicDetailPage user={user}/>} />
        <Route path="/profile/:username" element={<UserProfilePage />} />
        <Route path="/messages" element={user ? <MessagesPage user={user} /> : <Login setUser={setUser} />} />
      </Routes>
    </div>
  );
};

export default App;
