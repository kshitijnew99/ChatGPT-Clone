import React, { useState } from 'react'
import { Link , useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    
    const res = await axios.post(
        'http://localhost:3000/auth/register',
        {
          fullName: {
            firstName: form.firstName,
            lastName: form.lastName,
          },
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
    ).
    then((res) => {
      console.log("Axios Response : ",res);
      try {
        const user = res?.data?.user || {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
        }
        localStorage.setItem('user', JSON.stringify(user))
      } catch (_) {}
      navigate("/");
    }).catch((err) => {
            console.log("Axios Error : ",err);
    }).finally(() => {
            setLoading(false);
    })
      
  }
  return (
    <div className="auth-layout">
      <div className="container" style={{paddingTop: 0, paddingBottom: 0}}>
      <div className="card">
        <h1 className="heading">Create your account</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input className="input" id="firstName" name="firstName" type="text" placeholder="First name" autoComplete="given-name" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input className="input" id="lastName" name="lastName" type="text" placeholder="Last name" autoComplete="family-name" value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="Create a password" autoComplete="new-password" value={form.password} onChange={handleChange} />
          </div>

          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>

          <div className="subtle">
            <span>Already have an account?</span>
            <Link className="link" to="/login">Login</Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}

export default Register
