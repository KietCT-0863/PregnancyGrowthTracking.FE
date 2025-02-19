import { Outlet, useNavigate } from "react-router-dom";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import BasicUserNavbar from "../../src/components/BasicUserNavbar/BasicUserNavbar";
const theme = createTheme({
  palette: {
    primary: {
      main: '#d63384',
    },
    background: {
      default: '#f8f9fa',
    },
  },
});

const BasicUserLayout = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'primary.main' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Tài khoản cơ bản
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                mr: 2,
                bgcolor: '#6a0572',
                '&:hover': {
                  bgcolor: '#4a0350'
                }
              }}
              onClick={() => navigate('/admin')}
            >
              Xem Admin Layout
            </Button>
            <Button 
              variant="outlined" 
              sx={{ 
                mr: 2,
                borderColor: '#d63384',
                color: '#d63384',
                '&:hover': {
                  borderColor: '#b52b6f',
                  bgcolor: 'rgba(214, 51, 132, 0.1)'
                }
              }}
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
          </Toolbar>
        </AppBar>


        <BasicUserNavbar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            marginLeft: '240px',
            marginTop: '64px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BasicUserLayout; 