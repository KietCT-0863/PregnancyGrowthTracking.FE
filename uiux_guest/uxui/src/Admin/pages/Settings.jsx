import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import AdminLayout from "../Layout/AdminLayout";

const Settings = () => {
  return (
    <AdminLayout>
      <Container>
        <Typography variant="h5" sx={{ mb: 4 }}>
          Cài Đặt Hệ Thống
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Box component="form">
            <Typography variant="h6" sx={{ mb: 3 }}>
              Thông tin chung
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên website"
                  defaultValue="Fashion Shop"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email liên hệ"
                  defaultValue="contact@fashionshop.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Mô tả website" multiline rows={3} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ mb: 3 }}>
              Cài đặt hiển thị
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Bật dark mode"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Hiện thông báo"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Bật chế độ bảo trì"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button variant="contained" color="primary">
                Lưu thay đổi
              </Button>
              <Button variant="outlined">Hủy</Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default Settings;
