import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: "100vh",
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
