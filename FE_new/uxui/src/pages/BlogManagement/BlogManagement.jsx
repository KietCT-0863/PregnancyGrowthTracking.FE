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
} from "@mui/material"
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
    <Container maxWidth="lg" className="blog-container">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom className="blog-title">
          Danh sách bài viết
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} className="table-container">
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Lượt xem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedPosts.map(({ id, title, views }) => (
                    <TableRow key={id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className="table-row">
                      <TableCell component="th" scope="row">
                        {id}
                      </TableCell>
                      <TableCell>{title}</TableCell>
                      <TableCell>{views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
      </Box>
    </Container>
  )
}

export default BlogManagement

