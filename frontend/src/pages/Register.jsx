import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/auth.css'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { score, label: 'Very Weak', color: '#ff4d6d' }
    if (score === 2) return { score, label: 'Weak', color: '#ffb347' }
    if (score === 3) return { score, label: 'Fair', color: '#fdd835' }
    if (score === 4) return { score, label: 'Strong', color: '#00d4aa' }
    return { score, label: 'Very Strong', color: '#00d4aa' }
  }

  const strength = getPasswordStrength(password)

  const getPasswordTips = (pwd) => {
    const tips = []
    if (pwd.length < 8) tips.push('At least 8 characters')
    if (!/[A-Z]/.test(pwd)) tips.push('One uppercase letter')
    if (!/[0-9]/.test(pwd)) tips.push('One number')
    if (!/[^A-Za-z0-9]/.test(pwd)) tips.push('One special character (!@#$...)')
    return tips
  }

  const tips = password ? getPasswordTips(password) : []

  const validate = () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name')
      return false
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return false
    }
    if (strength.score < 3) {
      setError('Please use a stronger password')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!agreed) {
      setError('Please agree to the terms and conditions')
      return false
    }
    return true
  }

  const handleRegister = async () => {
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email,
          password
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Registration failed')
        return
      }
      localStorage.setItem('token', data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Something went wrong — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister()
  }

  const passwordsMatch = confirmPassword && password === confirmPassword
  const passwordsMismatch = confirmPassword && password !== confirmPassword

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🧠</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Start managing your life with AI</p>

        {error && <p className="error-msg">⚠️ {error}</p>}

        <label className="input-label">Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label className="input-label">Email Address</label>
        <input
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label className="input-label">Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {password && (
          <div className="password-strength">
            <div className="strength-bar-container">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="strength-bar-segment"
                  style={{
                    background: i <= strength.score ? strength.color : 'var(--bg-3)'
                  }}
                />
              ))}
            </div>
            <span className="strength-label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}

        {tips.length > 0 && (
          <ul className="password-tips">
            {tips.map((tip, i) => (
              <li key={i}>✗ {tip}</li>
            ))}
          </ul>
        )}

        <label className="input-label">Confirm Password</label>
        <div className="password-wrapper">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              borderColor: passwordsMatch
                ? 'var(--success)'
                : passwordsMismatch
                ? 'var(--danger)'
                : undefined
            }}
          />
          <button
            className="toggle-password"
            onClick={() => setShowConfirm(!showConfirm)}
            type="button"
          >
            {showConfirm ? '🙈' : '👁️'}
          </button>
        </div>

        {passwordsMatch && (
          <p className="match-msg">✓ Passwords match</p>
        )}
        {passwordsMismatch && (
          <p className="mismatch-msg">✗ Passwords do not match</p>
        )}

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <span className="terms-link">Terms of Service</span> and <span className="terms-link">Privacy Policy</span>
          </label>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading || !fullName || !email || !password || !confirmPassword || !agreed}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register