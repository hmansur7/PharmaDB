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
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  getPrescriptions,
  deletePrescription,
} from "../../services/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
};

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("DOCTOR_ID"); // Default search field
  const [sortConfig, setSortConfig] = useState({
    key: "PRESCRIPTION_ID",
    order: "asc",
  });
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const response = await getPrescriptions();
        setPrescriptions(response.data);
        setFilteredPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setSnackbar({
          open: true,
          message: "Error fetching prescriptions.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
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

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = prescriptions.filter((prescription) => {
      switch (searchField) {
        case "DOCTOR_ID":
          return String(prescription.DOCTOR_ID)
            .toLowerCase()
            .includes(query);
        case "PATIENT_ID":
          return String(prescription.PATIENT_ID)
            .toLowerCase()
            .includes(query);
        case "MED_ID":
          return String(prescription.MED_ID)
            .toLowerCase()
            .includes(query);
        case "DATE_OF_FILLING":
          return prescription.DATE_OF_FILLING &&
            formatDate(prescription.DATE_OF_FILLING)
              .toLowerCase()
              .includes(query);
        default:
          return false;
      }
    });

    setFilteredPrescriptions(filtered);
    setPage(0); 
  };

  const handleDeleteSelected = async () => {
    if (!selectedPrescriptions.length) {
      setSnackbar({
        open: true,
        message: "No prescriptions selected for deletion.",
        severity: "error",
      });
      return;
    }
  
    try {
      // Batch delete all selected prescriptions
      await deletePrescription(selectedPrescriptions);
  
      // Remove deleted prescriptions from state
      const remainingPrescriptions = prescriptions.filter(
        (prescription) =>
          !selectedPrescriptions.includes(prescription.PRESCRIPTION_ID)
      );
      setPrescriptions(remainingPrescriptions);
      setFilteredPrescriptions(remainingPrescriptions);
      setSelectedPrescriptions([]);
  
      setSnackbar({
        open: true,
        message: "Prescriptions deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting prescriptions:", error);
      setSnackbar({
        open: true,
        message: "Error deleting prescriptions.",
        severity: "error",
      });
    }
  };
  

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h4" gutterBottom>
        Prescriptions
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          select
          label="Search Field"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="DOCTOR_ID">Doctor ID</MenuItem>
          <MenuItem value="PATIENT_ID">Patient ID</MenuItem>
          <MenuItem value="MED_ID">Medicine ID</MenuItem>
          <MenuItem value="DATE_OF_FILLING">Date</MenuItem>
        </TextField>
        <TextField
          label={`Search by ${searchField.replace("_", " ")}`}
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
        />
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
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            selectedPrescriptions.length ===
                            filteredPrescriptions.length
                          }
                          onChange={(e) =>
                            setSelectedPrescriptions(
                              e.target.checked
                                ? filteredPrescriptions.map(
                                    (prescription) =>
                                      prescription.PRESCRIPTION_ID
                                  )
                                : []
                            )
                          }
                        />
                      }
                      label="Select all"
                    />
                  </TableCell>
                  {[{ key: "PRESCRIPTION_ID", label: "ID" },
                    { key: "DOCTOR_ID", label: "Doctor ID" },
                    { key: "PATIENT_ID", label: "Patient ID" },
                    { key: "MED_ID", label: "Medicine ID" },
                    { key: "QUANTITY", label: "Quantity" },
                    { key: "DATE_OF_FILLING", label: "Date of Filling" },
                    { key: "DOSAGE", label: "Dosage" },
                  ].map((column) => (
                    <TableCell key={column.key}>
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
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrescriptions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((prescription) => (
                    <TableRow key={prescription.PRESCRIPTION_ID}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPrescriptions.includes(
                            prescription.PRESCRIPTION_ID
                          )}
                          onChange={() =>
                            setSelectedPrescriptions((prev) =>
                              prev.includes(prescription.PRESCRIPTION_ID)
                                ? prev.filter(
                                    (id) => id !== prescription.PRESCRIPTION_ID
                                  )
                                : [...prev, prescription.PRESCRIPTION_ID]
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{prescription.PRESCRIPTION_ID}</TableCell>
                      <TableCell>{prescription.DOCTOR_ID}</TableCell>
                      <TableCell>{prescription.PATIENT_ID}</TableCell>
                      <TableCell>{prescription.MED_ID}</TableCell>
                      <TableCell>{prescription.QUANTITY}</TableCell>
                      <TableCell>
                        {formatDate(prescription.DATE_OF_FILLING)}
                      </TableCell>
                      <TableCell>{prescription.DOSAGE}</TableCell>
                    </TableRow>
                  ))}
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

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              disabled={!selectedPrescriptions.length}
              onClick={handleDeleteSelected}
            >
              Delete Selected
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Prescriptions;
