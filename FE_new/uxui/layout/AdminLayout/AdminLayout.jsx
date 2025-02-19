import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../src/components/SideBar/SideBar";
import { Box, Button } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

  // Thêm hàm xử lý quay lại Guest Layout
  const handleBackToGuest = () => {
    navigate('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
          
          {/* Thêm nút quay lại */}
          <Button
            variant="contained"
            sx={{
              bgcolor: '#d63384',
              color: 'white',
              mb: 2,
              alignSelf: 'flex-start',
              '&:hover': {
                bgcolor: '#b52b6f'
              }
            }}
            onClick={handleBackToGuest}
          >
            Quay lại trang chủ
          </Button>
          
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;