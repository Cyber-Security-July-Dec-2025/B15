import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { generateKeyPair, getFingerprint, encryptPrivateKeyAES } from '../../services/crypto';

const Register = ({ onRegister, onShowLogin, showStatus }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { publicKey, privateKey } = await generateKeyPair(username);
      const fingerprint = await getFingerprint(publicKey);
      const encryptedPrivateKey = await encryptPrivateKeyAES(privateKey, password);

      // Send username, publicKey, fingerprint, encryptedPrivateKey to backend
      const res = await authAPI.register({ username, publicKey, fingerprint, encryptedPrivateKey });

      // Store encryptedPrivateKey in localStorage for session (optional)
      localStorage.setItem('privateKey', encryptedPrivateKey);

      onRegister(res.data.user, res.data.token);
      showStatus('Registration successful', 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        required
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (for key encryption)"
        value={password}
        required
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      <p>
        Already have an account? <button type="button" onClick={onShowLogin}>Login</button>
      </p>
    </form>
  );
};

export default Register;