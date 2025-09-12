import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const Login = ({ onLogin, onShowRegister, showStatus }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login({ username });
      const { encryptedPrivateKey } = res.data.user;
      if (encryptedPrivateKey) {
        localStorage.setItem('privateKey', encryptedPrivateKey);
      } else {
        showStatus('Login failed: No private key found for this user. Please register again.', 'error');
        return;
      }
      onLogin(res.data.user, res.data.token);
      showStatus('Login successful', 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Login failed', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        required
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (for key decryption)"
        value={password}
        required
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      <p>
        Don't have an account? <button type="button" onClick={onShowRegister}>Register</button>
      </p>
    </form>
  );
};

export default Login;