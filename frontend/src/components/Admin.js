import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  getDoctors,
  addDoctor,
  deleteDoctor,
  getEmployees,
  addEmployee,
  deleteEmployee,
} from "../services/api"; // Import API functions

const AdminPage = () => {
  // State for doctors and employees
  const [doctors, setDoctors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Sort configuration
  const [sortConfig, setSortConfig] = useState({
    key: "first_name",
    order: "asc",
  });

  const handleLogout = () => {
    navigate("/"); // Redirect to login or home page
  };

  // New entry state for doctors/employees
  const [newDoctor, setNewDoctor] = useState({
    doctor_id: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });

  const [newEmployee, setNewEmployee] = useState({
    employee_id: "", // Added employee_id field
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [doctorsResponse, employeesResponse] = await Promise.all([
          getDoctors(),
          getEmployees(),
        ]);
        console.log("Doctors Data:", doctorsResponse.data);
        console.log("Employees Data:", employeesResponse.data);

        // Update the data assignment logic
        setDoctors(doctorsResponse.data); // Ensure this matches the API structure
        setEmployees(employeesResponse.data.result.rows); // Extract the rows array
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sort handler
  const handleSort = (key, dataType) => {
    const order =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    const sortFn = (a, b) => {
      if (typeof a[key] === "string") {
        return order === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return order === "asc" ? a[key] - b[key] : b[key] - a[key];
    };

    if (dataType === "doctors") {
      setDoctors([...doctors].sort(sortFn));
    } else if (dataType === "employees") {
      setEmployees([...employees].sort(sortFn));
    }
  };

  const handleAddDoctor = async () => {
    if (
      !newDoctor.first_name ||
      !newDoctor.last_name ||
      !newDoctor.phone_number ||
      !newDoctor.email
    ) {
      alert("Please fill out all fields for the doctor.");
      return;
    }
    try {
      await addDoctor(newDoctor); // Add the doctor to the database

      // Reset the input fields
      setNewDoctor({
        doctor_id: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
      });

      // Re-fetch the doctors list to refresh the table
      const response = await getDoctors();

      // Adjusted logic to handle the correct API response format
      if (Array.isArray(response.data)) {
        setDoctors(response.data); // Directly update the doctors state with the array
      } else {
        console.error("Unexpected API response format for doctors:", response);
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  // Add employee
  const handleAddEmployee = async () => {
    if (
      !newEmployee.employee_id || // Ensure employee_id is validated
      !newEmployee.first_name ||
      !newEmployee.last_name ||
      !newEmployee.phone_number
    ) {
      alert("Please fill out all fields for the employee.");
      return;
    }
    try {
      await addEmployee(newEmployee); // Add the employee to the database

      // Reset the input fields
      setNewEmployee({
        employee_id: "",
        first_name: "",
        last_name: "",
        phone_number: "",
      });

      // Re-fetch the employees list to refresh the table
      const response = await getEmployees();
      setEmployees(response.data.result.rows); // Extract rows for the table
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  // Delete entry
  const handleDelete = async (id, dataType) => {
    try {
      if (dataType === "doctors") {
        await deleteDoctor(id);
        setDoctors(doctors.filter((doctor) => doctor.DOCTOR_ID !== id));
      } else if (dataType === "employees") {
        await deleteEmployee(id);
        setEmployees(
          employees.filter((employee) => employee.EMPLOYEE_ID !== id)
        );
      }
    } catch (error) {
      console.error(`Error deleting ${dataType}:`, error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
        <Button
          variant="contained"
          color="error"
          sx={{
            backgroundColor: "red",
            color: "white",
            "&:hover": {
              backgroundColor: "darkred",
            },
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      {/* Doctors Table */}
      <Typography variant="h5" sx={{ mt: 3 }}>
        Doctors
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Doctor ID"
          variant="outlined"
          value={newDoctor.doctor_id}
          onChange={(e) =>
            setNewDoctor({ ...newDoctor, doctor_id: e.target.value })
          }
        />

        <TextField
          label="First Name"
          variant="outlined"
          value={newDoctor.first_name}
          onChange={(e) =>
            setNewDoctor({ ...newDoctor, first_name: e.target.value })
          }
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={newDoctor.last_name}
          onChange={(e) =>
            setNewDoctor({ ...newDoctor, last_name: e.target.value })
          }
        />
        <TextField
          label="Phone"
          variant="outlined"
          value={newDoctor.phone_number}
          onChange={(e) =>
            setNewDoctor({ ...newDoctor, phone_number: e.target.value })
          }
        />
        <TextField
          label="Email"
          variant="outlined"
          value={newDoctor.email}
          onChange={(e) =>
            setNewDoctor({ ...newDoctor, email: e.target.value })
          }
        />
        <Button variant="contained" onClick={handleAddDoctor} color="primary">
          Add Doctor
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "first_name"}
                  direction={sortConfig.order}
                  onClick={() => handleSort("first_name", "doctors")}
                >
                  First Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.DOCTOR_ID}>
                <TableCell>{doctor.FIRST_NAME}</TableCell>
                <TableCell>{doctor.LAST_NAME}</TableCell>
                <TableCell>{doctor.PHONE_NUMBER}</TableCell>
                <TableCell>{doctor.EMAIL}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(doctor.DOCTOR_ID, "doctors")}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Employees Table */}
      <Typography variant="h5" sx={{ mt: 3 }}>
        Employees (Pharmacists)
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Employee ID"
          variant="outlined"
          value={newEmployee.employee_id}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, employee_id: e.target.value })
          }
        />

        <TextField
          label="First Name"
          variant="outlined"
          value={newEmployee.first_name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, first_name: e.target.value })
          }
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={newEmployee.last_name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, last_name: e.target.value })
          }
        />
        <TextField
          label="Phone"
          variant="outlined"
          value={newEmployee.phone_number}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, phone_number: e.target.value })
          }
        />
        <Button variant="contained" onClick={handleAddEmployee} color="primary">
          Add Employee
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "first_name"}
                  direction={sortConfig.order}
                  onClick={() => handleSort("first_name", "employees")}
                >
                  First Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Employee ID</TableCell>

              <TableCell>Last Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.EMPLOYEE_ID}>
                <TableCell>{employee.EMPLOYEE_ID}</TableCell>

                <TableCell>{employee.FIRST_NAME}</TableCell>
                <TableCell>{employee.LAST_NAME}</TableCell>
                <TableCell>{employee.PHONE_NUMBER}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      handleDelete(employee.EMPLOYEE_ID, "employees")
                    }
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default AdminPage;
