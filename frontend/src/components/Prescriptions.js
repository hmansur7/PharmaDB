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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
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

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "PRESCRIPTION_ID",
    order: "asc",
  });
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    PRESCRIPTION_ID: "",
    DOCTOR_ID: "",
    PATIENT_ID: "",
    MED_ID: "",
    QUANTITY: "",
    DATE_OF_FILLING: "",
    DOSAGE: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [filters, setFilters] = useState({
    doctorId: "",
    patientId: "",
    medicineId: "",
    quantityRange: [0, 100],
    dateFrom: "",
    dateTo: "",
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

  const handleSavePrescription = async () => {
    try {
      if (isEditing) {
        await updatePrescription(
          newPrescription.PRESCRIPTION_ID,
          newPrescription
        );
        setSnackbar({
          open: true,
          message: "Prescription updated successfully.",
          severity: "success",
        });
      } else {
        await addPrescription(newPrescription);
        setSnackbar({
          open: true,
          message: "Prescription added successfully.",
          severity: "success",
        });
      }

      setDialogOpen(false);
      setNewPrescription({
        PRESCRIPTION_ID: "",
        DOCTOR_ID: "",
        PATIENT_ID: "",
        MED_ID: "",
        QUANTITY: "",
        DATE_OF_FILLING: "",
        DOSAGE: "",
      });

      const response = await getPrescriptions();
      setPrescriptions(response.data);
      setFilteredPrescriptions(response.data);
    } catch (error) {
      console.error("Error saving prescription:", error);
      setSnackbar({
        open: true,
        message: isEditing
          ? "Error updating prescription."
          : "Error adding prescription.",
        severity: "error",
      });
    }
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
      await Promise.all(
        selectedPrescriptions.map((id) => deletePrescription(id))
      );
      setSnackbar({
        open: true,
        message: "Prescriptions deleted successfully.",
        severity: "success",
      });
      const remainingPrescriptions = prescriptions.filter(
        (prescription) =>
          !selectedPrescriptions.includes(prescription.PRESCRIPTION_ID)
      );
      setPrescriptions(remainingPrescriptions);
      setFilteredPrescriptions(remainingPrescriptions);
      setSelectedPrescriptions([]);
    } catch (error) {
      console.error("Error deleting prescriptions:", error);
      setSnackbar({
        open: true,
        message: "Error deleting prescriptions.",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = (prescription) => {
    if (prescription) {
      setIsEditing(true);
      setNewPrescription({ ...prescription });
    } else {
      setIsEditing(false);
      setNewPrescription({
        PRESCRIPTION_ID: "",
        DOCTOR_ID: "",
        PATIENT_ID: "",
        MED_ID: "",
        QUANTITY: "",
        DATE_OF_FILLING: "",
        DOSAGE: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  const applyFilters = (updatedFilters) => {
    let filteredData = prescriptions;

    // Partial match for Doctor ID
    if (updatedFilters.doctorId) {
      filteredData = filteredData.filter((prescription) =>
        String(prescription.DOCTOR_ID)
          .toLowerCase()
          .includes(updatedFilters.doctorId.toLowerCase())
      );
    }

    // Partial match for Patient ID
    if (updatedFilters.patientId) {
      filteredData = filteredData.filter((prescription) =>
        String(prescription.PATIENT_ID)
          .toLowerCase()
          .includes(updatedFilters.patientId.toLowerCase())
      );
    }

    // Partial match for Medicine ID
    if (updatedFilters.medicineId) {
      filteredData = filteredData.filter((prescription) =>
        String(prescription.MED_ID)
          .toLowerCase()
          .includes(updatedFilters.medicineId.toLowerCase())
      );
    }

    // Quantity range
    if (updatedFilters.quantityRange) {
      filteredData = filteredData.filter(
        (prescription) =>
          prescription.QUANTITY >= updatedFilters.quantityRange[0] &&
          prescription.QUANTITY <= updatedFilters.quantityRange[1]
      );
    }

    // Date range: From
    if (updatedFilters.dateFrom) {
      filteredData = filteredData.filter(
        (prescription) =>
          new Date(prescription.DATE_OF_FILLING) >=
          new Date(updatedFilters.dateFrom)
      );
    }

    // Date range: To
    if (updatedFilters.dateTo) {
      filteredData = filteredData.filter(
        (prescription) =>
          new Date(prescription.DATE_OF_FILLING) <=
          new Date(updatedFilters.dateTo)
      );
    }

    setFilteredPrescriptions(filteredData);
  };

  const resetFilters = () => {
    setFilters({
      doctorId: "",
      patientId: "",
      medicineId: "",
      quantityRange: [0, 100],
      dateFrom: "",
      dateTo: "",
    });
    setFilteredPrescriptions(prescriptions);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h4" gutterBottom>
        Prescriptions
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Doctor ID"
          variant="outlined"
          value={filters.doctorId}
          onChange={(e) => {
            const updatedFilters = { ...filters, doctorId: e.target.value };
            setFilters(updatedFilters);
            applyFilters(updatedFilters);
          }}
        />
        <TextField
          label="Patient ID"
          variant="outlined"
          value={filters.patientId}
          onChange={(e) => {
            const updatedFilters = { ...filters, patientId: e.target.value };
            setFilters(updatedFilters);
            applyFilters(updatedFilters);
          }}
        />
        <TextField
          label="Medicine ID"
          variant="outlined"
          value={filters.medicineId}
          onChange={(e) => {
            const updatedFilters = { ...filters, medicineId: e.target.value };
            setFilters(updatedFilters);
            applyFilters(updatedFilters);
          }}
        />
        <TextField
          label="Min Quantity"
          type="number"
          variant="outlined"
          value={filters.quantityRange[0]}
          onChange={(e) => {
            const updatedFilters = {
              ...filters,
              quantityRange: [
                parseInt(e.target.value, 10) || 0,
                filters.quantityRange[1],
              ],
            };
            setFilters(updatedFilters);
            applyFilters(updatedFilters);
          }}
        />
        <TextField
          label="Max Quantity"
          type="number"
          variant="outlined"
          value={filters.quantityRange[1]}
          onChange={(e) => {
            const updatedFilters = {
              ...filters,
              quantityRange: [
                filters.quantityRange[0],
                parseInt(e.target.value, 10) || 100,
              ],
            };
            setFilters(updatedFilters);
            applyFilters(updatedFilters);
          }}
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
                  {[
                    { key: "PRESCRIPTION_ID", label: "ID" },
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
                  <TableCell>Actions</TableCell>
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
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(prescription)}
                        >
                          Edit
                        </Button>
                      </TableCell>
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
            <Button variant="contained" onClick={() => handleOpenDialog(null)}>
              Add Prescription
            </Button>
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Prescription" : "Add Prescription"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Prescription ID"
              value={newPrescription.PRESCRIPTION_ID}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  PRESCRIPTION_ID: e.target.value,
                })
              }
              disabled={isEditing}
              fullWidth
            />
            <TextField
              label="Doctor ID"
              value={newPrescription.DOCTOR_ID}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  DOCTOR_ID: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Patient ID"
              value={newPrescription.PATIENT_ID}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  PATIENT_ID: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Medicine ID"
              value={newPrescription.MED_ID}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  MED_ID: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Quantity"
              value={newPrescription.QUANTITY}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  QUANTITY: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Date of Filling"
              type="date"
              value={newPrescription.DATE_OF_FILLING}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  DATE_OF_FILLING: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Dosage"
              value={newPrescription.DOSAGE}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  DOSAGE: e.target.value,
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSavePrescription} color="primary">
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prescriptions;
