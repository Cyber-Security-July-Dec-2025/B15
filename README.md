# 🔒 SecureChat

A browser-based, end-to-end encrypted chat application built with **React.js**, **Node.js**, **Express**, **MongoDB**, and **OpenPGP.js**. SecureChat ensures that only you and your chat partner can read your messages—**not even the server can decrypt them**.

---

## 🚀 Features

- **End-to-End Encryption:** All messages are encrypted in the browser using OpenPGP.js. Only sender and recipient can decrypt.
- **Hybrid Encryption:** Each message is encrypted with a random AES key, which is then encrypted with both the sender's and recipient's public keys.
- **Secure Key Management:**  
  - RSA key pairs are generated in the browser.
  - The private key is encrypted with your password and stored securely in the database.
  - The decrypted private key is kept only in memory for your session.
- **User Authentication:** JWT-based login and registration.
- **Real-Time Messaging:** Instant message delivery using Socket.io.
- **Modern Responsive UI:** Clean, mobile-friendly interface.
- **Online Status:** See who is online in your contact list.
- **Session Security:** Password is required only once per session to unlock your private key.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, OpenPGP.js
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB
- **Encryption:** OpenPGP.js (RSA + AES hybrid)
- **Transport:** REST API & WebSockets

---

## 📦 Project Structure

```
securechat/
  backend/
    config/
    models/
    routes/
    middleware/
    server.js
    .env.example
  frontend/
    public/
    src/
      components/
      services/
      styles/
      App.js
      index.js
    package.json
  README.md
```

---

## ⚡ Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/yourusername/securechat.git
cd securechat
```

### 2. **Setup Environment Variables**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set your MongoDB URI and JWT secret
```

### 3. **Install Dependencies**

```bash
npm run install-all
```

### 4. **Start the App**

```bash
npm run dev
```
- The backend runs on `http://localhost:5000`
- The frontend runs on `http://localhost:3000`

---

## 👤 User Flow

### **Registration**
- Enter a username and password.
- The browser generates an RSA key pair.
- The private key is encrypted with your password (AES) and sent to the server.
- The public key and encrypted private key are stored in the database.

### **Login**
- Enter your username and password.
- The encrypted private key is fetched from the server.
- The browser decrypts the private key using your password (never sent to the server).
- The decrypted private key is kept only in memory for the session.

### **Sending Messages**
- Select a contact from the sidebar.
- Type your message and send.
- The message is encrypted with a random AES key.
- The AES key is encrypted with both your and the recipient's public keys.
- The encrypted message and key are sent to the server and delivered in real-time.

### **Receiving Messages**
- The browser uses your private key to decrypt the AES key.
- The AES key is used to decrypt the message.
- Only you and the recipient can read the message.

---

## 🔐 Security Highlights

- **Zero-Knowledge:** The server never sees your password or decrypted private key.
- **Forward Secrecy:** Each message uses a new random AES key.
- **Hybrid Encryption:** Combines speed (AES) and security (RSA).
- **No Plaintext Storage:** All sensitive data is encrypted at rest and in transit.
- **Session Security:** Decrypted private key is never stored in localStorage—only in memory.

---

## 📁 Key Files

### **Backend**
- `backend/server.js` - Express server and Socket.io setup
- `backend/models/User.js` - User schema (public key, encrypted private key, etc.)
- `backend/models/Message.js` - Message schema (encrypted content, AES key)
- `backend/routes/auth.js` - Registration, login, logout
- `backend/routes/users.js` - User listing and lookup
- `backend/routes/messages.js` - Message send/retrieve
- `backend/middleware/auth.js` - JWT authentication middleware

### **Frontend**
- `frontend/src/components/Auth/Login.js` - Login form and logic
- `frontend/src/components/Auth/Register.js` - Registration form and logic
- `frontend/src/components/Chat/ChatContainer.js` - Main chat UI and logic
- `frontend/src/services/crypto.js` - All cryptographic operations (key generation, encryption, decryption)
- `frontend/src/services/api.js` - API calls
- `frontend/src/services/socket.js` - WebSocket (Socket.io) logic
- `frontend/src/styles/App.css` - Main styles

---

## 📝 How It Works (Technical Overview)

1. **Key Generation:**  
   - On registration, the browser generates an RSA key pair.
   - The private key is encrypted with your password using AES and sent to the server.

2. **Message Encryption:**  
   - Each message is encrypted with a random AES key.
   - The AES key is encrypted with both the sender's and recipient's public keys.
   - The encrypted message and AES key are sent to the server.

3. **Message Decryption:**  
   - The recipient (or sender) uses their private key to decrypt the AES key.
   - The AES key is used to decrypt the message.

4. **Real-Time Delivery:**  
   - Messages are delivered instantly using Socket.io.

---

## ❓ FAQ

**Q: Can the server read my messages?**  
A: No. All messages are end-to-end encrypted. Only you and your chat partner can decrypt them.

**Q: Where is my private key stored?**  
A: Your private key is encrypted with your password and stored in the database. The decrypted key is only ever in your browser’s memory for your session.

**Q: What if I forget my password?**  
A: You will not be able to decrypt your private key or your messages. There is no password reset for security reasons.

**Q: Can I use this on multiple devices?**  
A: Yes, but you must log in and enter your password on each device to decrypt your private key.

---

## 🙏 Acknowledgements

- [OpenPGP.js](https://openpgpjs.org/)
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://mongodb.com/)
- [Socket.io](https://socket.io/)

---