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

const API_URL = "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog";
const POSTS_PER_PAGE = 5;

const BlogManagement = () => {
  // State Management
  const [state, setState] = useState({
    posts: [],
    filteredPosts: [],
    availableCategories: [],
    loading: true,
    page: 1,
    searchTerm: "",
    sortOption: "newest",
    selectedCategories: []
  });

  // Fetch Data
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Không thể tải danh sách bài viết");

        const { posts } = await response.json();
        const categories = extractCategories(posts);

        setState(prev => ({
          ...prev,
          posts,
          filteredPosts: posts,
          availableCategories: categories,
          loading: false
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPosts();
  }, []);
  console.log(state.posts);

  // Filter and Sort Posts
  useEffect(() => {
    const filtered = filterAndSortPosts();
    setState(prev => ({ ...prev, filteredPosts: filtered, page: 1 }));
  }, [state.posts, state.searchTerm, state.sortOption, state.selectedCategories]);

  // Helper Functions
  const extractCategories = (posts) => {
    const categoriesSet = posts.reduce((acc, post) => {
      post.categories?.forEach(category => {
        if (typeof category === 'string') acc.add(category);
      });
      return acc;
    }, new Set());
    return [...categoriesSet];
  };

  const filterAndSortPosts = () => {
    let results = [...state.posts];

    if (state.searchTerm) {
      results = results.filter(post => 
        post.title.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    if (state.selectedCategories.length) {
      results = results.filter(post =>
        post.categories?.some(cat => state.selectedCategories.includes(cat))
      );
    }

    return sortPosts(results);
  };

  const sortPosts = (posts) => {
    const sortMethods = {
      "a-z": (a, b) => a.title.localeCompare(b.title),
      "z-a": (a, b) => b.title.localeCompare(a.title),
      "newest": (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    };

    return [...posts].sort(sortMethods[state.sortOption] || sortMethods.newest);
  };

  // Event Handlers
  const handleStateChange = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryClick = (category) => {
    setState(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  // Render Components
  const renderHeader = () => (
    <Box className="blog-header">
      <Typography variant="h4" component="h1" className="blog-title">
        Danh sách bài viết
      </Typography>
      <Link to="/admin/create" className="create-blog-link">
        <Button variant="contained" color="primary">
          Tạo blog mới
        </Button>
      </Link>
    </Box>
  );

  const renderFilters = () => (
    <Box className="search-filter-container">
      <Box className="search-and-sort">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm theo tiêu đề..."
          value={state.searchTerm}
          onChange={e => handleStateChange('searchTerm', e.target.value)}
        />
        <select
          value={state.sortOption}
          onChange={e => handleStateChange('sortOption', e.target.value)}
          className="sort-select"
        >
          <option value="newest">Mới nhất</option>
          <option value="a-z">A đến Z</option>
          <option value="z-a">Z đến A</option>
        </select>
      </Box>
      <Box className="categories-container">
        {state.availableCategories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`category-button ${
              state.selectedCategories.includes(category) ? "active" : ""
            }`}
          >
            #{category}
          </button>
        ))}
      </Box>
    </Box>
  );

  const renderTable = () => {
    const displayedPosts = state.filteredPosts.slice(
      (state.page - 1) * POSTS_PER_PAGE,
      state.page * POSTS_PER_PAGE
    );

    return (
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
              <TableRow key={id}>
                <TableCell>{id}</TableCell>
                <TableCell>{title}</TableCell>
                <TableCell>{new Date(createdAt).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>
                  <div className="table-categories">
                    {categories?.map((category, index) => (
                      <span key={index} className="category-chip">
                        #{category}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Link to={`/admin/blogs/change/${id}`}>
                    <Button variant="outlined" color="primary">
                      Chỉnh sửa
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (state.loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="blog-management">
      {renderHeader()}
      {renderFilters()}
      {renderTable()}
      <Box className="pagination-container">
        <Pagination
          count={Math.ceil(state.filteredPosts.length / POSTS_PER_PAGE)}
          page={state.page}
          onChange={(_, value) => handleStateChange('page', value)}
          color="primary"
          size="large"
        />
      </Box>
    </Container>
  );
};

export default BlogManagement;
