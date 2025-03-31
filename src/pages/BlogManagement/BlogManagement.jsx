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
  Sort as SortIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import blogService from "../../api/services/blogService";

const ITEMS_PER_PAGE = 9;
const TINYMCE_API_KEY = 'wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp';
const AVAILABLE_CATEGORIES = [
  " Sức khỏe thai kỳ",
  "Dinh dưỡng mẹ bầu",
  "Phát triển thai nhi",
  "Triệu chứng thai kỳ",
  "Xét nghiệm & siêu âm",
  "Tập thể dục bầu",
  "Chuẩn bị đồ sơ sinh",
  "Sinh thường & sinh mổ",
  "Lịch khám thai",
  "Bệnh lý thai kỳ",
  "Giảm căng thẳng",
  "Tâm lý mẹ bầu",
  "Đặt tên cho bé",
  "Làm đẹp khi mang thai",
  "Chuẩn bị tài chính",
  "Lập kế hoạch sinh",  
  "Chăm sóc trẻ sơ sinh",
  "Nuôi con bằng sữa mẹ",
  "Dạy thai nhi thông minh",  
  "Dấu hiệu chuyển dạ",

];

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    categories: []
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const fetchBlogs = async () => {
    try {
      console.log('Fetching blogs...');
      const response = await blogService.getBlogs();
      console.log('API Response:', response); // Kiểm tra response

      // Kiểm tra cấu trúc dữ liệu và set blogs
      if (response && Array.isArray(response)) {
        setBlogs(response);
      } else if (response && Array.isArray(response.posts)) {
        setBlogs(response.posts);
      } else if (response && response.data && Array.isArray(response.data)) {
        setBlogs(response.data);
      } else {
        console.error('Unexpected data structure:', response);
        toast.error('Không thể tải danh sách bài viết');
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error(error.message || "Không thể tải danh sách bài viết");
    }
  };

  // Thêm useEffect để log blogs state
  useEffect(() => {
    console.log('Current blogs:', blogs);
    console.log('Current filtered blogs:', filteredBlogs);
  }, [blogs, filteredBlogs]);

  // Cập nhật filterAndSortBlogs
  const filterAndSortBlogs = () => {
    console.log('Filtering and sorting blogs. Current blogs:', blogs);
    if (!Array.isArray(blogs)) {
      console.error('blogs is not an array:', blogs);
      return;
    }

    let filtered = [...blogs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog => 
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(blog => 
        blog.categories?.some(cat => 
          (typeof cat === 'string' ? cat : cat.categoryName) === selectedCategory
        )
      );
    }

    // Sort by ID
    filtered.sort((a, b) => {
      return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
    });

    console.log('Filtered blogs:', filtered);
    setFilteredBlogs(filtered);
  };

  // Đảm bảo fetchBlogs được gọi khi component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Đảm bảo filterAndSortBlogs được gọi khi blogs thay đổi
  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchTerm, selectedCategory, sortOrder]);

  const handleEdit = (blog) => {
    console.log('Editing blog:', blog);
    setSelectedBlog(blog);
    
    // Format categories
    const formattedCategories = blog.categories.map(cat => 
      typeof cat === 'string' ? cat : cat.categoryName
    );
    console.log('Formatted categories:', formattedCategories);
    
    // Set form data
    setFormData({
      title: blog.title,
      body: blog.body,
      categories: formattedCategories
    });
    
    // Set image preview from blog's existing image
    if (blog.imageUrl) {
      console.log('Setting existing image preview:', blog.imageUrl);
      setImagePreview(blog.imageUrl);
    } else if (blog.blogPhotoUrl) {
      console.log('Setting existing image preview from blogPhotoUrl:', blog.blogPhotoUrl);
      setImagePreview(blog.blogPhotoUrl);
    } else {
      console.log('No existing image found for blog');
      setImagePreview(null);
    }
    
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    console.log('Initializing new blog creation');
    setSelectedBlog(null);
    setFormData({
      title: "",
      body: "",
      categories: []
    });
    setSelectedImage(null);
    setImagePreview(null);
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
      });

      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        console.log('Invalid file type:', file.type);
        toast.error("Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG");
        return;
      }

      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      console.log('Preview URL created:', previewUrl);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      let blogId;
      console.log('Starting blog submission...', {
        editMode,
        formData,
        hasImage: !!selectedImage
      });
      
      if (editMode) {
        console.log('Updating existing blog:', selectedBlog.id);
        await blogService.updateBlog(selectedBlog.id, formData);
        blogId = selectedBlog.id;
      } else {
        console.log('Creating new blog with data:', formData);
        const response = await blogService.createBlog(formData);
        console.log('Blog created with response:', response);
        blogId = response.id;
      }

      // Upload ảnh nếu có
      if (selectedImage && blogId) {
        console.log('Uploading image for blog:', {
          blogId,
          imageSize: `${(selectedImage.size / (1024 * 1024)).toFixed(2)}MB`,
          imageType: selectedImage.type
        });

        if (editMode) {
          console.log('Replacing existing blog photo');
          const photoResponse = await blogService.replaceBlogPhoto(blogId, selectedImage);
          console.log('Photo replace response:', photoResponse);
        } else {
          console.log('Uploading new blog photo');
          const photoResponse = await blogService.uploadBlogPhoto(blogId, selectedImage);
          console.log('Photo upload response:', photoResponse);
        }
      }

      console.log('Blog operation completed successfully');
      toast.success(`${editMode ? 'Cập nhật' : 'Tạo'} bài viết thành công!`);
      setOpenDialog(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error in blog operation:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data
      });
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
            {displayedBlogs.length > 0 ? (
              displayedBlogs.map((blog) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có bài viết nào
                </TableCell>
              </TableRow>
            )}
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

          {/* Image Upload Section */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ảnh bài viết
            </Typography>
            {imagePreview && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.src = '/placeholder-blog.jpg';
                  }}
                />
              </Box>
            )}
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
            >
              {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
              <input
                type="file"
                hidden
                onChange={handleImageChange}
                accept="image/*"
              />
            </Button>
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
