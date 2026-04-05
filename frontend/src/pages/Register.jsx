import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/auth.css'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' }

    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 1) return { score, label: 'Very Weak', color: '#e53935' }
    if (score === 2) return { score, label: 'Weak', color: '#fb8c00' }
    if (score === 3) return { score, label: 'Fair', color: '#fdd835' }
    if (score === 4) return { score, label: 'Strong', color: '#43a047' }
    return { score, label: 'Very Strong', color: '#1b5e20' }
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

  const handleRegister = async () => {
    setError('')

    if (strength.score < 3) {
      setError('Please use a stronger password')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Registration failed')
        return
      }
      localStorage.setItem('token', data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Something went wrong')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister()
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🧠</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Start managing your life with AI</p>
        {error && <p className="error-msg">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
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
                    background: i <= strength.score ? strength.color : '#e0e0e0'
                  }}
                />
              ))}
            </div>
            <span
              className="strength-label"
              style={{ color: strength.color }}
            >
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

        <button
          onClick={handleRegister}
          disabled={!email || !password}
        >
          Register
        </button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register