import React from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import AdminLayout from "../Layout/AdminLayout";

const Orders = () => {
  const orders = [
    {
      id: "#ORD001",
      customer: "Nguyễn Văn A",
      date: "2024-01-20",
      total: "1,200,000 đ",
      status: "Đã giao",
    },
    {
      id: "#ORD002",
      customer: "Trần Thị B",
      date: "2024-01-19",
      total: "850,000 đ",
      status: "Đang xử lý",
    },
    // Thêm dữ liệu mẫu khác
  ];

  return (
    <AdminLayout>
      <Container>
        <Typography variant="h5" sx={{ mb: 4 }}>
          Quản Lý Đơn Hàng
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={order.status === "Đã giao" ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </AdminLayout>
  );
};

export default Orders;
