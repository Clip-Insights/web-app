import CryptoJS from "crypto-js";

// Function to fetch data from an API endpoint
export const getData = async (url) => {
    try {
        // Making the GET request using fetch
        const response = await fetch(`${url}`);
        // Check if the response is not okay (status code not in the 200–299 range)
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        // Parse the JSON data
        const data = await response.json();

        // Returning the transformed data
        return { data: data, error: null };
    } catch (error) {
        // optional and can be removed
        console.error('API fetch error:', error);

        // Handling different error scenarios
        if (error.message.startsWith('Server Error')) {
            return { data: null, error: error.message };
        } else if (error.message === 'Failed to fetch') {
            // Handle network errors (e.g., no internet connection)
            return { data: null, error: 'Network Error: Unable to reach the server' };
        } else {
            return { data: null, error: `Error: ${error.message}` };
        }
    }
};

export function truncateFileName(fileName, maxLength = 30) {
  if (fileName.length > maxLength) {
    return `${fileName.substring(0, maxLength)}...`;
  }
  return fileName;
}


export const getApiUrl = (endpoint) => {
    // Dynamically set the API URL based on the environment
    const url =
        import.meta.env.PROD
            ? `${import.meta.env.VITE_API_URL}/api/${endpoint}`
            : `http://localhost:8000/api/${endpoint}`;

    return url;
}
const secretKey = 'your-secret-key'; // Use a strong secret key

export const encryptToken = (token) => {
  if (!token) return null;
  try {
    return CryptoJS.AES.encrypt(token, secretKey).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// const ENCRYPTION_KEY = 'my-super-secret'

// async function getKey() {
//   const keyMaterial = await window.crypto.subtle.importKey(
//       'raw',
//       new TextEncoder().encode(ENCRYPTION_KEY),
//       { name: 'PBKDF2' },
//       false,
//       ['deriveKey']
//   );

//   return window.crypto.subtle.deriveKey(
//       {
//           name: 'PBKDF2',
//           salt: new TextEncoder().encode('unique-salt'), // Replace with a fixed unique salt
//           iterations: 100000,
//           hash: 'SHA-256'
//       },
//       keyMaterial,
//       { name: 'AES-GCM', length: 256 },
//       false,
//       ['encrypt', 'decrypt']
//   );
// }

// export async function encryptToken(data) {
//   const key = await getKey();
//   const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
//   const encrypted = await window.crypto.subtle.encrypt(
//       { name: 'AES-GCM', iv },
//       key,
//       new TextEncoder().encode(data)
//   );

//   // Combine IV and encrypted data, then encode in base64
//   const combined = new Uint8Array(iv.length + encrypted.byteLength);
//   combined.set(iv);
//   combined.set(new Uint8Array(encrypted), iv.length);

//   return btoa(String.fromCharCode(...combined));
// }

// export async function decryptToken(encryptedData) {
//   const key = await getKey();
//   const combined = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));

//   const iv = combined.slice(0, 12); // Extract IV
//   const encrypted = combined.slice(12); // Extract encrypted data

//   const decrypted = await window.crypto.subtle.decrypt(
//       { name: 'AES-GCM', iv },
//       key,
//       encrypted
//   );

//   return new TextDecoder().decode(decrypted);
// }


export async function accountRequest(endpoint, body, signal) {
  let response;
  try {
    response = await fetch(getApiUrl(`account/${endpoint}`), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('We couldn’t connect. Check your connection and try again.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const values = Object.values(data?.errors || {}).flat();
    const message = [data?.message, data?.detail, data?.error, ...values].find(value => typeof value === 'string');
    const error = new Error(message || 'We couldn’t complete that request. Please try again.');
    error.status = response.status;
    throw error;
  }
  return data;
}
