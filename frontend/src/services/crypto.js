import * as openpgp from 'openpgp';

// AES encryption for private key
export const encryptPrivateKeyAES = async (privateKeyArmored, password) => {
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: privateKeyArmored }),
    passwords: [password],
    format: 'armored'
  });
  return encrypted;
};

export const decryptPrivateKeyAES = async (encryptedPrivateKey, password) => {
  const message = await openpgp.readMessage({ armoredMessage: encryptedPrivateKey });
  const { data: decrypted } = await openpgp.decrypt({
    message,
    passwords: [password],
    format: 'armored'
  });
  return decrypted;
};

// Key generation (no passphrase)
export const generateKeyPair = async (username) => {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name: username, email: `${username}@securechat.local` }]
    // DO NOT set passphrase here!
  });
  return { privateKey, publicKey };
};

export const getFingerprint = async (publicKeyArmored) => {
  try {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    return publicKey.getFingerprint().toUpperCase().match(/.{1,4}/g).join(' ');
  } catch (error) {
    throw new Error('Failed to get fingerprint: ' + error.message);
  }
};

export const encryptMessage = async (message, recipientPublicKey) => {
  try {
    const publicKey = await openpgp.readKey({ armoredKey: recipientPublicKey });
    
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: message }),
      encryptionKeys: publicKey
    });

    return encrypted;
  } catch (error) {
    throw new Error('Failed to encrypt message: ' + error.message);
  }
};

export const decryptMessage = async (encryptedMessage, privateKeyArmored, passphrase) => {
  try {
    const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
      passphrase
    });

    const { data: decrypted } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey
    });

    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt message: ' + error.message);
  }
};

export const hybridEncryptMessage = async (message, publicKeysArmoredArray) => {
  // publicKeysArmoredArray: [recipientPublicKey, senderPublicKey]
  // Generate random AES key (256-bit)
  const aesKeyBytes = new Uint8Array(32);
  window.crypto.getRandomValues(aesKeyBytes);
  const aesKeyHex = Array.from(aesKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Encrypt message with AES key
  const encryptedMessage = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: message }),
    passwords: [aesKeyHex],
    format: 'armored'
  });

  // Encrypt AES key with BOTH public keys
  const publicKeys = await Promise.all(
    publicKeysArmoredArray.map(key => openpgp.readKey({ armoredKey: key }))
  );
  const encryptedAESKey = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: aesKeyHex }),
    encryptionKeys: publicKeys,
    format: 'armored'
  });

  return {
    encryptedMessage,
    encryptedAESKey
  };
};

// Hybrid decryption (no passphrase)
export const hybridDecryptMessage = async (encryptedMessage, encryptedAESKey, privateKeyArmored) => {
  // Decrypt AES key with private key
  const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
  const aesKeyMessage = await openpgp.readMessage({ armoredMessage: encryptedAESKey });
  const { data: aesKeyHex } = await openpgp.decrypt({
    message: aesKeyMessage,
    decryptionKeys: privateKey,
    format: 'armored'
  });

  // Decrypt message with AES key
  const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });
  const { data: decrypted } = await openpgp.decrypt({
    message,
    passwords: [aesKeyHex],
    format: 'armored'
  });

  return decrypted;
};