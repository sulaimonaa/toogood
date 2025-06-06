import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home/Home'
import Login from './components/Login'
import Register from './components/Register'
import ResetPassword from './components/ResetPassword'
// import Dashboard from './components/Dashboard'
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
import PermitDashboard from './components/Permit/Dashboard'
import PermitApplication from './components/Permit/PermitApplication'
import CompletePermit from './components/Permit/CompletePermit'
import AddPermit from './components/Admin/AddPermit'
import PermitList from './components/Admin/PermitList'
import ApprovedPermit from './components/Permit/ApprovedPermit'
import PendingPermit from './components/Permit/PendingPermit'
import DeniedPermit from './components/Permit/DeniedPermit'
import PaidPermit from './components/Permit/PaidPermit'
import NotPaidPermit from './components/Permit/NotPaidPermit'
import PermitStatus from './components/Permit/PermitStatus'
import InsuranceStatus from './components/Insurance/InsuranceStatus'
import InsuranceList from './components/Admin/InsuranceList'
import VisaDestinations from './components/Admin/VisaDestinations'
import EditVisa from './components/Admin/EditVisa'
import PermitDestinations from './components/Admin/PermitDestinations'
import EditPermit from './components/Admin/EditPermit'
import PermitAgent from './components/Permit/PermitAgent'
import PermitAgentDB from './components/Permit/PermitAgentDB'
import Evisa from './components/Visa/Evisa'
import VisaResult from './components/Visa/Eresult'
import Epermit from './components/Permit/Epermit'
import PermitResult from './components/Permit/PermitResult'
import PermitADB from './components/Permit/PermitADB'
import PermitAR from './components/Permit/PermitAR'
import VisaADB from './components/Visa/VisaADB'
import VisaAR from './components/Visa/VisaAR'
import Dashboard2 from './components/Dashboard2'
import SuccessfulPayments from './components/SuccessfulPayments'
import CompleteInsurance from './components/Insurance/CompleteInsurance'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/e-visa' element={<Visa />} />
        <Route path='/evisa' element={<Evisa />} />
        <Route path='/results' element={<VisaResult />} />
        <Route path='/epermit' element={<Epermit />} />
        <Route path='/permit-results' element={<PermitResult />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/update-profile' element={<UpdateAgentDetails />} />
        <Route path='/upload-profile' element={<ProfileUpload />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/register' element={<AdminRegister />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/add_visa' element={<AddVisa />} />
        <Route path='/admin/add_permit' element={<AddPermit />} />
        <Route path='/agent-status' element={<AllAgent />} />
        <Route path='/update-agent-status' element={<AdminApproveAgents />} />
        <Route path='/approved-agent' element={<ApprovedAgent />} />
        <Route path='/dashboard' element={<Dashboard2 />} />
        <Route path='/admin/visa-list' element={<VisaList />} />
        <Route path='/admin/visa-destinations' element={<VisaDestinations />} />
        <Route path='/admin/permit' element={<PermitDestinations />} />
        <Route path='/admin/visa-destination-update/:id' element={<EditVisa />} />
        <Route path='/admin/permit-update/:id' element={<EditPermit />} />
        <Route path='/admin/permit-list' element={<PermitList />} />
        <Route path='/admin/insurance-list' element={<InsuranceList />} />
        <Route path='/visa/:id' element={<VisaApplication />} />
        <Route path='/permit/:id' element={<PermitApplication />} />
        <Route path='/permit-agent/:id' element={<PermitAgent />} />
        <Route path='/visa-agent/:id' element={<VisaAppAgent />} />
        <Route path='/payment' element={<VisaPayment />} />
        <Route path='/complete-permit' element={<CompletePermit />} />
        <Route path='/visa-status/:id' element={<VisaStatus />} />
        <Route path='/permit-status/:id' element={<PermitStatus />} />
        <Route path='/insurance-status/:id' element={<InsuranceStatus />} />
        <Route path='/track-visa' element={<TrackVisa />} />
        <Route path='/approved-visa' element={<ApprovedVisa />} />
        <Route path='/approved-permit' element={<ApprovedPermit />} />
        <Route path='/pending-visa' element={<PendingVisa />} />
        <Route path='/pending-permit' element={<PendingPermit />} />
        <Route path='/denied-visa' element={<DeniedVisa />} />
        <Route path='/denied-permit' element={<DeniedPermit />} />
        <Route path='/paid-visa' element={<PaidVisa />} />
        <Route path='/paid-permit' element={<PaidPermit />} />
        <Route path='/not-paid-visa' element={<NotPaidVisa />} />
        <Route path='/not-paid-permit' element={<NotPaidPermit />} />
        <Route path='/flight' element={<Flight />} />
        <Route path='/hotel' element={<Hotel />} />
        <Route path='/e-sim' element={<Esim />} />
        <Route path='/permit' element={<PermitDashboard />} />
        <Route path='/permit-agent' element={<PermitAgentDB />} />
        <Route path='/permit-agent-application' element={<PermitADB />} />
        <Route path='/permit-agent-results' element={<PermitAR />} />
        <Route path='/visa-agent-application' element={<VisaADB />} />
        <Route path='/visa-agent-results' element={<VisaAR />} />
        <Route path='/embassy' element={<Embassy />} />
        <Route path='/insurance' element={<Insurance />} />
        <Route path='/visa-support' element={<Itinerary />} />
        <Route path='/successful-payment' element={<SuccessfulPayments />} />
        <Route path='/complete-insurance' element={ <CompleteInsurance />} />
      </Routes>
    </Router>
  )
}

export default App