import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

interface GoogleSignInProps {
  onError?: (error: string) => void
}

function GoogleSignInButton({ onError }: GoogleSignInProps) {
  const { googleLogin } = useAuthStore()
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential)
      navigate('/dashboard')
    } catch (error: any) {
      onError?.(error.message || 'Google login failed')
    }
  }

  const handleError = () => {
    onError?.('Google login was cancelled or failed')
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
      theme="filled_blue"
      size="large"
      width="100%"
      text="signin_with"
      shape="rectangular"
    />
  )
}

export default function GoogleSignIn({ onError }: GoogleSignInProps) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleSignInButton onError={onError} />
    </GoogleOAuthProvider>
  )
}
