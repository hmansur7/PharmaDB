const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const oracledb = require("oracledb");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize Oracle Client (Thick mode)
oracledb.initOracleClient({ libDir: "C:\\instantclient_21_15" }); // Update the path

// Oracle Database Configuration
const dbConfig = {
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  connectString: process.env.DBCONNECT,
};

const dbQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig); // Get a connection
    const result = await connection.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Rows as objects
      autoCommit: true, // Commit for write operations
    });
    return { connection, result }; // Return both connection and result
  } catch (err) {
    console.error("Database error:", err.message);
    throw err;
  }
};

// Test API
app.get("/", (req, res) =>
  res.send("Hospital-Pharmacy Backend API is running!")
);

// ========================= CRUD for EMPLOYEE =========================
app.get("/employees", async (req, res) => {
  try {
    const rows = await dbQuery("SELECT * FROM employee ORDER BY last_name");
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching employees");
  }
});

app.post("/employees", async (req, res) => {
  const { employee_id, first_name, last_name, phone_number } = req.body;
  try {
    await dbQuery(
      `INSERT INTO employee (employee_id, first_name, last_name, phone_number) VALUES (:1, :2, :3, :4)`,
      [employee_id, first_name, last_name, phone_number]
    );
    res.send("Employee added successfully");
  } catch (err) {
    res.status(500).send("Error adding employee");
  }
});

app.get("/employees/search", async (req, res) => {
  const { first_name, last_name } = req.query; // Expect query parameters
  try {
    const rows = await dbQuery(
      `SELECT * FROM employee WHERE LOWER(first_name) = LOWER(:1) AND LOWER(last_name) = LOWER(:2)`,
      [first_name, last_name]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching employee");
  }
});

app.put("/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;
  try {
    await dbQuery(
      `UPDATE employee SET first_name = :1, last_name = :2, phone_number = :3 WHERE employee_id = :4`,
      [first_name, last_name, phone_number, id]
    );
    res.send("Employee updated successfully");
  } catch (err) {
    res.status(500).send("Error updating employee");
  }
});

app.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await dbQuery(`DELETE FROM employee WHERE employee_id = :1`, [id]);
    res.send("Employee deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting employee");
  }
});

// ========================= CRUD for DOCTOR =========================

// Fetch all doctors
app.get("/doctors", async (req, res) => {
  try {
    const { result } = await dbQuery("SELECT * FROM doctor ORDER BY last_name");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    res.status(500).send("Error fetching doctors.");
  }
});

// Search doctors by first and last name
app.get("/doctors/search", async (req, res) => {
  const { first_name, last_name } = req.query;
  try {
    const { result } = await dbQuery(
      `SELECT * FROM doctor WHERE LOWER(first_name) = LOWER(:1) AND LOWER(last_name) = LOWER(:2)`,
      [first_name, last_name]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error searching for doctors:", err.message);
    res.status(500).send("Error searching for doctors.");
  }
});

// Add a new doctor
app.post("/doctors", async (req, res) => {
  const { doctor_id, first_name, last_name, phone_number, email } = req.body;
  try {
    await dbQuery(
      `INSERT INTO doctor (doctor_id, first_name, last_name, phone_number, email) 
       VALUES (:1, :2, :3, :4, :5)`,
      [doctor_id, first_name, last_name, phone_number, email]
    );
    res.send("Doctor added successfully.");
  } catch (err) {
    console.error("Error adding doctor:", err.message);
    res.status(500).send("Error adding doctor.");
  }
});

// Update an existing doctor
app.put("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number, email } = req.body;
  try {
    await dbQuery(
      `UPDATE doctor 
       SET first_name = :1, last_name = :2, phone_number = :3, email = :4 
       WHERE doctor_id = :5`,
      [first_name, last_name, phone_number, email, id]
    );
    res.send("Doctor updated successfully.");
  } catch (err) {
    console.error("Error updating doctor:", err.message);
    res.status(500).send("Error updating doctor.");
  }
});

// Delete a doctor
app.delete("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await dbQuery(`DELETE FROM doctor WHERE doctor_id = :1`, [id]);
    res.send("Doctor deleted successfully.");
  } catch (err) {
    console.error("Error deleting doctor:", err.message);
    res.status(500).send("Error deleting doctor.");
  }
});

// ========================= CRUD for PATIENT =========================
app.get("/patients", async (req, res) => {
  let connection;
  try {
    const { connection: conn, result } = await dbQuery(
      "SELECT * FROM PATIENT ORDER BY PATIENT_ID ASC"
    );
    connection = conn;
    const rows = result.rows;

    // Convert LOB fields to string if necessary
    const patients = await Promise.all(
      rows.map(async (row) => {
        const allergies = row.ALLERGIES ? await readLob(row.ALLERGIES) : "None";
        const medicalHistory = row.MEDICAL_HISTORY
          ? await readLob(row.MEDICAL_HISTORY)
          : "None";

        return {
          ...row,
          ALLERGIES: allergies,
          MEDICAL_HISTORY: medicalHistory,
        };
      })
    );

    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err.message);
    res.status(500).send("Error fetching patients.");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err.message);
      }
    }
  }
});

app.get("/patients/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    const { connection: conn, result } = await dbQuery(
      "SELECT * FROM PATIENT WHERE PATIENT_ID = :1",
      [id]
    );
    connection = conn;
    const row = result.rows[0];

    if (!row) {
      return res.status(404).send("Patient not found.");
    }

    const allergies = row.ALLERGIES ? await readLob(row.ALLERGIES) : "None";
    const medicalHistory = row.MEDICAL_HISTORY
      ? await readLob(row.MEDICAL_HISTORY)
      : "None";

    res.json({
      ...row,
      ALLERGIES: allergies,
      MEDICAL_HISTORY: medicalHistory,
    });
  } catch (err) {
    console.error("Error fetching patient:", err.message);
    res.status(500).send("Error fetching patient.");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err.message);
      }
    }
  }
});

app.post("/patients", async (req, res) => {
  const {
    PATIENT_ID,
    FIRST_NAME,
    LAST_NAME,
    BDAY,
    GENDER,
    ADDRESS,
    PHONE_NUMBER,
    ALLERGIES,
    MEDICAL_HISTORY,
  } = req.body;
  console.log("Incoming Patient Data:", req.body);
  try {
    await dbQuery(
      `INSERT INTO PATIENT (
        PATIENT_ID, FIRST_NAME, LAST_NAME, BDAY, GENDER, ADDRESS, PHONE_NUMBER, ALLERGIES, MEDICAL_HISTORY
      ) VALUES (
        :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), :5, :6, :7, :8, :9
      )`,
      [
        PATIENT_ID,
        FIRST_NAME,
        LAST_NAME,
        BDAY,
        GENDER,
        ADDRESS,
        PHONE_NUMBER,
        ALLERGIES,
        MEDICAL_HISTORY,
      ]
    );
    res.send("Patient added successfully.");
  } catch (err) {
    console.error("Error adding patient:", err.message);
    res.status(500).send("Error adding patient.");
  }
});

app.put("/patients/:id", async (req, res) => {
  const { id: PATIENT_ID } = req.params; // Use the correct destructured param
  const {
    FIRST_NAME,
    LAST_NAME,
    BDAY,
    GENDER,
    ADDRESS,
    PHONE_NUMBER,
    ALLERGIES,
    MEDICAL_HISTORY,
  } = req.body;

  console.log("Incoming Update Payload:", {
    PATIENT_ID,
    FIRST_NAME,
    LAST_NAME,
    BDAY,
    GENDER,
    ADDRESS,
    PHONE_NUMBER,
    ALLERGIES,
    MEDICAL_HISTORY,
  });

  try {
    await dbQuery(
      `UPDATE PATIENT SET 
         FIRST_NAME = :1, 
         LAST_NAME = :2, 
         BDAY = TO_DATE(:3, 'YYYY-MM-DD'), 
         GENDER = :4, 
         ADDRESS = :5, 
         PHONE_NUMBER = :6, 
         ALLERGIES = :7, 
         MEDICAL_HISTORY = :8 
       WHERE PATIENT_ID = :9`,
      [
        FIRST_NAME, // Use correct variable names
        LAST_NAME,
        BDAY,
        GENDER,
        ADDRESS,
        PHONE_NUMBER,
        ALLERGIES,
        MEDICAL_HISTORY,
        PATIENT_ID,
      ]
    );
    res.send("Patient updated successfully");
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error updating patient");
  }
});

app.delete("/patients/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Deleting patient with ID:", id);
  try {
    await dbQuery("DELETE FROM PATIENT WHERE PATIENT_ID = :1", [id]);
    res.send("Patient deleted successfully.");
  } catch (err) {
    console.error("Error deleting patient:", err.message);
    res.status(500).send("Error deleting patient.");
  }
});

// ========================= CRUD for MEDICINE =========================
app.get("/medicines", async (req, res) => {
  let connection;
  try {
    const { connection: conn, result } = await dbQuery(
      "SELECT * FROM medicine ORDER BY MED_ID"
    );
    connection = conn; // Keep connection open for LOB processing
    const rows = result.rows;

    const medicines = await Promise.all(
      rows.map(async (row) => {
        const description = row.DESCRIPTION
          ? await readLob(row.DESCRIPTION)
          : "No description available";
        const restrictions = row.RESTRICTIONS
          ? await readLob(row.RESTRICTIONS)
          : "No restrictions";

        return {
          MED_ID: row.MED_ID,
          NAME: row.NAME,
          TYPE: row.TYPE,
          DESCRIPTION: description,
          RESTRICTIONS: restrictions,
          STOCK: row.STOCK,
          PRICE: row.PRICE,
          EXPIRY: row.EXPIRY,
          REORDER: row.REORDER,
        };
      })
    );

    res.json(medicines);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).send("Error fetching medicines");
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close after processing LOBs
      } catch (err) {
        console.error("Error closing connection:", err.message);
      }
    }
  }
});

const readLob = async (lob) => {
  return new Promise((resolve, reject) => {
    if (!lob) return resolve(null);

    let data = "";
    lob.setEncoding("utf8");
    lob.on("data", (chunk) => {
      data += chunk; // Collect LOB data
    });
    lob.on("end", () => {
      resolve(data); // Resolve with full data
    });
    lob.on("error", (err) => {
      console.error("Error reading LOB:", err.message);
      reject(err);
    });
  });
};

app.post("/medicines", async (req, res) => {
  const {
    MED_ID,
    NAME,
    TYPE,
    DESCRIPTION,
    RESTRICTIONS,
    STOCK,
    PRICE,
    EXPIRY,
    REORDER,
  } = req.body;

  const newMedicine = {
    MED_ID: Number(MED_ID),
    NAME: String(NAME),
    TYPE: String(TYPE),
    DESCRIPTION: DESCRIPTION || null,
    RESTRICTIONS: RESTRICTIONS || null,
    STOCK: Number(STOCK),
    PRICE: parseFloat(PRICE),
    EXPIRY: formatToOracleDate(EXPIRY),
    REORDER: Number(REORDER),
  };

  console.log("Prepared Medicine Data:", newMedicine);

  try {
    const result = await dbQuery(
      `INSERT INTO medicine (MED_ID, NAME, TYPE, DESCRIPTION, RESTRICTIONS, STOCK, PRICE, EXPIRY, REORDER)
       VALUES (:1, :2, :3, :4, :5, :6, :7, TO_DATE(:8, 'DD-MON-YY'), :9)`,
      [
        newMedicine.MED_ID,
        newMedicine.NAME,
        newMedicine.TYPE,
        newMedicine.DESCRIPTION,
        newMedicine.RESTRICTIONS,
        newMedicine.STOCK,
        newMedicine.PRICE,
        newMedicine.EXPIRY,
        newMedicine.REORDER,
      ]
    );
    console.log("Insert Query Result:", result);
    res.send("Medicine added successfully");
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).send("Error adding medicine");
  }
});

const formatToOracleDate = (isoDate) => {
  if (!isoDate) return null; // Handle null or undefined dates
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`; // Example: 29-NOV-24
};

app.put("/medicines/:id", async (req, res) => {
  const { id } = req.params;
  const {
    NAME,
    TYPE,
    DESCRIPTION,
    RESTRICTIONS,
    STOCK,
    PRICE,
    EXPIRY,
    REORDER,
  } = req.body;

  try {
    await dbQuery(
      `UPDATE medicine 
       SET NAME = :1, TYPE = :2, DESCRIPTION = :3, RESTRICTIONS = :4, STOCK = :5, PRICE = :6, EXPIRY = TO_DATE(:7, 'DD-MON-YY'), REORDER = :8 
       WHERE MED_ID = :9`,
      [
        NAME,
        TYPE,
        DESCRIPTION || null,
        RESTRICTIONS || null,
        Number(STOCK),
        parseFloat(PRICE),
        formatToOracleDate(EXPIRY),
        Number(REORDER),
        Number(id),
      ]
    );
    res.send("Medicine updated successfully");
  } catch (err) {
    console.error("Error updating medicine:", err);
    res.status(500).send("Error updating medicine");
  }
});

app.delete("/medicines", async (req, res) => {
  console.log("Request body:", req.body); // Debug full request body
  const { ids } = req.body; // Extract `ids` from the request body

  console.log("Received IDs for deletion:", ids); // Log the payload to check its structure and type

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    console.error("Invalid or missing `ids` payload");
    return res.status(400).send("Invalid or missing `ids` payload");
  }

  try {
    const placeholders = ids.map((_, i) => `:${i + 1}`).join(", ");
    console.log("Constructed placeholders:", placeholders); // Debug query placeholders
    await dbQuery(
      `DELETE FROM medicine WHERE MED_ID IN (${placeholders})`,
      ids
    );
    res.send("Medicines deleted successfully");
  } catch (err) {
    console.error("Error deleting medicines:", err);
    res.status(500).send("Error deleting medicines");
  }
});

// ========================= CRUD for PRESCRIPTION =========================
app.get("/prescriptions", async (req, res) => {
  let connection;
  try {
    const { connection: conn, result } = await dbQuery(
      "SELECT * FROM prescription ORDER BY PRESCRIPTION_ID ASC"
    );
    connection = conn; // Keep connection open for LOB processing
    const rows = result.rows;

    const prescriptions = await Promise.all(
      rows.map(async (row) => {
        const dosage = row.DOSAGE ? await readLob(row.DOSAGE) : "N/A";

        return {
          PRESCRIPTION_ID: row.PRESCRIPTION_ID,
          DOCTOR_ID: row.DOCTOR_ID,
          PATIENT_ID: row.PATIENT_ID,
          MED_ID: row.MED_ID,
          QUANTITY: row.QUANTITY,
          DATE_OF_FILLING: row.DATE_OF_FILLING,
          DOSAGE: dosage,
        };
      })
    );

    res.json(prescriptions);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).send("Error fetching prescriptions");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err.message);
      }
    }
  }
});

app.post("/prescriptions", async (req, res) => {
  const {
    PRESCRIPTION_ID,
    DOCTOR_ID,
    PATIENT_ID,
    MED_ID,
    QUANTITY,
    DATE_OF_FILLING,
    DOSAGE,
  } = req.body;

  try {
    await dbQuery(
      `INSERT INTO PRESCRIPTION 
       (PRESCRIPTION_ID, DOCTOR_ID, PATIENT_ID, MED_ID, QUANTITY, DATE_OF_FILLING, DOSAGE) 
       VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'), :7)`,
      [
        PRESCRIPTION_ID,
        DOCTOR_ID,
        PATIENT_ID,
        MED_ID,
        QUANTITY,
        DATE_OF_FILLING || null, // Handle nullable dates
        DOSAGE,
      ]
    );
    res.send("Prescription added successfully");
  } catch (err) {
    console.error("Error adding prescription:", err.message);
    res.status(500).send("Error adding prescription");
  }
});

app.put("/prescriptions/:id", async (req, res) => {
  const { id } = req.params;
  const { DOCTOR_ID, PATIENT_ID, MED_ID, QUANTITY, DATE_OF_FILLING, DOSAGE } =
    req.body;

  try {
    await dbQuery(
      `UPDATE PRESCRIPTION 
       SET DOCTOR_ID = :1, PATIENT_ID = :2, MED_ID = :3, QUANTITY = :4, 
       DATE_OF_FILLING = TO_DATE(:5, 'YYYY-MM-DD'), DOSAGE = :6 
       WHERE PRESCRIPTION_ID = :7`,
      [
        DOCTOR_ID,
        PATIENT_ID,
        MED_ID,
        QUANTITY,
        DATE_OF_FILLING || null,
        DOSAGE,
        id,
      ]
    );
    res.send("Prescription updated successfully");
  } catch (err) {
    console.error("Error updating prescription:", err.message);
    res.status(500).send("Error updating prescription");
  }
});

app.delete("/prescriptions", async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    console.error("Invalid or missing `ids` payload");
    return res.status(400).send("Invalid or missing `ids` payload");
  }

  try {
    const placeholders = ids.map((_, i) => `:${i + 1}`).join(", ");
    await dbQuery(
      `DELETE FROM PRESCRIPTION WHERE PRESCRIPTION_ID IN (${placeholders})`,
      ids
    );
    res.send("Prescriptions deleted successfully");
  } catch (err) {
    console.error("Error deleting prescriptions:", err.message);
    res.status(500).send("Error deleting prescriptions");
  }
});

// ========================= Start Server =========================
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
