import { Typography, Paper } from "@mui/material";

const UserManagement = () => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Quản lý người dùng
      </Typography>
      <Paper sx={{ p: 2 }}>
        {/* Nội dung quản lý người dùng */}
        <Typography>Danh sách người dùng</Typography>
      </Paper>
    </>
  );
};

export default UserManagement;
