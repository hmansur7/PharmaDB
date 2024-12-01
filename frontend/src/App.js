import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import EmployeePanel from "./components/Employee/EmployeePanel"; // Ensure the path is correct
import Login from "./components/login"; // Ensure the path is correct
import AdminPage from "./components/Admin"; // Ensure the path is correct
import DoctorPanel from "./components/Doctor/DoctorPanel"; // Ensure the path is correct

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Admin Panel */}
        <Route path="/admin/*" element={<AdminPage />} />

        {/* Doctor Panel */}
        <Route path="/doctor/*" element={<DoctorPanel />} />

        {/* Employee Panel */}
        <Route path="/employee/*" element={<EmployeePanel />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
