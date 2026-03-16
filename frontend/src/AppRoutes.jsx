import React from 'react'
import { BrowserRouter ,Routes ,Route } from "react-router-dom";
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

const AppRoutes = () => {
  return (
    <div>
        <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<Login />} />
            </Routes>
        </BrowserRouter>
    </div>
  )
}

export default AppRoutes