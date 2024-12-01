import React, { useState, useEffect } from "react";
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
  TablePagination,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import {
  getPatients,
  deletePatient,
  addPatient,
  updatePatient,
} from "../services/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "PATIENT_ID",
    order: "asc",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    PATIENT_ID: "",
    FIRST_NAME: "",
    LAST_NAME: "",
    BDAY: "",
    GENDER: "",
    ADDRESS: "",
    PHONE_NUMBER: "",
    ALLERGIES: "",
    MEDICAL_HISTORY: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await getPatients();
        console.log("API Response:", response.data); // Debug log
        const rows = response.data; // No need to use `response.data.result?.rows` since response is already an array
        setPatients(rows);
        setFilteredPatients(rows);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setSnackbar({
          open: true,
          message: "Error fetching patients.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleSort = (key) => {
    const order =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    const sortedData = [...filteredPatients].sort((a, b) => {
      if (typeof a[key] === "string") {
        return order === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return order === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setFilteredPatients(sortedData);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
    const query = event.target.value.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.FIRST_NAME.toLowerCase().includes(query) ||
        patient.LAST_NAME.toLowerCase().includes(query) ||
        (patient.ADDRESS && patient.ADDRESS.toLowerCase().includes(query)) ||
        (patient.PHONE_NUMBER && patient.PHONE_NUMBER.includes(query))
    );
    setFilteredPatients(filtered);
    setPage(0); // Reset pagination to the first page
  };

  const handleSelectPatient = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id)
        ? prev.filter((patientId) => patientId !== id)
        : [...prev, id]
    );
  };

  const formatDateForBackend = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
  };

  const handleSavePatient = async () => {
    try {
      const payload = {
        PATIENT_ID: newPatient.PATIENT_ID,
        first_name: newPatient.FIRST_NAME,
        last_name: newPatient.LAST_NAME,
        bday: newPatient.BDAY,
        gender: newPatient.GENDER,
        address: newPatient.ADDRESS,
        phone_number: newPatient.PHONE_NUMBER,
        allergies: newPatient.ALLERGIES,
        medical_history: newPatient.MEDICAL_HISTORY,
      };

      console.log("Payload for Update/Add:", payload);

      if (isEditing) {
        await updatePatient(newPatient.PATIENT_ID, payload);
      } else {
        await addPatient(payload);
      }

      setDialogOpen(false);
      const response = await getPatients();
      setPatients(response.data);
      setFilteredPatients(response.data);
      setNewPatient({
        PATIENT_ID: "",
        FIRST_NAME: "",
        LAST_NAME: "",
        BDAY: "",
        GENDER: "",
        ADDRESS: "",
        PHONE_NUMBER: "",
        ALLERGIES: "",
        MEDICAL_HISTORY: "",
      });
    } catch (error) {
      console.error("Error saving patient:", error);
      setSnackbar({
        open: true,
        message: "Error saving patient.",
        severity: "error",
      });
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedPatients.map((id) => deletePatient(id)));
      setSnackbar({
        open: true,
        message: "Selected patients deleted successfully.",
        severity: "success",
      });
      const updatedPatients = patients.filter(
        (patient) => !selectedPatients.includes(patient.PATIENT_ID)
      );
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      setSelectedPatients([]);
    } catch (error) {
      console.error("Error deleting selected patients:", error);
      setSnackbar({
        open: true,
        message: "Error deleting selected patients.",
        severity: "error",
      });
    }
  };

  const handleOpenEditDialog = (patient) => {
    setIsEditing(true);
    setNewPatient({
      PATIENT_ID: patient.PATIENT_ID,
      FIRST_NAME: patient.FIRST_NAME,
      LAST_NAME: patient.LAST_NAME,
      BDAY: patient.BDAY ? patient.BDAY.split("T")[0] : "",
      GENDER: patient.GENDER,
      ADDRESS: patient.ADDRESS,
      PHONE_NUMBER: patient.PHONE_NUMBER,
      ALLERGIES: patient.ALLERGIES,
      MEDICAL_HISTORY: patient.MEDICAL_HISTORY,
    });
    setDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setNewPatient({
      PATIENT_ID: "",
      FIRST_NAME: "",
      LAST_NAME: "",
      BDAY: "",
      GENDER: "",
      ADDRESS: "",
      PHONE_NUMBER: "",
      ALLERGIES: "",
      MEDICAL_HISTORY: "",
    });
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h4" gutterBottom>
        Patients
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Search by Name, Address, or Phone"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 600, overflowX: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          selectedPatients.length === filteredPatients.length
                        }
                        onChange={(e) =>
                          setSelectedPatients(
                            e.target.checked
                              ? filteredPatients.map(
                                  (patient) => patient.PATIENT_ID
                                )
                              : []
                          )
                        }
                      />
                    }
                    label="Select all"
                  />
                </TableCell>
                {[
                  { key: "PATIENT_ID", label: "Patient ID", sortable: true },
                  { key: "FIRST_NAME", label: "First Name", sortable: true },
                  { key: "LAST_NAME", label: "Last Name", sortable: true },
                  { key: "BDAY", label: "Birthday", sortable: true },
                  { key: "GENDER", label: "Gender", sortable: false },
                  { key: "ADDRESS", label: "Address", sortable: false },
                  {
                    key: "PHONE_NUMBER",
                    label: "Phone Number",
                    sortable: false,
                  },
                  { key: "ALLERGIES", label: "Allergies", sortable: false }, 
                  { key: "MEDICAL_HISTORY", label: "Medical History", sortable: false },
                ].map((column) => (
                  <TableCell key={column.key}>
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortConfig.key === column.key}
                        direction={
                          sortConfig.key === column.key
                            ? sortConfig.order
                            : "asc"
                        }
                        onClick={() => handleSort(column.key)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredPatients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient) => (
                  <TableRow key={patient.PATIENT_ID}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPatients.includes(patient.PATIENT_ID)}
                        onChange={() => handleSelectPatient(patient.PATIENT_ID)}
                      />
                    </TableCell>
                    <TableCell>{patient.PATIENT_ID}</TableCell>
                    <TableCell>{patient.FIRST_NAME}</TableCell>
                    <TableCell>{patient.LAST_NAME}</TableCell>
                    <TableCell>{formatDate(patient.BDAY)}</TableCell>
                    <TableCell>{patient.GENDER}</TableCell>
                    <TableCell>{patient.ADDRESS}</TableCell>
                    <TableCell>{patient.PHONE_NUMBER}</TableCell>
                    <TableCell>{patient.ALLERGIES || "None"}</TableCell>
                    <TableCell>{patient.MEDICAL_HISTORY || "None"}</TableCell> 
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenEditDialog(patient)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        component="div"
        count={filteredPatients.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[5, 10, 15]}
      />
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddDialog}
        >
          Add Patient
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteSelected}
          disabled={selectedPatients.length === 0}
        >
          Delete Selected
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{isEditing ? "Edit Patient" : "Add Patient"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Patient ID"
              variant="outlined"
              fullWidth
              value={newPatient.PATIENT_ID}
              disabled={isEditing} // Disable during editing
              onChange={(e) =>
                setNewPatient({ ...newPatient, PATIENT_ID: e.target.value })
              }
            />
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              value={newPatient.FIRST_NAME}
              onChange={(e) =>
                setNewPatient({ ...newPatient, FIRST_NAME: e.target.value })
              }
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              value={newPatient.LAST_NAME}
              onChange={(e) =>
                setNewPatient({ ...newPatient, LAST_NAME: e.target.value })
              }
            />
            <TextField
              label="Birthday"
              type="date"
              variant="outlined"
              fullWidth
              value={newPatient.BDAY}
              onChange={(e) =>
                setNewPatient({ ...newPatient, BDAY: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Gender"
              variant="outlined"
              fullWidth
              value={newPatient.GENDER}
              onChange={(e) =>
                setNewPatient({ ...newPatient, GENDER: e.target.value })
              }
            />
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              value={newPatient.ADDRESS}
              onChange={(e) =>
                setNewPatient({ ...newPatient, ADDRESS: e.target.value })
              }
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={newPatient.PHONE_NUMBER}
              onChange={(e) =>
                setNewPatient({ ...newPatient, PHONE_NUMBER: e.target.value })
              }
            />
            <TextField
              label="Allergies"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={newPatient.ALLERGIES}
              onChange={(e) =>
                setNewPatient({ ...newPatient, ALLERGIES: e.target.value })
              }
            />
            <TextField
              label="Medical History"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={newPatient.MEDICAL_HISTORY}
              onChange={(e) =>
                setNewPatient({
                  ...newPatient,
                  MEDICAL_HISTORY: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSavePatient} color="primary">
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients;
