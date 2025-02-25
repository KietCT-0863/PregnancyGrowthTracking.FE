"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Container,
  Pagination,
  CircularProgress,
  Button,
} from "@mui/material"
import { Link } from "react-router-dom"
import "./BlogManagement.scss"

const BlogManagement = () => {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const postsPerPage = 5

  useEffect(() => {
    setLoading(true)
    fetch("https://dummyjson.com/posts")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts)
        setLoading(false)
      })
  }, [])

  const handleChangePage = (event, value) => {
    setPage(value)
  }

  const displayedPosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage)

  return (
    <Container maxWidth="lg" className="blog-management">
      <Box className="blog-header">
        <Typography variant="h4" component="h1" className="blog-title">
          Danh sách bài viết
        </Typography>
        <Link to="/admin/create" className="create-blog-link">
          <Button variant="contained" color="primary" className="create-blog-button">
            Tạo blog mới
          </Button>
        </Link>
      </Box>
      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} className="table-container">
            <Table aria-label="blog posts table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Lượt xem</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedPosts.map(({ id, title, views }) => (
                  <TableRow key={id} className="table-row">
                    <TableCell component="th" scope="row">
                      {id}
                    </TableCell>
                    <TableCell>{title}</TableCell>
                    <TableCell>{views}</TableCell>
                    <TableCell>
                      <Link to={`/admin/blogs/change/${id}`} className="edit-link">
                        <Button variant="outlined" color="primary" className="edit-button">
                          Chỉnh sửa
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="pagination-container">
            <Pagination
              count={Math.ceil(posts.length / postsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
              size="large"
              className="pagination"
            />
          </Box>
        </>
      )}
    </Container>
  )
}

export default BlogManagement

