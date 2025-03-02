import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { TWITTER_CONFIG } from '@/lib/Client/config/twitter';

/**
 * API route to handle Twitter OAuth callback
 * This exchanges the authorization code for an access token
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, codeVerifier } = req.body;

    if (!code || !codeVerifier) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      TWITTER_CONFIG.TOKEN_URL,
      new URLSearchParams({
        client_id: TWITTER_CONFIG.CLIENT_ID,
        client_secret: TWITTER_CONFIG.CLIENT_SECRET,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: TWITTER_CONFIG.CALLBACK_URL,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Get the user's profile information
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url',
      },
    });

    const userData = userResponse.data.data;

    // Create a session for the user
    // In a real application, you would store this in your database
    const session = {
      provider: 'twitter',
      userId: userData.id,
      walletAddress: `twitter:${userData.id}`, // Use a TwitterID as wallet address
      username: userData.username,
      name: userData.name,
      profileImage: userData.profile_image_url,
      accessToken: access_token, // You might want to encrypt this
      refreshToken: refresh_token, // You might want to encrypt this
    };

    // Return the session to the client
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Twitter callback error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 