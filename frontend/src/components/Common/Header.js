import React from 'react';

const Header = ({ currentUser, onLogout, isAuthenticated }) => (
  <header className="header">
    <h1>SecureChat</h1>
    {isAuthenticated && currentUser && (
      <div>
        <span>Welcome, {currentUser.username}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    )}
  </header>
);

export default Header;