import { Grid, Paper, Typography } from "@mui/material";

const Dashboard = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Tổng doanh thu</Typography>
          <Typography variant="h4">100,000,000 VNĐ</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Tổng người dùng</Typography>
          <Typography variant="h4">1,234</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Tổng bài viết</Typography>
          <Typography variant="h4">567</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
