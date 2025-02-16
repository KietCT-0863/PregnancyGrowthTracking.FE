import { useEffect, useState } from "react";

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
  Button,
  Box,
} from "@mui/material"
import { Edit, Delete, Visibility, PostAdd } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../Layout/AdminLayout";

import "./blogs.scss"

const Blogs = () => {
  const navigate = useNavigate()
const [blogs, setBlogs] = useState([]);

useEffect(() => {
  fetch("https://dummyjson.com/c/3eab-a9ac-417d-bcd5") 
    .then((response) => response.json())
    .then((data) => {
      setBlogs(data);
      console.log( data);
    })
    .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
}, []);

  return (
    <AdminLayout>
      <Container className="blogs-container">
        {/* Header */}
        <Box className="header fade-in">
          <Typography variant="h5">Quản Lý Bài Viết</Typography>
          <Button variant="contained" startIcon={<PostAdd />} onClick={() => navigate("/admin/blogs/create")}>
            Tạo bài viết mới
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} className="table-container fade-in">
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
              {blogs.map(({ id, title, author, category, date, views, status }) => (
                <TableRow key={id}>
                  <TableCell>{title}</TableCell>
                  <TableCell>{author}</TableCell>
                  <TableCell>{category}</TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{views}</TableCell>
                  <TableCell>
                    <span className={`status-chip ${status === "Đã đăng" ? "published" : "draft"}`}>
                      {status}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="actions">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </AdminLayout>
  )
}

export default Blogs
