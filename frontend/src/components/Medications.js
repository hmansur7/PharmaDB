import React, { useState, useEffect, useMemo } from "react";
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
  Select,
  InputLabel,
  FormControl,
  Button,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import {
  getMedicines,
  deleteMedicines,
  addMedicine,
  updateMedicine,
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

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "MED_ID", order: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [stockRange, setStockRange] = useState([0, 1000]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    MED_ID: "",
    NAME: "",
    TYPE: "",
    DESCRIPTION: "",
    RESTRICTIONS: "",
    STOCK: "",
    PRICE: "",
    EXPIRY: "",
    REORDER: "",
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const response = await getMedicines();
        const sortedData = [...response.data].sort(
          (a, b) => a.MED_ID - b.MED_ID
        );
        setMedications(sortedData);
        setFilteredMedications(sortedData);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setSnackbar({
          open: true,
          message: "Error fetching medicines.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const handleSort = (key) => {
    const order =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    const sortedData = [...filteredMedications].sort((a, b) => {
      if (typeof a[key] === "string") {
        return order === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      if (key === "EXPIRY") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }
      return order === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setFilteredMedications(sortedData);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const applyFilters = () => {
    let data = medications;

    if (searchQuery) {
      data = data.filter((med) => med.NAME.toLowerCase().includes(searchQuery));
    }

    if (typeFilter) {
      data = data.filter((med) => med.TYPE === typeFilter);
    }

    if (stockRange) {
      data = data.filter(
        (med) => med.STOCK >= stockRange[0] && med.STOCK <= stockRange[1]
      );
    }

    if (priceRange) {
      data = data.filter(
        (med) => med.PRICE >= priceRange[0] && med.PRICE <= priceRange[1]
      );
    }

    setFilteredMedications(data);
    setPage(0); // Reset pagination to first page
  };

  const handleFilterReset = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStockRange([0, 1000]);
    setPriceRange([0, 1000]);
    setFilteredMedications(medications);
    setPage(0); // Reset pagination to first page
  };

  const handleSelectMedicine = (id) => {
    if (selectedMedicines.includes(id)) {
      setSelectedMedicines(selectedMedicines.filter((medId) => medId !== id));
    } else {
      setSelectedMedicines([...selectedMedicines, id]);
    }
  };

  const handleSaveMedicine = async () => {
    try {
      if (isEditing) {
        // Edit existing medicine
        await updateMedicine(newMedicine.MED_ID, newMedicine); // Call the API to update the medicine
        setSnackbar({
          open: true,
          message: "Medicine updated successfully.",
          severity: "success",
        });
      } else {
        // Add new medicine
        await addMedicine(newMedicine); // Call the API to add the new medicine
        setSnackbar({
          open: true,
          message: "Medicine added successfully.",
          severity: "success",
        });
      }

      setDialogOpen(false); // Close the dialog

      // Reset the form
      setNewMedicine({
        MED_ID: "",
        NAME: "",
        TYPE: "",
        DESCRIPTION: "",
        RESTRICTIONS: "",
        STOCK: "",
        PRICE: "",
        EXPIRY: "",
        REORDER: "",
      });

      // Fetch the updated list of medicines
      const response = await getMedicines();
      const sortedData = [...response.data].sort((a, b) => a.MED_ID - b.MED_ID);
      setMedications(sortedData);
      setFilteredMedications(sortedData);
    } catch (error) {
      console.error(
        isEditing ? "Error updating medicine:" : "Error adding medicine:",
        error
      );
      setSnackbar({
        open: true,
        message: isEditing
          ? "Error updating medicine."
          : "Error adding medicine.",
        severity: "error",
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewMedicine({
      medicine_id: "",
      medicine_name: "",
      expiry_date: "",
      price: "",
    });
  };

  const handleDeleteSelected = async () => {
    if (!selectedMedicines.length) {
      setSnackbar({
        open: true,
        message: "No medicines selected for deletion.",
        severity: "error",
      });
      return;
    }

    try {
      const payload = { ids: selectedMedicines }; // Prepare correct payload
      console.log("Payload for deletion:", payload); // Debug payload
      await deleteMedicines(payload); // Send correct payload
      setSnackbar({
        open: true,
        message: "Medicines deleted successfully.",
        severity: "success",
      });

      // Update state after deletion
      setMedications(
        medications.filter((med) => !selectedMedicines.includes(med.MED_ID))
      );
      setFilteredMedications(
        filteredMedications.filter(
          (med) => !selectedMedicines.includes(med.MED_ID)
        )
      );
      setSelectedMedicines([]);
    } catch (error) {
      console.error("Error deleting medications:", error);
      setSnackbar({
        open: true,
        message: "Error deleting medications.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  const uniqueTypes = Array.from(
    new Set(medications.map((med) => med.TYPE))
  ).filter(Boolean);

  const handleEditOpen = (medication) => {
    setIsEditing(true); // Switch to editing mode
    setDialogOpen(true); // Open dialog
    setNewMedicine({
      MED_ID: medication.MED_ID,
      NAME: medication.NAME,
      TYPE: medication.TYPE,
      DESCRIPTION: medication.DESCRIPTION || "",
      RESTRICTIONS: medication.RESTRICTIONS || "",
      STOCK: medication.STOCK,
      PRICE: medication.PRICE,
      EXPIRY: medication.EXPIRY.split("T")[0], // Convert to YYYY-MM-DD for date input
      REORDER: medication.REORDER,
    });
  };

  const handleOpenAddMedicineDialog = () => {
    setIsEditing(false); // Set editing mode to false for adding
    setNewMedicine({
      MED_ID: "",
      NAME: "",
      TYPE: "",
      DESCRIPTION: "",
      RESTRICTIONS: "",
      STOCK: "",
      PRICE: "",
      EXPIRY: "",
      REORDER: "",
    });
    setDialogOpen(true); // Open the dialog
  };

  const handleOpenEditMedicineDialog = (medicine) => {
    setIsEditing(true); // Set editing mode to true
    setNewMedicine({ ...medicine }); // Pre-fill form with selected medicine data
    setDialogOpen(true); // Open the dialog
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h4" gutterBottom>
        Medications
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="type-filter">Type</InputLabel>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {uniqueTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Min Stock"
          type="number"
          variant="outlined"
          value={stockRange[0]}
          onChange={(e) =>
            setStockRange([
              Math.max(0, parseInt(e.target.value, 10) || 0),
              stockRange[1],
            ])
          }
        />
        <TextField
          label="Max Stock"
          type="number"
          variant="outlined"
          value={stockRange[1]}
          onChange={(e) =>
            setStockRange([
              stockRange[0],
              Math.max(0, parseInt(e.target.value, 10) || 1000),
            ])
          }
        />

        <TextField
          label="Min Price"
          type="number"
          variant="outlined"
          value={priceRange[0]}
          onChange={(e) =>
            setPriceRange([
              Math.max(0, parseFloat(e.target.value) || 0),
              priceRange[1],
            ])
          }
        />
        <TextField
          label="Max Price"
          type="number"
          variant="outlined"
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([
              priceRange[0],
              Math.max(0, parseFloat(e.target.value) || 1000),
            ])
          }
        />

        <Button variant="contained" onClick={applyFilters}>
          Apply Filters
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleFilterReset}
        >
          Reset Filters
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 600,
              overflowX: "auto",
              "@media (max-width: 600px)": {
                width: "100%",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            selectedMedicines.length ===
                            filteredMedications.length
                          }
                          onChange={(e) =>
                            setSelectedMedicines(
                              e.target.checked
                                ? filteredMedications.map((med) => med.MED_ID)
                                : []
                            )
                          }
                        />
                      }
                      label="Select all"
                    />
                  </TableCell>
                  {[
                    { key: "MED_ID", label: "Medicine ID", sortable: true },
                    { key: "NAME", label: "Name", sortable: true },
                    { key: "TYPE", label: "Type", sortable: true },
                    { key: "STOCK", label: "Stock", sortable: true },
                    { key: "PRICE", label: "Price", sortable: true },
                    { key: "EXPIRY", label: "Expiry", sortable: true },
                    { key: "REORDER", label: "Reorder Level", sortable: true },
                  ].map((column) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        display: { xs: "table-cell", sm: "table-cell" }, // Adjust as needed
                      }}
                    >
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
                  <TableCell
                    sx={{
                      display: { xs: "none", sm: "table-cell" }, // Hide on smaller screens
                    }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{
                      display: { xs: "none", sm: "table-cell" }, // Hide on smaller screens
                    }}
                  >
                    Restrictions
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredMedications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((medication) => (
                    <TableRow key={medication.MED_ID}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMedicines.includes(
                            medication.MED_ID
                          )}
                          onChange={() =>
                            handleSelectMedicine(medication.MED_ID)
                          }
                        />
                      </TableCell>
                      <TableCell>{medication.MED_ID}</TableCell>
                      <TableCell>{medication.NAME}</TableCell>
                      <TableCell>{medication.TYPE}</TableCell>
                      <TableCell>{medication.STOCK}</TableCell>
                      <TableCell>${medication.PRICE.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(medication.EXPIRY)}</TableCell>
                      <TableCell>{medication.REORDER}</TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", sm: "table-cell" }, // Hidden on smaller screens
                        }}
                      >
                        {medication.DESCRIPTION || "No description available"}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", sm: "table-cell" }, // Hidden on smaller screens
                        }}
                      >
                        {medication.RESTRICTIONS || "No restrictions"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() =>
                            handleOpenEditMedicineDialog(medication)
                          }
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              "@media (max-width: 600px)": {
                flexDirection: "column",
              },
            }}
          >
            <TablePagination
              component="div"
              count={filteredMedications.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
              }
              rowsPerPageOptions={[5, 10, 15]}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-start",
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAddMedicineDialog}
            >
              Add Medicine
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSelected}
              disabled={selectedMedicines.length === 0}
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
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Medicine" : "Add New Medicine"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginTop: 2,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <TextField
              label="Medicine ID"
              variant="outlined"
              fullWidth
              disabled={isEditing} // Disable ID editing during updates
              value={newMedicine.MED_ID}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, MED_ID: e.target.value })
              }
            />
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={newMedicine.NAME}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, NAME: e.target.value })
              }
            />
            <TextField
              label="Type"
              variant="outlined"
              fullWidth
              value={newMedicine.TYPE}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, TYPE: e.target.value })
              }
            />
            <TextField
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              value={newMedicine.DESCRIPTION}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, DESCRIPTION: e.target.value })
              }
            />
            <TextField
              label="Restrictions"
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              value={newMedicine.RESTRICTIONS}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, RESTRICTIONS: e.target.value })
              }
            />
            <TextField
              label="Stock"
              variant="outlined"
              type="number"
              fullWidth
              value={newMedicine.STOCK}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, STOCK: e.target.value })
              }
            />
            <TextField
              label="Price"
              variant="outlined"
              type="number"
              fullWidth
              value={newMedicine.PRICE}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, PRICE: e.target.value })
              }
            />
            <TextField
              label="Expiry Date"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={newMedicine.EXPIRY}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, EXPIRY: e.target.value })
              }
            />
            <TextField
              label="Reorder Level"
              variant="outlined"
              type="number"
              fullWidth
              value={newMedicine.REORDER}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, REORDER: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveMedicine} color="primary">
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Medications;
