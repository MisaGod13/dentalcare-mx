import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientNew from './pages/PatientNew'
import PatientDetail from './pages/PatientDetail'
import PatientView from './pages/PatientView'
import PatientEdit from './pages/PatientEdit'
import Agenda from './pages/Agenda'
//import HistoryForm from './pages/HistoryForm'
import AIReport from './pages/AIReport'
import ChatAssistant from './pages/ChatAssistant'
import Settings from './pages/Settings'
import PatientDashboard from './pages/PatientDashboard'
import PatientDashboardSimple from './pages/PatientDashboardSimple'
import PatientChat from './pages/PatientChat'
import PatientAgenda from './pages/PatientAgenda'
import PatientSchedule from './pages/PatientSchedule'
import PatientProfile from './pages/PatientProfile'
import PatientReports from './pages/PatientReports'
import MedicalReports from './pages/MedicalReports'
import PatientAccountManager from './components/PatientAccountManager'
import PatientLogin from './pages/PatientLogin'
import RouteGuard from './components/RouteGuard'

export default function App(){
  return (<Routes>
    <Route path="/login" element={<Login/>} />
    <Route path="/register" element={<Register/>} />
    <Route path="/patient-login" element={<PatientLogin/>} />
    
    {/* Rutas protegidas para dentistas */}
    <Route path="/" element={<RouteGuard requireRole="dentist"><Dashboard/></RouteGuard>} />
    <Route path="/dashboard" element={<RouteGuard requireRole="dentist"><Dashboard/></RouteGuard>} />
    <Route path="/patients" element={<RouteGuard requireRole="dentist"><Patients/></RouteGuard>} />
    <Route path="/patients/new" element={<RouteGuard requireRole="dentist"><PatientNew/></RouteGuard>} />
    <Route path="/patients/:id" element={<RouteGuard requireRole="dentist"><PatientDetail/></RouteGuard>} />
    <Route path="/patients/:id/view" element={<RouteGuard requireRole="dentist"><PatientView/></RouteGuard>} />
    <Route path="/patients/:id/edit" element={<RouteGuard requireRole="dentist"><PatientEdit/></RouteGuard>} />
    <Route path="/agenda" element={<RouteGuard requireRole="dentist"><Agenda/></RouteGuard>} />
    <Route path="/medical-reports" element={<RouteGuard requireRole="dentist"><MedicalReports/></RouteGuard>} />
    <Route path="/ai-report/:id" element={<RouteGuard requireRole="dentist"><AIReport/></RouteGuard>} />
    <Route path="/chat" element={<RouteGuard requireRole="dentist"><ChatAssistant/></RouteGuard>} />
    <Route path="/settings" element={<RouteGuard requireRole="dentist"><Settings/></RouteGuard>} />
    
    {/* Rutas para gestión de cuentas de pacientes (solo dentistas) */}
    <Route path="/patient-accounts" element={<RouteGuard requireRole="dentist"><PatientAccountManager/></RouteGuard>} />
    
    {/* Rutas para pacientes */}
    <Route path="/patient-dashboard" element={<RouteGuard requireRole="patient"><PatientDashboardSimple/></RouteGuard>} />
    <Route path="/patient-chat" element={<RouteGuard requireRole="patient"><PatientChat/></RouteGuard>} />
    <Route path="/patient-agenda" element={<RouteGuard requireRole="patient"><PatientAgenda/></RouteGuard>} />
    <Route path="/patient-schedule" element={<RouteGuard requireRole="patient"><PatientSchedule/></RouteGuard>} />
    <Route path="/patient-profile" element={<RouteGuard requireRole="patient"><PatientProfile/></RouteGuard>} />
    <Route path="/patient-reports" element={<RouteGuard requireRole="patient"><PatientReports/></RouteGuard>} />

    <Route path="*" element={<Navigate to='/'/>}/>
  </Routes>)
}