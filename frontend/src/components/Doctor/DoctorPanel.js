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
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import Patients from "../Patients";
import Prescriptions from "../Prescriptions";
import Medications from "../Medications";
import Login from "../login";
import MedicationIcon from "@mui/icons-material/Medication";

const DoctorPanel = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navItems = [
    {
      text: "Medications",
      icon: <MedicationIcon />,
      path: "/doctor/medications", // Correct path
    },
    {
      text: "Prescriptions",
      icon: <TextSnippetIcon />,
      path: "/doctor/prescriptions",
    },
    {
      text: "Patients",
      icon: <PeopleAltIcon />,
      path: "/doctor/patients",
    },
    { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];

  console.log(navItems);

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
            Doctor Panel
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
            marginTop: { xs: "56px", sm: "64px" }, // Adjust to match AppBar height
          },
        }}
      >
        <List>
          {navItems.map((item, index) => (
            <ListItem button key={index} onClick={() => handleNavigation(item)}>
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
          <Route path="patients" element={<Patients />} />
          <Route path="logout" element={<Login />} />
          <Route path="/" element={<Navigate to="prescriptions" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DoctorPanel;
