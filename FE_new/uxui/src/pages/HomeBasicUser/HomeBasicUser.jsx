import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  AppBar,
  Toolbar,
  Typography,
  Container,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import BasicUserNavbar from "../../components/BasicUserNavbar/BasicUserNavbar";
import BlogSlideBasicUser from "../../components/BlogSildeBasicUser/BlogSildeBasicUser";
import FooterContent from "../../components/FooterContent/FooterContent";
import "./BasicUserLayout.css";
const theme = createTheme({
  palette: {
    primary: {
      main: "#d63384",
    },
    background: {
      default: "#f8f9fa",
    },
  },
});

const HomeBasicUser = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <AppBar
          position="fixed"
          sx={{ bgcolor: "white", color: "primary.main" }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Tài khoản cơ bản
            </Typography>
            {/* <Button
              variant="contained"
              sx={{
                mr: 2,
                bgcolor: "#6a0572",
                "&:hover": {
                  bgcolor: "#4a0350",
                },
                transition: "background-color 0.3s",
              }}
              onClick={() => navigate("/admin")}
            >
              Xem Admin Layout
            </Button> */}
            {/* <Button
              variant="outlined"
              sx={{
                borderColor: "#d63384",
                color: "#d63384",
                "&:hover": {
                  borderColor: "#b52b6f",
                  bgcolor: "rgba(214, 51, 132, 0.1)",
                },
                transition: "all 0.3s",
              }}
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button> */}
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1, pt: "64px" }}>
          <BasicUserNavbar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Container maxWidth="lg">
              <Outlet />
      
              <BlogSlideBasicUser className="slide-in" />
            </Container>
          </Box>
        </Box>

        <FooterContent />
      </Box>
    </ThemeProvider>
  );
};

export default HomeBasicUser;
