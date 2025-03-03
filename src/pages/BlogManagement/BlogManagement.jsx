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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  Grid,
  Pagination,
  Stack,
  InputAdornment
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Sort as SortIcon 
} from '@mui/icons-material';
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import blogService from "../../api/services/blogService";

const ITEMS_PER_PAGE = 9;
const TINYMCE_API_KEY = 'p7vx8ligttfy5s34mknoi6alrwd1qd8xvyw9dezem3vvdvla';
const AVAILABLE_CATEGORIES = [
  "french", "fiction", "english", "history", "magical",
  "american", "mystery", "crime", "love", "classic"
];

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    categories: []
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchTerm, selectedCategory, sortOrder]);

  const filterAndSortBlogs = () => {
    let filtered = [...blogs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(blog => 
        blog.categories.some(cat => 
          (typeof cat === 'string' ? cat : cat.categoryName) === selectedCategory
        )
      );
    }

    // Sort by ID
    filtered.sort((a, b) => {
      return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
    });

    setFilteredBlogs(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const fetchBlogs = async () => {
    try {
      const data = await blogService.getBlogs();
      setBlogs(data.posts || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    }
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      body: blog.body,
      categories: blog.categories.map(cat => 
        typeof cat === 'string' ? cat : cat.categoryName
      )
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setSelectedBlog(null);
    setFormData({
      title: "",
      body: "",
      categories: []
    });
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    
    try {
      await blogService.deleteBlog(id);
      toast.success("Xóa bài viết thành công!");
      fetchBlogs();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await blogService.updateBlog(selectedBlog.id, formData);
      } else {
        await blogService.createBlog(formData);
      }

      toast.success(`${editMode ? 'Cập nhật' : 'Tạo'} bài viết thành công!`);
      setOpenDialog(false);
      fetchBlogs();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedBlogs = filteredBlogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Quản lý bài viết</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Tạo bài viết mới
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Danh mục"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {AVAILABLE_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sắp xếp theo ID</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Sắp xếp theo ID"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="desc">Bài viết mới nhất</MenuItem>
              <MenuItem value="asc">Bài viết cũ nhất</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedBlogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell>{blog.id}</TableCell>
                <TableCell>{blog.title}</TableCell>
                <TableCell>
                  {blog.categories?.map(cat => 
                    <Chip 
                      key={typeof cat === 'string' ? cat : cat.categoryName}
                      label={typeof cat === 'string' ? cat : cat.categoryName}
                      sx={{ mr: 0.5, mb: 0.5 }}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEdit(blog)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(blog.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={2}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      </Box>

      {/* Edit/Create Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          {editMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
            error={!formData.title.trim()}
            helperText={!formData.title.trim() && "Tiêu đề không được để trống"}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Danh mục</InputLabel>
            <Select
              multiple
              value={formData.categories}
              onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
              input={<OutlinedInput label="Danh mục" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {AVAILABLE_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Editor
              apiKey={TINYMCE_API_KEY}
              value={formData.body}
              onEditorChange={(content) => setFormData({ ...formData, body: content })}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.title.trim() || !formData.body.trim()}
          >
            {editMode ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogManagement;
