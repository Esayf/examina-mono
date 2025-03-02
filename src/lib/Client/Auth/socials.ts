import axios from 'axios';
import RequestBase from "@/lib/Client/RequestBase";
import { TWITTER_CONFIG } from '../config/twitter';

interface TwitterAuthResponse {
  authUrl: string;
  state: string;
}

/**
 * Initiates the Twitter OAuth flow by requesting an authorization URL from the backend
 * @returns {Promise<string>} The Twitter authorization URL to redirect the user to
 */
export async function twitterLogin(): Promise<string> {
  try {
    // Create a unique state parameter for CSRF protection
    const state = generateRandomString(32);
    localStorage.setItem('twitter_oauth_state', state);

    // Generate a random code verifier for PKCE (Proof Key for Code Exchange)
    const codeVerifier = generateRandomString(64);
    localStorage.setItem('twitter_code_verifier', codeVerifier);

    // Generate a code challenge from the code verifier using SHA256 hash
    const codeChallenge = await createCodeChallenge(codeVerifier);

    // Construct Twitter OAuth URL with required parameters
    const authUrl = new URL(TWITTER_CONFIG.AUTH_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', TWITTER_CONFIG.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', TWITTER_CONFIG.CALLBACK_URL);
    authUrl.searchParams.append('scope', TWITTER_CONFIG.SCOPES.join(' '));
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    return authUrl.toString();
  } catch (error) {
    console.error('Error initiating Twitter login:', error);
    throw error;
  }
}

/**
 * Handles the Twitter OAuth callback by exchanging the code for a token
 * @param {string} code - The authorization code returned by Twitter
 * @param {string} state - The state parameter for CSRF protection
 * @returns {Promise<any>} User session data after successful authentication
 */
export async function handleTwitterCallback(code: string, state: string): Promise<any> {
  try {
    // Verify the state parameter matches what we stored
    const storedState = localStorage.getItem('twitter_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Get the code verifier that was stored during the initial request
    const codeVerifier = localStorage.getItem('twitter_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Clear the stored state and code verifier
    localStorage.removeItem('twitter_oauth_state');
    localStorage.removeItem('twitter_code_verifier');

    // Create an instance of the RequestBase for the API call to your backend
    const requestBase = new RequestBase();

    // Exchange the code for a token with your backend
    const response = await requestBase.post('/auth/twitter/callback', {
      code,
      state,
      codeVerifier
    });

    return response.data;
  } catch (error) {
    console.error('Error handling Twitter callback:', error);
    throw error;
  }
}

/**
 * Generates a random string of the specified length
 * Used for state parameter and code verifier
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

/**
 * Creates a code challenge for PKCE using SHA-256
 */
async function createCodeChallenge(codeVerifier: string): Promise<string> {
  // Convert code verifier to array buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  // Hash the code verifier using SHA-256
  const hash = await crypto.subtle.digest('SHA-256', data);

  // Convert hash to base64url string
  return base64URLEncode(hash);
}

/**
 * Base64URL encoding for code challenge
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
} 