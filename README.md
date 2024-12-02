
# PharmaDB

PharmaDB is a comprehensive pharmaceutical management system designed to streamline operations in pharmacies and clinics. It features dashboards for Admins, Doctors, and Employees, allowing for efficient management of patients, medications, prescriptions, and employees.

## Features

- **Admin Dashboard**: Manage doctors, employees, and key administrative tasks.
- **Doctor Dashboard**: Handle patient records and manage prescriptions efficiently.
- **Employee Dashboard**: Track medications and manage inventory.
- **Patient Management**: Add, view, and update patient details.
- **Medication Management**: Monitor stock, reorder levels, and manage medication details.
- **Prescription Handling**: Issue and track prescriptions for patients.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: React, Material-UI for modern and responsive UI design.
- **Backend**: Express with Node for REST API.
- **Database**: Oracle for data storage and management.

## Usage

- **Admin**: Manage employees and doctors.
- **Doctor**: Handle patient details and prescriptions.
- **Employee**: Manage inventory and dispense medications.

# API Endpoints

## General
- `GET /` - Test endpoint to verify if the API is running.

---

## Employee Endpoints
- `GET /employees` - Fetch all employees.
- `POST /employees` - Add a new employee.
- `GET /employees/search` - Search for employees by first and last name.
- `PUT /employees/:id` - Update an employee's details by ID.
- `DELETE /employees/:id` - Delete an employee by ID.

---

## Doctor Endpoints
- `GET /doctors` - Fetch all doctors.
- `GET /doctors/search` - Search for doctors by first and last name.
- `POST /doctors` - Add a new doctor.
- `PUT /doctors/:id` - Update a doctor's details by ID.
- `DELETE /doctors/:id` - Delete a doctor by ID.

---

## Patient Endpoints
- `GET /patients` - Fetch all patients.
- `GET /patients/:id` - Fetch a specific patient by ID.
- `POST /patients` - Add a new patient.
- `PUT /patients/:id` - Update a patient's details by ID.
- `DELETE /patients/:id` - Delete a patient by ID.

---

## Medicine Endpoints
- `GET /medicines` - Fetch all medicines.
- `POST /medicines` - Add a new medicine.
- `PUT /medicines/:id` - Update a medicine's details by ID.
- `DELETE /medicines` - Delete multiple medicines by IDs.

---

## Prescription Endpoints
- `GET /prescriptions` - Fetch all prescriptions.
- `POST /prescriptions` - Add a new prescription.
- `PUT /prescriptions/:id` - Update a prescription's details by ID.
- `DELETE /prescriptions` - Delete multiple prescriptions by IDs.

---

## Custom Views
- `GET /patients-with-prescriptions` - Fetch a custom view of patients with prescriptions.
---
## Ackowledgements
Special thanks to all open-source libraries used in this project.
