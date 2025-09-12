import React, { useState, useEffect, useRef } from 'react';
import { usersAPI, messagesAPI } from '../../services/api';
import { hybridEncryptMessage, hybridDecryptMessage, decryptPrivateKeyAES } from '../../services/crypto';
import { getSocket } from '../../services/socket';
import { PaperAirplaneIcon, MagnifyingGlassIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import './ChatContainer.css';

const ChatContainer = ({ currentUser, showStatus }) => {
  const [isDesktop, setDesktop] = useState(window.innerWidth >= 768);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const decryptedPrivateKeyRef = useRef(null);
  const passphraseRef = useRef('');

  useEffect(() => {
    const handleResize = () => setDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    usersAPI.getAllUsers().then(res => setUsers(res.data));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      messagesAPI.getConversation(selectedUser.username).then(res => setMessages(res.data));
      if (!isDesktop) setSidebarOpen(false);
    }
  }, [selectedUser, isDesktop]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('receive_message', (msg) => {
      if (msg.from === selectedUser?.username || msg.to === selectedUser?.username) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socket.off('receive_message');
    };
  }, [selectedUser]);

  const getDecryptedPrivateKey = async () => {
    if (decryptedPrivateKeyRef.current) return decryptedPrivateKeyRef.current;
    const encryptedPrivateKey = localStorage.getItem('privateKey');
    let passphrase = passphraseRef.current;
    if (!passphrase) {
      passphrase = window.prompt('Enter your password to decrypt your private key:');
      passphraseRef.current = passphrase;
    }
    try {
      const privateKeyArmored = await decryptPrivateKeyAES(encryptedPrivateKey, passphrase);
      decryptedPrivateKeyRef.current = privateKeyArmored;
      return privateKeyArmored;
    } catch (err) {
      showStatus('Failed to decrypt private key. Wrong password?', 'error');
      decryptedPrivateKeyRef.current = null;
      passphraseRef.current = '';
      throw err;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input || !selectedUser) return;
    setLoading(true);
    try {
      // Use both recipient and sender public keys
      const recipientPublicKey = selectedUser.publicKey;
      const senderPublicKey = currentUser.publicKey;
      const { encryptedMessage, encryptedAESKey } = await hybridEncryptMessage(
        input,
        [recipientPublicKey, senderPublicKey]
      );
      const messageData = {
        to: selectedUser.username,
        encryptedContent: encryptedMessage,
        encryptedAESKey,
        messageType: 'text'
      };
      await messagesAPI.sendMessage(messageData);
      setMessages(prev => [
        ...prev,
        {
          from: currentUser.username,
          to: selectedUser.username,
          encryptedContent: encryptedMessage,
          encryptedAESKey,
          messageType: 'text'
        }
      ]);
      getSocket().emit('send_message', {
        from: currentUser.username,
        to: selectedUser.username,
        encryptedContent: encryptedMessage,
        encryptedAESKey,
        messageType: 'text'
      });
      setInput('');
      showStatus('Message sent', 'success');
    } catch (err) {
      showStatus('Failed to send message', 'error');
    }
    setLoading(false);
  };

  const getAvatar = (username) => (
    <div className="avatar">{username.slice(0, 2).toUpperCase()}</div>
  );
  const getLastPreview = (user) => "Click to view messages";

  // Filter users by search
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-container" style={{ display: 'flex', height: '100vh', minHeight: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <aside
        className={`sidebar-wrapper ${isDesktop || isSidebarOpen ? 'sidebar-wrapper--open' : ''}`}
        style={{
          minWidth: 0,
          width: isDesktop ? 240 : (isSidebarOpen ? 240 : 0),
          transition: 'width 0.2s',
          zIndex: 10,
          position: isDesktop ? 'relative' : 'absolute',
          left: 0, top: 0, bottom: 0, background: '#fff'
        }}
      >
        <div className="sidebar-header" style={{ borderBottom: '1px solid #eee', padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1976d2' }}>SecureChat</div>
          {currentUser && (
            <div style={{ marginTop: 8, fontSize: '1rem', color: '#333', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontWeight: 500 }}>{currentUser.username}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                style={{
                  marginTop: 4,
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="sidebar-search">
          <input
            type="text"
            className="sidebar-search__input"
            placeholder="Search or start new chat"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="sidebar-search__icon" />
        </div>
        <div className="user-list-container">
          <ul className="user-list">
            {filteredUsers.map(user => (
              <li key={user.username}>
                <button
                  onClick={() => setSelectedUser(user)}
                  className={`user-item ${selectedUser?.username === user.username ? 'user-item--selected' : ''}`}
                  style={{ width: '100%' }}
                >
                  <div className="avatar">
                    {user.username.slice(0, 2).toUpperCase()}
                    <span className={`avatar__status ${user.isOnline ? 'avatar__status--online' : 'avatar__status--offline'}`}></span>
                  </div>
                  <div className="user-info">
                    <div className="user-info__name">{user.username}</div>
                    <div className="user-info__preview">{getLastPreview(user)}</div>
                  </div>
                </button>
              </li>
            ))} 
            {filteredUsers.length === 0 && (
              <li style={{ color: '#888', padding: '1rem', textAlign: 'center' }}>No users found</li>
            )}
          </ul>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-header__left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {!isDesktop && (
                  <button onClick={() => setSidebarOpen(true)} className="menu-button" style={{ marginRight: 8 }}>
                    <Bars3Icon className="icon-md" />
                  </button>
                )}
                {getAvatar(selectedUser.username)}
                <div>
                  <div className="chat-header__name">{selectedUser.username}</div>
                  <div className="chat-header__status">
                    <span className={`chat-header__status-dot ${selectedUser.isOnline ? 'chat-header__status-dot--online' : 'chat-header__status-dot--offline'}`}></span>
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="chat-header__actions">
                {/* Add more header actions here if needed */}
              </div>
            </div>

            <div className="message-list-container">
              {messages.map((msg, idx) => (
                <MessageItem key={idx} msg={msg} currentUser={currentUser} getDecryptedPrivateKey={getDecryptedPrivateKey} />
              ))}
            </div>

            <form onSubmit={sendMessage} className="message-form">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                required
                rows={1}
                className="message-form__textarea"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !input}
                className="message-form__submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, width: 40, height: 40 }}
                title="Send"
              >
                <PaperAirplaneIcon className="icon-submit" style={{ width: 22, height: 22, transform: 'rotate(90deg)' }} />
              </button>
            </form>
          </>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="40" fill="#1976d2" opacity="0.08"/>
                <path d="M24 56v-4a8 8 0 018-8h16a8 8 0 018 8v4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="40" cy="36" r="8" stroke="#1976d2" strokeWidth="2"/>
              </svg>
            </div>
            <h2>Welcome to SecureChat</h2>
            <p>Select a contact from the list to start a secure conversation.<br/>Your messages are end-to-end encrypted.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const MessageItem = ({ msg, currentUser, getDecryptedPrivateKey }) => {
  const [decrypted, setDecrypted] = useState('');

  useEffect(() => {
    const decrypt = async () => {
      try {
        // Always decrypt, even if sent by current user
        const privateKeyArmored = await getDecryptedPrivateKey();
        const dec = await hybridDecryptMessage(msg.encryptedContent, msg.encryptedAESKey, privateKeyArmored);
        setDecrypted(dec);
      } catch {
        setDecrypted('[Encrypted]');
      }
    };
    decrypt();
  }, [msg, currentUser, getDecryptedPrivateKey]);

  const isSent = msg.from === currentUser.username;

  return (
    <div className={`message-item-wrapper ${isSent ? 'message-item-wrapper--sent' : 'message-item-wrapper--received'}`}>
      <div className={`message-bubble ${isSent ? 'message-bubble--sent' : 'message-bubble--received'}`}>
        <p>{decrypted}</p>
        <div className="message-timestamp">
          <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;