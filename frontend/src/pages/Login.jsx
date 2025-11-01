import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    function handleChange(e){
        // console.log(e.target.name);
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        console.log(form);
        
        
        axios.post("https://chatgpt-clone-qz1s.onrender.com/auth/login", {
            email: form.email,
            password: form.password
        },
        {
            withCredentials: true
        }).
        then((res) => {
            console.log("Axios Response : ",res);
            try {
                const user = res?.data?.user || {
                    firstName: res?.data?.firstName || 'User',
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
            <h1 className="heading">Welcome back</h1>
            <form className="form" onSubmit={handleSubmit}>
            <div className="field">
                <label htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="field">
                <label htmlFor="password">Password</label>
                <input className="input" id="password" name="password" type="password" onChange={handleChange}  placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <div className="subtle">
                <span>New here?</span>
                <Link className="link" to="/register">Create an account</Link>
            </div>
            </form>
        </div>
        </div>
        </div>
    )
}

export default Login
