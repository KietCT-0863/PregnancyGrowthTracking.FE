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
  IconButton,
  Chip,
  Button,
  Box,
} from "@mui/material";
import { Edit, Delete, Visibility, PostAdd } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";

const Blogs = () => {
  const navigate = useNavigate();
  const blogs = [
    {
      id: 1,
      title: "Top 10 xu hướng thời trang 2024",
      author: "Nguyễn Văn A",
      category: "Thời trang",
      status: "Đã đăng",
      date: "2024-01-20",
      views: 1200,
    },
    {
      id: 2,
      title: "Cách phối đồ mùa đông",
      author: "Trần Thị B",
      category: "Thời trang",
      status: "Nháp",
      date: "2024-01-19",
      views: 800,
    },
    // Thêm dữ liệu mẫu khác
  ];

  return (
    <AdminLayout>
      <Container>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h5">Quản Lý Bài Viết</Typography>
          <Button
            variant="contained"
            startIcon={<PostAdd />}
            onClick={() => navigate("/admin/blogs/create")}
          >
            Tạo bài viết mới
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Ngày đăng</TableCell>
                <TableCell>Lượt xem</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>{blog.date}</TableCell>
                  <TableCell>{blog.views}</TableCell>
                  <TableCell>
                    <Chip
                      label={blog.status}
                      color={blog.status === "Đã đăng" ? "success" : "default"}
                      size="small"
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

export default Blogs;
