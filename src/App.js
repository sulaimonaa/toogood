import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home/Home'
import Login from './components/Login'
import Register from './components/Register'
import ResetPassword from './components/ResetPassword'
import Dashboard from './components/Dashboard'
import "bootstrap/dist/css/bootstrap.min.css";
import UpdateAgentDetails from './components/Agent/UpdateAgentDetails'
import AdminApproveAgents from './components/Admin/AdminApproveAgent'
import AdminLogin from './components/Admin/AdminLogin'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminRegister from './components/Admin/AdminRegister'
import ProfileUpload from './components/ProfileUpload'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/update-profile' element={<UpdateAgentDetails />} />
        <Route path='/upload-profile' element={<ProfileUpload />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/register' element={<AdminRegister />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/update-agent-status' element={<AdminApproveAgents />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App