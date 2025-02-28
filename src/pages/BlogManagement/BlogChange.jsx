import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { ToastContainer, toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Paper
} from '@mui/material';
import "./BlogChange.scss";

const API_URL = "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog";

const AVAILABLE_CATEGORIES = [
  "french", "fiction", "english", "history", "magical",
  "american", "mystery", "crime", "love", "classic"
];

const EDITOR_CONFIG = {
  plugins: ["anchor", "autolink", "charmap", "lists", "media", "table"],
  toolbar: "undo redo | blocks | bold italic | link image | align | lists",
  height: 400
};

const BlogChange = ({ open, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState({
    title: "",
    body: "",
    categories: [],
    image: ""
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error("Không thể tải dữ liệu");
        
        const { posts } = await response.json();
        const blogPost = posts.find(post => post.id === parseInt(id));

        if (blogPost) {
          const formattedCategories = blogPost.categories?.map(cat => 
            typeof cat === 'string' ? cat : cat.categoryName
          ) || [];

          setPost({
            title: blogPost.title || "",
            body: blogPost.body || "",
            categories: formattedCategories,
            image: blogPost.image || ""
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Không thể tải thông tin bài viết!");
      }
    };

    if (id) fetchBlog();
  }, [id]);
  
  console.log(post);
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const formattedCategories = post.categories.map(cat => 
        typeof cat === 'string' ? cat : cat.categoryName
      );

      const requestBody = {
        id: parseInt(id),
        title: post.title || "",
        body: post.body || "",
        categories: formattedCategories,
        image: post.image || "",
      };

      console.log('Request body:', requestBody);

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Lỗi server');
      }
      
      toast.success("Cập nhật bài viết thành công!");
      setTimeout(() => navigate("/admin/blogs"), 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleCategoryToggle = (category) => {
    setPost(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>Chỉnh sửa Blog</DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <Box>
            <h4>Tiêu đề</h4>
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              value={post.title}
              init={{
                ...EDITOR_CONFIG,
                height: 100,
                menubar: false
              }}
              onEditorChange={(content) => setPost(prev => ({ ...prev, title: content }))}
            />
          </Box>

          <Box>
            <h4>Nội dung</h4>
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              value={post.body}
              init={EDITOR_CONFIG}
              onEditorChange={(content) => setPost(prev => ({ ...prev, body: content }))}
            />
          </Box>

          <Box>
            <h4>Danh mục</h4>
            <Paper sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {AVAILABLE_CATEGORIES.map(category => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handleCategoryToggle(category)}
                  color={post.categories.includes(category) ? "primary" : "default"}
                  clickable
                />
              ))}
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => navigate("/admin/blogs")}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Cập nhật
        </Button>
      </DialogActions>

      <ToastContainer />
    </Dialog>
  );
};

export default BlogChange;
