import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import MedicationIcon from "@mui/icons-material/Medication";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import Medications from "../Medications";
import Prescriptions from "./Prescriptions";
import Patients from "../Patients"; // Corrected path to Patients.js
import Login from "../login";

const EmployeePanel = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navItems = [
    { text: "Account", icon: <PersonIcon />, path: "/employee/account" },
    {
      text: "Medications",
      icon: <MedicationIcon />,
      path: "/employee/medications",
    },
    {
      text: "Prescriptions",
      icon: <TextSnippetIcon />,
      path: "/employee/prescriptions",
    },
    {
      text: "Patients",
      icon: <PeopleAltIcon />,
      path: "/employee/patients", // Correct path for Patients
    },
    { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Employee Panel
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "80%", sm: 240 },
            boxSizing: "border-box",
          },
        }}
      >
        <List>
          {navItems.map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleNavigation(item)}
              sx={
                item.text === "Logout"
                  ? {
                      "&:hover": {
                        backgroundColor: "red",
                        "& .MuiListItemIcon-root": { color: "white" },
                        "& .MuiListItemText-root": { color: "white" },
                      },
                      "& .MuiListItemIcon-root": { color: "inherit" },
                      "& .MuiListItemText-root": { color: "inherit" },
                    }
                  : {}
              }
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          maxWidth: "100%",
          overflowX: "hidden",
          marginTop: { xs: "56px", sm: "64px" },
        }}
      >
        <Routes>
          <Route path="medications" element={<Medications />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="patients" element={<Patients />} /> {/* Correct route */}
          <Route
            path="logout"
            element={<Login />}
          />
          <Route path="/" element={<Navigate to="medications" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default EmployeePanel;
