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
import "./Dashboard.scss";

const Dashboard = () => {
  const revenueData = [
    { month: "Jan", revenue: 65000000 },
    { month: "Feb", revenue: 59000000 },
    { month: "Mar", revenue: 80000000 },
    { month: "Apr", revenue: 81000000 },
    { month: "May", revenue: 56000000 },
    { month: "Jun", revenue: 55000000 },
    { month: "Jul", revenue: 40000000 },
  ];

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

  return (
    <div className="dashboard">
      <Typography variant="h4" gutterBottom className="dashboard-title">
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className="stat-card revenue">
            <Typography variant="h6">Tổng doanh thu</Typography>
            <Typography variant="h4">
              <CountUp end={100000000} duration={2.5} separator="," /> VNĐ
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="stat-card users">
            <Typography variant="h6">Tổng người dùng</Typography>
            <Typography variant="h4">
              <CountUp end={2700} duration={2.5} separator="," />
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="stat-card posts">
            <Typography variant="h6">Tổng bài viết</Typography>
            <Typography variant="h4">
              <CountUp end={1000} duration={2.5} separator="," />
            </Typography>
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
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
