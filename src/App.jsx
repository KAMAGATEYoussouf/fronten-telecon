import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import AuthService from "./services/AuthService";
import {
  HomePage, LoginPage, RegisterPatient, RegisterDoctor,
  DashboardPatient, AppointmentsList, BookAppointment,
  Payment, MedicalRecord, Messaging, TeleconsultPatient,
  DashboardDoctor, ManageSlots, DoctorAppointments, TeleconsultDoctor,
  AdminDashboard, AdminDoctors, AdminPatients,
  AdminSpecialties, AdminChronic, AdminRegions, BluetoothConnect,
} from "./pages";

const PAGES_PROTEGEES = [
  "medical-record", "appointments", "book-appointment",
  "messaging", "payment", "dashboard-patient",
  "dashboard-doctor", "manage-slots", "doctor-appointments",
  "teleconsult-patient", "teleconsult-doctor",
];

function Router() {
  const [page,        setPage]        = useState("home");
  const [params,      setParams]      = useState({});
  const [pendingPage, setPendingPage] = useState(null); // page en attente avant login

  const go = (p, p2 = {}) => {
    // ✅ Si page protégée et non connecté → sauvegarder et aller au login
    if (PAGES_PROTEGEES.includes(p) && !AuthService.isAuthenticated()) {
      setPendingPage(p);
      setPage("login");
      setParams({});
      window.scrollTo(0, 0);
      return;
    }
    setPage(p);
    setParams(p2);
    window.scrollTo(0, 0);
  };

  const routes = {
    "home":                <HomePage           onNavigate={go} />,
    "login":               <LoginPage          onNavigate={go} />,
    "register-patient":    <RegisterPatient    onNavigate={go} />,
    "register-doctor":     <RegisterDoctor     onNavigate={go} />,
    "dashboard-patient":   <DashboardPatient   onNavigate={go} />,
    "appointments":        <AppointmentsList   onNavigate={go} />,
    "book-appointment":    <BookAppointment    onNavigate={go} rdvId={params.rdvId} />,
    "payment":             <Payment            onNavigate={go} />,
    "medical-record":      <MedicalRecord      onNavigate={go} />,
    "messaging":           <Messaging          onNavigate={go} />,
    "teleconsult-patient": <TeleconsultPatient onNavigate={go} rdvId={params.rdvId} />,
    "dashboard-doctor":    <DashboardDoctor    onNavigate={go} />,
    "manage-slots":        <ManageSlots        onNavigate={go} />,
    "doctor-appointments": <DoctorAppointments onNavigate={go} />,
    "teleconsult-doctor":  <TeleconsultDoctor  onNavigate={go} rdvId={params.rdvId} />,
    "admin-dashboard":     <AdminDashboard     onNavigate={go} />,
    "admin-doctors":       <AdminDoctors       onNavigate={go} />,
    "admin-patients":      <AdminPatients      onNavigate={go} />,
    "admin-specialties":   <AdminSpecialties   onNavigate={go} />,
    "admin-chronic":       <AdminChronic       onNavigate={go} />,
    "admin-regions":       <AdminRegions       onNavigate={go} />,
    "bluetooth-connect": <BluetoothConnect onNavigate={go} />,
  
  };

  return (
    <AuthProvider
      onNavigate={go}
      pendingPage={pendingPage}
      onClearPending={() => setPendingPage(null)}
    >
      {routes[page] ?? <HomePage onNavigate={go} />}
    </AuthProvider>
  );
}

export default function App() {
  return <Router />;
}