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
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import { getPatientsWithPrescriptions } from "../../services/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
};

const PrescriptionsView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "PRESCRIPTION_ID",
    order: "asc",
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    patientName: "",
    doctorName: "",
    medicationName: "",
  });

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await getPatientsWithPrescriptions();
      console.log("Fetched Data:", response.data);
      setPrescriptions(response.data);
      setFilteredPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleSort = (key) => {
    const order =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    const sortedData = [...filteredPrescriptions].sort((a, b) => {
      if (typeof a[key] === "string") {
        return order === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      if (key === "DATE_OF_FILLING") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }
      return order === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setFilteredPrescriptions(sortedData);
  };

  const applyFilters = () => {
    let filtered = prescriptions;

    if (filters.patientName) {
      const lowerQuery = filters.patientName.toLowerCase();
      filtered = filtered.filter(
        (prescription) =>
          `${prescription.PATIENT_FIRST_NAME} ${prescription.PATIENT_LAST_NAME}`
            .toLowerCase()
            .includes(lowerQuery)
      );
    }

    if (filters.doctorName) {
      const lowerQuery = filters.doctorName.toLowerCase();
      filtered = filtered.filter(
        (prescription) =>
          `${prescription.DOCTOR_FIRST_NAME} ${prescription.DOCTOR_LAST_NAME}`
            .toLowerCase()
            .includes(lowerQuery)
      );
    }

    if (filters.medicationName) {
      const lowerQuery = filters.medicationName.toLowerCase();
      filtered = filtered.filter((prescription) =>
        prescription.MEDICATION_NAME.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const resetFilters = () => {
    setFilters({ patientName: "", doctorName: "", medicationName: "" });
    setFilteredPrescriptions(prescriptions);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h4" gutterBottom>
        Prescriptions with Details
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Patient Name"
          variant="outlined"
          value={filters.patientName}
          onChange={(e) =>
            setFilters({ ...filters, patientName: e.target.value })
          }
        />
        <TextField
          label="Doctor Name"
          variant="outlined"
          value={filters.doctorName}
          onChange={(e) =>
            setFilters({ ...filters, doctorName: e.target.value })
          }
        />
        <TextField
          label="Medication Name"
          variant="outlined"
          value={filters.medicationName}
          onChange={(e) =>
            setFilters({ ...filters, medicationName: e.target.value })
          }
        />
        <Button variant="contained" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button variant="outlined" color="secondary" onClick={resetFilters}>
          Reset Filters
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "PRESCRIPTION_ID"}
                      direction={sortConfig.order}
                      onClick={() => handleSort("PRESCRIPTION_ID")}
                    >
                      Prescription ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Medication Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Date of Filling</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((prescription) => (
                      <TableRow key={prescription.PRESCRIPTION_ID}>
                        <TableCell>{prescription.PRESCRIPTION_ID}</TableCell>
                        <TableCell>{`${prescription.PATIENT_FIRST_NAME} ${prescription.PATIENT_LAST_NAME}`}</TableCell>
                        <TableCell>{`${prescription.DOCTOR_FIRST_NAME} ${prescription.DOCTOR_LAST_NAME}`}</TableCell>
                        <TableCell>{prescription.MEDICATION_NAME}</TableCell>
                        <TableCell>{prescription.QUANTITY}</TableCell>
                        <TableCell>{prescription.DOSAGE}</TableCell>
                        <TableCell>
                          {formatDate(prescription.DATE_OF_FILLING)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredPrescriptions.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 15]}
          />
        </>
      )}
    </Box>
  );
};

export default PrescriptionsView;
