import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../src/components/SideBar/SideBar";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';

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

const AdminLayout = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Example of fetching user info, adjust according to your actual data fetching logic
  useEffect(() => {
    // Fetch user info from API or context/store
    const fetchUserInfo = async () => {
      try {
        // Placeholder để thay thế, gắn với fetchUserInfo thực tế sau này
        const userData = { name: "Admin User", role: "admin" };
        setUserInfo(userData);
        // Log chỉ với giá trị cố định, không sử dụng state để tránh re-render
        console.log("User info fetched successfully");
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
    // Loại bỏ userInfo khỏi dependency array để tránh vòng lặp vô hạn
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    navigate('/login');
  };

  const handleViewBasicUser = () => {
    navigate('/basic-user');
  };
  
  const handleViewMember = () => {
    navigate('/member');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            <Button 
              variant="outlined"
              sx={{ 
                borderColor: '#fff',
                color: '#fff',
                mr: 2,
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={handleViewBasicUser}
            >
              Xem trang Basic User
            </Button>
            <Button 
              variant="outlined"
              sx={{ 
                borderColor: '#fff',
                color: '#fff',
                mr: 2,
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={handleViewMember}
            >
              Xem trang Member
            </Button>
            <Button 
              variant="outlined"
              sx={{ 
                borderColor: '#fff',
                color: '#fff',
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Toolbar>
        </AppBar>

        <Sidebar />
        
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
          <Box sx={{ height: '64px' }} />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;