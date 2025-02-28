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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const postsPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog"
        );
        if (!response.ok) throw new Error("Không thể tải danh sách bài viết");

        const data = await response.json();
        setPosts(data);

        // Tạo danh sách categories duy nhất
        const allCategories = data.reduce((acc, post) => {
          const postCategories =
            post.categories?.map((cat) => cat.categoryName) || [];
          return [...acc, ...postCategories];
        }, []);
        const uniqueCategories = [...new Set(allCategories)];
        setAvailableCategories(uniqueCategories);
        setFilteredPosts(data);
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

      // Lọc theo categories
      if (selectedCategories.length > 0) {
        results = results.filter((post) =>
          selectedCategories.every((category) =>
            post.categories?.some((cat) => cat.categoryName === category)
          )
        );
      }

      // Sắp xếp kết quả
      results = sortPosts(results);
      setFilteredPosts(results);
      setPage(1);
    };

    filterAndSortPosts();
  }, [searchTerm, posts, sortOption, selectedCategories]);

  const handleCategoryClick = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
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
          </select>
        </Box>

        <Box className="categories-container">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`category-button ${
                selectedCategories.includes(category) ? "active" : ""
              }`}
            >
              #{category}
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
                  <TableCell>Categories</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedPosts.map(({ id, title, createdAt, categories }) => (
                  <TableRow key={id} className="table-row">
                    <TableCell>{id}</TableCell>
                    <TableCell>{title}</TableCell>
                    <TableCell>
                      {new Date(createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <div className="table-categories">
                        {categories?.map((cat) => (
                          <span
                            key={cat.categoryName}
                            className="category-chip"
                          >
                            #{cat.categoryName}
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
