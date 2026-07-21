// Auth
export { default as HomePage         } from "./auth/HomePage";
export { default as LoginPage        } from "./auth/LoginPage";
export { default as RegisterPatient  } from "./auth/RegisterPatient";
export { default as RegisterDoctor   } from "./auth/RegisterDoctor";

// Patient
export { default as DashboardPatient  } from "./patient/DashboardPatient";
export { default as AppointmentsList  } from "./patient/AppointmentsList";
export { default as BookAppointment   } from "./patient/BookAppointment";
export { default as Payment           } from "./patient/Payment";
export { default as MedicalRecord     } from "./patient/MedicalRecord";
export { default as Messaging         } from "./patient/Messaging";
export { default as TeleconsultPatient} from "./patient/TeleconsultPatient";
export { default as BluetoothConnect } from "./patient/BluetoothConnect";

// Doctor
export { default as DashboardDoctor   } from "./doctor/DashboardDoctor";
export { default as ManageSlots       } from "./doctor/ManageSlots";
export { default as DoctorAppointments} from "./doctor/DoctorAppointments";
export { default as TeleconsultDoctor } from "./doctor/TeleconsultDoctor";

// Admin
export { default as AdminDashboard    } from "./admin/AdminDashboard";
export { default as AdminDoctors      } from "./admin/AdminDoctors";
export { default as AdminPatients     } from "./admin/AdminPatients";
export { default as AdminSpecialties  } from "./admin/AdminSpecialties";
export { default as AdminChronic      } from "./admin/AdminChronic";
export { default as AdminRegions      } from "./admin/AdminRegions";
