import jwt from 'jsonwebtoken'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
  verified_email: boolean
}

/**
 * Verify Google ID token and extract user info
 * This uses Google's tokeninfo endpoint for simplicity
 * In production, use google-auth-library for better performance
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  )

  if (!response.ok) {
    throw new Error('Invalid Google token')
  }

  const data = await response.json() as any

  // Verify the token is for our app
  if (data.aud !== GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID) {
    throw new Error('Token not meant for this application')
  }

  return {
    id: data.sub,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    picture: data.picture,
    verified_email: data.email_verified === 'true',
  }
}

/**
 * Exchange authorization code for tokens (for web OAuth flow)
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  id_token: string
  refresh_token?: string
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: 'postmessage', // For web client-side flow
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }

  return response.json() as Promise<any>
}

/**
 * Generate JWT token for our app
 */
export function generateAppToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
