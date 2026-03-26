import { useState } from 'react'
import {Link,useNavigate} from 'react-router-dom'
import '../styles/auth.css'

function Register(){
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [error,setError] = useState('')
    const navigate = useNavigate()

    const handleRegister = async () => {
        setError('')
        try{
            const res = await fetch('http://localhost:8000/auth/register',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password})
            })
            const data = await res.json()
            if(!res.ok){
                setError(data.detail || 'Registration failed')
                return
            }
            localStorage.setItem('token',data.access_token)
            navigate('/dashboard')

        }catch (err){
            setError('somethign went wrong')

        }
    }

     return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <p className="error-msg">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register