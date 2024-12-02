import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Employee APIs
export const getEmployees = () => api.get("/employees");
export const addEmployee = (employee) => api.post("/employees", employee);
export const updateEmployee = (id, employee) =>
  api.put(`/employees/${id}`, employee);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
export const searchEmployee = (query) =>
  api.get(`/employees/search`, { params: query });

// Doctor APIs
export const getDoctors = () => api.get("/doctors");
export const addDoctor = (doctor) => api.post("/doctors", doctor);
export const updateDoctor = (id, doctor) => api.put(`/doctors/${id}`, doctor);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);
export const searchDoctor = (query) =>
  api.get(`/doctors/search`, { params: query });

// Patient APIs
export const getPatients = () => api.get("/patients"); // Get all patients
export const getPatientById = (id) => api.get(`/patients/${id}`); // Get a specific patient by ID
export const addPatient = (patient) => api.post("/patients", patient); // Add a new patient
export const updatePatient = (id, patient) =>
  api.put(`/patients/${id}`, patient); // Update a patient's information
export const deletePatient = (id) => api.delete(`/patients/${id}`); // Delete a patient
export const searchPatient = (query) =>
  api.get(`/patients/search`, { params: query }); // Search patients by query

// Medicine APIs
export const getMedicines = () => api.get("/medicines");
export const addMedicine = (medicine) => api.post("/medicines", medicine);
export const updateMedicine = (id, medicine) => api.put(`/medicines/${id}`, medicine);
export const deleteMedicines = (payload) => api.delete("/medicines", {data: payload,});

// Prescription APIs
export const getPrescriptions = () => api.get("/prescriptions");
export const addPrescription = (prescription) =>
  api.post("/prescriptions", prescription);
export const updatePrescription = (id, prescription) =>
  api.put(`/prescriptions/${id}`, prescription);
export const deletePrescription = (ids) =>
  api.delete("/prescriptions", {
    data: { ids }, // Axios supports the `data` key for DELETE requests.
  });

// Fetch data from the PATIENTS_WITH_PERSCRIPTIONS view
export const getPatientsWithPrescriptions = () =>
  api.get("/patients-with-prescriptions");
// Pharmacy APIs
export const getPharmacies = () => api.get("/pharmacies");
export const addPharmacy = (pharmacy) => api.post("/pharmacies", pharmacy);
export const updatePharmacy = (id, pharmacy) =>
  api.put(`/pharmacies/${id}`, pharmacy);
export const deletePharmacy = (id) => api.delete(`/pharmacies/${id}`);

// Pharmacy Medicine APIs
export const getPharmacyMedicines = () => api.get("/pharmacy-medicines");
export const addPharmacyMedicine = (pharmacyMedicine) =>
  api.post("/pharmacy-medicines", pharmacyMedicine);
export const updatePharmacyMedicine = (pharmacyMedicine) =>
  api.put("/pharmacy-medicines", pharmacyMedicine);
export const deletePharmacyMedicine = (pharmacyMedicine) =>
  api.delete("/pharmacy-medicines", { data: pharmacyMedicine });
