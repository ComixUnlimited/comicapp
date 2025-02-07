import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import ComicDetailPage from './ComicDetailPage';  // Import the new detail page
import SearchPage from './SearchPage';
import ProfilePage from './ProfilePage';
import HomePage from './HomePage';
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul className="nav-list">
            <li className="logo-item">
              <img src={logo} alt="ComixUnlimited Logo" className="navbar-logo" />
            </li>
            <li className="nav-left">
              <NavLink to="/" className="nav-item" activeClassName="active">
                Home
              </NavLink>
            </li>
            <li className="nav-left">
              <NavLink to="/search" className="nav-item" activeClassName="active">
                Search
              </NavLink>
            </li>
            <div className="nav-right">
              <li>
                <NavLink to="/profile" className="nav-item" activeClassName="active">
                  Profile
                </NavLink>
              </li>
              {user && (
                <li>
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                </li>
              )}
            </div>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={user ? <HomePage user={user} /> : <Login setUser={setUser} />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Login setUser={setUser} />} />
          <Route path="/search" element={<SearchPage />} />
          {/* Add route for comic detail page */}
          <Route path="/comic/:comicTitle" element={<ComicDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
