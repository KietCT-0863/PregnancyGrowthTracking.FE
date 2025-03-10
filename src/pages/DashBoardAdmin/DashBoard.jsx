import { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChart, Line } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import CountUp from "react-countup";
import paymentService from "../../api/services/paymentService";
import userManagementService from "../../api/services/userManagementService";
import blogService from "../../api/services/blogService";
import "./Dashboard.scss";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState({
    revenue: true,
    users: true,
    posts: true
  });
  const [error, setError] = useState({
    revenue: null,
    users: null,
    posts: null
  });

  const userGrowthData = [
    { month: "Jan", users: 1000 },
    { month: "Feb", users: 1200 },
    { month: "Mar", users: 1500 },
    { month: "Apr", users: 1800 },
    { month: "May", users: 2100 },
    { month: "Jun", users: 2400 },
    { month: "Jul", users: 2700 },
  ];

  const postCategoryData = [
    { name: "Technology", value: 400 },
    { name: "Lifestyle", value: 300 },
    { name: "Business", value: 200 },
    { name: "Health", value: 100 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await paymentService.getTotalRevenue();
        setTotalRevenue(response.totalPaymentAmount || 0);
      } catch (err) {
        console.error("Error fetching total revenue:", err);
        setError(prev => ({ ...prev, revenue: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, revenue: false }));
      }
    };

    const fetchTotalUsers = async () => {
      try {
        const response = await userManagementService.getTotalUsers();
        setTotalUsers(response.totalUsers || 0);
      } catch (err) {
        console.error("Error fetching total users:", err);
        setError(prev => ({ ...prev, users: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    const fetchTotalPosts = async () => {
      try {
        const total = await blogService.getTotalPosts();
        setTotalPosts(total);
      } catch (err) {
        console.error("Error fetching total posts:", err);
        setError(prev => ({ ...prev, posts: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, posts: false }));
      }
    };

    fetchTotalRevenue();
    fetchTotalUsers();
    fetchTotalPosts();
  }, []);

  return (
    <div className="dashboard">
      <Typography variant="h4" gutterBottom className="dashboard-title">
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className="stat-card revenue">
            <Typography variant="h6">Tổng doanh thu</Typography>
            {loading.revenue ? (
              <Typography variant="h4">Đang tải...</Typography>
            ) : error.revenue ? (
              <Typography color="error">Lỗi: {error.revenue}</Typography>
            ) : (
              <Typography variant="h4">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalRevenue)}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="stat-card users">
            <Typography variant="h6">Tổng người dùng</Typography>
            {loading.users ? (
              <Typography variant="h4">Đang tải...</Typography>
            ) : error.users ? (
              <Typography color="error">Lỗi: {error.users}</Typography>
            ) : (
              <Typography variant="h4">
                {new Intl.NumberFormat('vi-VN').format(totalUsers)}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="stat-card posts">
            <Typography variant="h6">Tổng bài viết</Typography>
            {loading.posts ? (
              <Typography variant="h4">Đang tải...</Typography>
            ) : error.posts ? (
              <Typography color="error">Lỗi: {error.posts}</Typography>
            ) : (
              <Typography variant="h4">
                {new Intl.NumberFormat('vi-VN').format(totalPosts)}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper className="chart-container">
            <Typography variant="h6" gutterBottom>
              Doanh thu theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value) => 
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(value)
                  }
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="chart-container">
            <Typography variant="h6" gutterBottom>
              Phân loại bài viết
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={postCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {postCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="chart-container">
            <Typography variant="h6" gutterBottom>
              Tăng trưởng người dùng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
