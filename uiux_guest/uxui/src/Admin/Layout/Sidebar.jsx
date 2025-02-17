import React from "react";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  People,
  ShoppingCart,
  Article,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AdminDashboard from "../admin";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 260;

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Dashboard />,
      path: "/admin",
    },
    {
      title: "Quản lý đơn hàng",
      icon: <ShoppingCart />,
      path: "/admin/orders",
    },
    {
      title: "Quản lý người dùng",
      icon: <People />,
      path: "/admin/users",
    },
    {
      title: "Quản lý Blog",
      icon: <Article />,
      path: "/admin/blogs",
    },
    {
      title: "Cài đặt",
      icon: <Settings />,
      path: "/admin/settings",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "background.default",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          <AdminDashboard />
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: isActive(item.path) ? "primary.light" : "transparent",
                color: isActive(item.path) ? "primary.main" : "text.primary",
                "&:hover": {
                  bgcolor: "primary.lighter",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? "bold" : "normal",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
