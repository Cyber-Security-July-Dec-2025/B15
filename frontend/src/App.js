import React, { useState, useEffect } from 'react';
// import Header from './components/Common/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatContainer from './components/Chat/ChatContainer';
import StatusMessage from './components/Common/StatusMessage';
import { initializeSocket, disconnectSocket } from './services/socket';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    // Check for stored authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
      initializeSocket(JSON.parse(user));
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
    initializeSocket(userData);
  };

 

  const showStatus = (message, type) => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 5000);
  };

  return (
    <div className="App">
     
      
      <div className="container">
        {!isAuthenticated ? (
          <div className="auth-container">
            {showRegister ? (
              <Register 
                onRegister={handleLogin}
                onShowLogin={() => setShowRegister(false)}
                showStatus={showStatus}
              />
            ) : (
              <Login 
                onLogin={handleLogin}
                onShowRegister={() => setShowRegister(true)}
                showStatus={showStatus}
              />
            )}
          </div>
        ) : (
          <ChatContainer 
            currentUser={currentUser}
            showStatus={showStatus}
          />
        )}
        
        <StatusMessage status={status} />
      </div>
    </div>
  );
}

export default App;