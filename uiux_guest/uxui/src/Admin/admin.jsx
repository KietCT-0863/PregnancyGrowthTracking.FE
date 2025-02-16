import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Wallet,
  CreditCard,
  ShoppingCart,
} from "@mui/icons-material";
import Chart from "react-apexcharts";
import AdminLayout from "./Layout/AdminLayout";

const AdminDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [revenueData, setRevenueData] = useState({
    series: [
      {
        data: [28, 40, 36, 52, 38, 60, 55],
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
    },
  });

  // Thống kê
  const stats = [
    {
      title: "Profit",
      amount: "$12,628",
      growth: "+72.80%",
      icon: <Wallet sx={{ fontSize: 40, color: "primary.main" }} />,
      positive: true,
    },
    {
      title: "Sales",
      amount: "$4,679",
      growth: "+28.42%",
      icon: <ShoppingCart sx={{ fontSize: 40, color: "success.main" }} />,
      positive: true,
    },
    {
      title: "Payments",
      amount: "$2,456",
      growth: "-14.82%",
      icon: <CreditCard sx={{ fontSize: 40, color: "error.main" }} />,
      positive: false,
    },
  ];

  // Menu xử lý
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Chào mừng Admin! 🎉
          </Typography>
          <Typography color="text.secondary">
            Đây là những gì đang diễn ra với cửa hàng của bạn hôm nay.
          </Typography>
        </Box>

        {/* Thống kê */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ p: 3, position: "relative" }}>
                <IconButton
                  sx={{ position: "absolute", right: 8, top: 8 }}
                  onClick={handleClick}
                >
                  <MoreVert />
                </IconButton>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {stat.amount}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {stat.positive ? (
                        <ArrowUpward
                          sx={{ color: "success.main", mr: 1, fontSize: 20 }}
                        />
                      ) : (
                        <ArrowDownward
                          sx={{ color: "error.main", mr: 1, fontSize: 20 }}
                        />
                      )}
                      <Typography
                        color={stat.positive ? "success.main" : "error.main"}
                        variant="body2"
                      >
                        {stat.growth}
                      </Typography>
                    </Box>
                  </Box>
                  {stat.icon}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Biểu đồ doanh thu */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Tổng Doanh Thu</Typography>
                <Box>
                  <IconButton onClick={handleClick}>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>
              <Chart
                options={revenueData.options}
                series={revenueData.series}
                type="area"
                height={350}
              />
            </Card>
          </Grid>

          {/* Thống kê đơn hàng */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Thống Kê Đơn Hàng
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tiến độ
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography
                  sx={{ mt: 1 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Hoàn thành 75% mục tiêu
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Xem chi tiết</MenuItem>
          <MenuItem onClick={handleClose}>Tải báo cáo</MenuItem>
          <MenuItem onClick={handleClose}>Cập nhật</MenuItem>
        </Menu>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
