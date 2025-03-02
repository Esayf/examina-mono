/**
 * Twitter OAuth Configuration
 * 
 * You'll need to:
 * 1. Create a Twitter Developer Account: https://developer.twitter.com/
 * 2. Create a Project and App in the Twitter Developer Portal
 * 3. Configure your app with the callback URL: https://yourdomain.com/auth/twitter-callback
 * 4. Generate API Key and Secret
 * 5. Update these values with your actual credentials
 */
export const TWITTER_CONFIG = {
  // Your Twitter API credentials (Replace these with actual values)
  CLIENT_ID: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || 'YOUR_TWITTER_CLIENT_ID',
  CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET || 'YOUR_TWITTER_CLIENT_SECRET',

  // The callback URL registered with Twitter (must match your Twitter app settings)
  CALLBACK_URL: process.env.NEXT_PUBLIC_BASE_URL ?
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/twitter-callback` :
    'http://localhost:3000/auth/twitter-callback',

  // OAuth endpoints
  AUTH_URL: 'https://twitter.com/i/oauth2/authorize',
  TOKEN_URL: 'https://api.twitter.com/2/oauth2/token',

  // Scopes define what information your app can access
  // For basic authentication, we just need these scopes
  SCOPES: ['tweet.read', 'users.read'],
}; 