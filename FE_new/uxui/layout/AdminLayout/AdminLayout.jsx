import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../src/components/SideBar/SideBar";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d63384', // Pink color từ theme hiện tại
    },
    background: {
      default: '#f5f5f5',
    },
  },
});


const handleLogout = () => {
  localStorage.removeItem("token")
  setIsLoggedIn(false)
  setUserInfo(null)
  setIsAdmin(false)
  navigate('/login')
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Example of fetching user info, adjust according to your actual data fetching logic
  useEffect(() => {
    // Fetch user info from API or context/store
    const fetchUserInfo = async () => {
      const userData = await getUserInfo(); // Define getUserInfo or use actual data fetching logic
      setUserInfo(userData);
    };

    fetchUserInfo();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'primary.main', ml: '240px' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            {/* Thêm các nút chuyển đổi layout */}
            <Button 
              variant="contained" 
              sx={{ 
                mr: 2,
                bgcolor: '#6a0572',
                '&:hover': {
                  bgcolor: '#4a0350'
                }
              }}
              onClick={() => navigate('/basic-user/blog')}
            >
              Xem Basic User Layout
            </Button>
            <Button 
              variant="outlined" 
              sx={{ 
                borderColor: '#d63384',
                color: '#d63384',
                '&:hover': {
                  borderColor: '#b52b6f',
                  bgcolor: 'rgba(214, 51, 132, 0.1)'
                }
              }}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Toolbar>
        </AppBar>

        {/* Sidebar cố định bên trái */}
        <Sidebar />
        
        {/* Content chính */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            marginLeft: '240px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Để tránh content bị che bởi sidebar */}
          <Box sx={{ height: '64px' }} /> 
          
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;