"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import "./BlogManagement.scss";

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const postsPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://dummyjson.com/posts");
        if (!response.ok) throw new Error("Không thể tải danh sách bài viết");
        const data = await response.json();

        // Thêm trường createdAt và views giả lập
        const postsWithExtra = data.posts.map((post) => ({
          ...post,
          createdAt: new Date(
            2024 - Math.floor(Math.random() * 2),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28)
          ).toISOString(),
          views: Math.floor(Math.random() * 1000),
        }));
        setPosts(postsWithExtra);

        // Tạo danh sách tags duy nhất
        const allTags = postsWithExtra.reduce((tags, post) => {
          return [...tags, ...(post.tags || [])];
        }, []);
        const uniqueTags = [...new Set(allTags)];
        setAvailableTags(uniqueTags);
        setFilteredPosts(postsWithExtra);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const sortPosts = (postsToSort) => {
    const sorted = [...postsToSort];
    switch (sortOption) {
      case "a-z":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "popular":
        return sorted.sort((a, b) => b.views - a.views);
      default:
        return sorted;
    }
  };

  useEffect(() => {
    const filterAndSortPosts = () => {
      let results = [...posts];

      // Lọc theo search term
      if (searchTerm) {
        results = results.filter((post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Lọc theo tags
      if (selectedTags.length > 0) {
        results = results.filter((post) =>
          selectedTags.every((tag) => post.tags?.includes(tag))
        );
      }

      // Sắp xếp kết quả
      results = sortPosts(results);
      setFilteredPosts(results);
      setPage(1); // Reset về trang 1 khi filter thay đổi
    };

    filterAndSortPosts();
  }, [searchTerm, posts, sortOption, selectedTags]);

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const displayedPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <Container maxWidth="lg" className="blog-management">
      <Box className="blog-header">
        <Typography variant="h4" component="h1" className="blog-title">
          Danh sách bài viết
        </Typography>
        <Link to="/admin/create" className="create-blog-link">
          <Button
            variant="contained"
            color="primary"
            className="create-blog-button"
          >
            Tạo blog mới
          </Button>
        </Link>
      </Box>

      <Box className="search-filter-container">
        <Box className="search-and-sort">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="a-z">A đến Z</option>
            <option value="z-a">Z đến A</option>
            <option value="popular">Phổ biến nhất</option>
          </select>
        </Box>

        <Box className="tags-container">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`tag-button ${
                selectedTags.includes(tag) ? "active" : ""
              }`}
            >
              {tag}
            </button>
          ))}
        </Box>
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
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Lượt xem</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedPosts.map(({ id, title, createdAt, views, tags }) => (
                  <TableRow key={id} className="table-row">
                    <TableCell>{id}</TableCell>
                    <TableCell>{title}</TableCell>
                    <TableCell>
                      {new Date(createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{views}</TableCell>
                    <TableCell>
                      <div className="table-tags">
                        {tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/blogs/change/${id}`}
                        className="edit-link"
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          className="edit-button"
                        >
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
              count={Math.ceil(filteredPosts.length / postsPerPage)}
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
  );
};

export default BlogManagement;
