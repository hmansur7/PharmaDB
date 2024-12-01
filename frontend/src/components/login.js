import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography, Container } from "@mui/material";

function Login() {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        padding: 0,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          width: "100%",
          maxWidth: "400px", // Restrict width of content
        }}
      >
        <Typography
          variant="h4"
          sx={{ marginBottom: 4, color: "#333", fontWeight: "bold" }}
        >
          Welcome! Please Choose Your Role
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#555",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
                borderRadius: "30px",
                padding: "10px 20px",
                fontSize: "16px",
                textTransform: "uppercase",
                fontWeight: "500",
              }}
              fullWidth
            >
              Admin
            </Button>
          </Link>
          <Link to="/doctor" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#555",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
                borderRadius: "30px",
                padding: "10px 20px",
                fontSize: "16px",
                textTransform: "uppercase",
                fontWeight: "500",
              }}
              fullWidth
            >
              Doctor
            </Button>
          </Link>
          <Link to="/employee" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#555",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
                borderRadius: "30px",
                padding: "10px 20px",
                fontSize: "16px",
                textTransform: "uppercase",
                fontWeight: "500",
              }}
              fullWidth
            >
              Pharmacist
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
