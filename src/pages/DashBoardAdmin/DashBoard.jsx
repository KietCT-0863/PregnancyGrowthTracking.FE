import { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import CountUp from "react-countup";
import paymentService from "../../api/services/paymentService";
import userManagementService from "../../api/services/userManagementService";
import blogService from "../../api/services/blogService";
import "./Dashboard.scss";
import axiosInstance from "../../api/config/axiosConfig";
import { ENDPOINTS } from "../../api/constants/apiEndpoints";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState({
    revenue: true,
    users: true,
    posts: true,
  });
  const [error, setError] = useState({
    revenue: null,
    users: null,
    posts: null,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [errorMonthly, setErrorMonthly] = useState(null);
  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [loadingMonthlyUsers, setLoadingMonthlyUsers] = useState(true);
  const [errorMonthlyUsers, setErrorMonthlyUsers] = useState(null);

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
        setError((prev) => ({ ...prev, revenue: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, revenue: false }));
      }
    };

    const fetchTotalUsers = async () => {
      try {
        const response = await userManagementService.getTotalUsers();
        setTotalUsers(response.totalUsers || 0);
      } catch (err) {
        console.error("Error fetching total users:", err);
        setError((prev) => ({ ...prev, users: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    const fetchTotalPosts = async () => {
      try {
        const total = await blogService.getTotalPosts();
        setTotalPosts(total);
      } catch (err) {
        console.error("Error fetching total posts:", err);
        setError((prev) => ({ ...prev, posts: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, posts: false }));
      }
    };

    const fetchMonthlyRevenue = async () => {
      try {
        setLoadingMonthly(true);
        const data = await paymentService.getMonthlyRevenue();
        console.log("Dữ liệu doanh thu theo tháng:", data);
        console.log("Cấu trúc của một item:", data[0]);
        setMonthlyRevenue(data);
        setErrorMonthly(null);
      } catch (err) {
        console.error("Chi tiết lỗi khi lấy doanh thu theo tháng:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response);
        setErrorMonthly(err.message);
      } finally {
        setLoadingMonthly(false);
      }
    };

    const fetchMonthlyUsers = async () => {
      try {
        setLoadingMonthlyUsers(true);
        const data = await userManagementService.getMonthlyUserCount();
        setMonthlyUsers(data);
        setErrorMonthlyUsers(null);
      } catch (err) {
        console.error("Lỗi khi lấy số liệu người dùng theo tháng:", err);
        setErrorMonthlyUsers(err.message);
      } finally {
        setLoadingMonthlyUsers(false);
      }
    };

    fetchTotalRevenue();
    fetchTotalUsers();
    fetchTotalPosts();
    fetchMonthlyRevenue();
    fetchMonthlyUsers();
  }, []);

  const getMonthlyUserCount = async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.USER_MANAGEMENT.GET_MONTHLY_USERS
      );
      console.log("Raw response:", response.data);

      // Format dữ liệu cho biểu đồ
      const formattedData = response.data.map((item) => ({
        month: `${item.month}`, // Giữ nguyên định dạng tháng
        users: parseInt(item.users || 0), // Chuyển đổi sang số
        growthRate: 0,
      }));

      // Tính tỷ lệ tăng trưởng
      formattedData.forEach((item, index) => {
        if (index > 0) {
          const prevUsers = formattedData[index - 1].users;
          const currentUsers = item.users;
          if (prevUsers > 0) {
            item.growthRate = ((currentUsers - prevUsers) / prevUsers) * 100;
          }
        }
      });

      console.log("Formatted data:", formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching monthly user count:", error);
      throw error;
    }
  };

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
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
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
                {new Intl.NumberFormat("vi-VN").format(totalUsers)}
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
                {new Intl.NumberFormat("vi-VN").format(totalPosts)}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper className="chart-container">
            <Typography variant="h6" gutterBottom>
              Doanh thu theo tháng
            </Typography>
            {loadingMonthly ? (
              <div className="loading-state">Đang tải dữ liệu...</div>
            ) : errorMonthly ? (
              <div className="error-state">Lỗi: {errorMonthly}</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Doanh thu") {
                        return new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value);
                      }
                      return value;
                    }}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#8884d8"
                    name="Doanh thu"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff7300"
                    name="Tăng trưởng"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
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
              Tăng trưởng người dùng theo tháng
            </Typography>
            {loadingMonthlyUsers ? (
              <div className="loading-state">Đang tải dữ liệu...</div>
            ) : errorMonthlyUsers ? (
              <div className="error-state">Lỗi: {errorMonthlyUsers}</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => {
                      if (!value) return "";
                      return value;
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN").format(value)
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Tỷ lệ tăng") {
                        return `${value.toFixed(2)}%`;
                      }
                      return new Intl.NumberFormat("vi-VN").format(value);
                    }}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="users"
                    fill="#82ca9d"
                    name="Số người dùng"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthRate"
                    stroke="#ff7300"
                    name="Tỷ lệ tăng"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
