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
import AddVisa from './components/Admin/AddVisa'
import Visa from './components/Visa/Visa'
import ApprovedAgent from './components/Admin/ApprovedAdmin'
import AllAgent from './components/Admin/AllAgent'
import VisaApplication from './components/Visa/VisaApplication'
import VisaPayment from './components/Visa/VisaPayment'
import VisaAppAgent from './components/Visa/VisaAppAgent'
import VisaList from './components/Admin/VisaList'
import TrackVisa from './components/Visa/TrackVisa'
import VisaStatus from './components/Visa/VisaStatus'
import ApprovedVisa from './components/Visa/ApprovedVisa'
import PendingVisa from './components/Visa/PendingVisa'
import DeniedVisa from './components/Visa/DeniedVisa'
import PaidVisa from './components/Visa/PaidVisa'
import NotPaidVisa from './components/Visa/NotPaidVisa'
import Flight from './components/Flight/Flight'
import Hotel from './components/Hotel/Hotel'
import Esim from './components/Esim/Home'
import Embassy from './components/Embassy/Home'
import Insurance from './components/Insurance/Home'
import Itinerary from './components/Itinerary/Home'
import Permit from './components/Permit/Permit'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/e-visa' element={<Visa />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/update-profile' element={<UpdateAgentDetails />} />
        <Route path='/upload-profile' element={<ProfileUpload />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/register' element={<AdminRegister />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/add_visa' element={<AddVisa />} />
        <Route path='/agent-status' element={<AllAgent />} />
        <Route path='/update-agent-status' element={<AdminApproveAgents />} />
        <Route path='/approved-agent' element={<ApprovedAgent />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/admin/visa-list' element={<VisaList />} />
        <Route path='/visa/:id' element={<VisaApplication />} />
        <Route path='/visa-agent/:id' element={<VisaAppAgent />} />
        <Route path='/payment' element={<VisaPayment />} />
        <Route path='/visa-status/:id' element={<VisaStatus />} />
        <Route path='/track-visa' element={<TrackVisa />} />
        <Route path='/approved-visa' element={<ApprovedVisa />} />
        <Route path='/pending-visa' element={<PendingVisa />} />
        <Route path='/denied-visa' element={<DeniedVisa />} />
        <Route path='/paid-visa' element={<PaidVisa />} />
        <Route path='/not-paid-visa' element={<NotPaidVisa />} />
        <Route path='/flight' element={<Flight />} />
        <Route path='/hotel' element={<Hotel />} />
        <Route path='/e-sim' element={<Esim />} />
        <Route path='/permit' element={<Permit />} />
        <Route path='/embassy' element={<Embassy />} />
        <Route path='/insurance' element={<Insurance />} />
        <Route path='/travel-itinerary' element={<Itinerary />} />
      </Routes>
    </Router>
  )
}

export default App