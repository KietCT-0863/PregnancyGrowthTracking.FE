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
import blogService from "../../api/services/blogService";

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
    categories: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const data = await blogService.getBlogById(id);
        
        setPost({
          title: data.title || "",
          body: data.body || "",
          categories: data.categories?.map(cat => 
            typeof cat === 'string' ? cat : cat.categoryName
          ) || []
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);
  
  console.log(post);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Kiểm tra id có tồn tại
      if (!id) {
        toast.error("Không tìm thấy ID bài viết!");
        return;
      }

      const response = await blogService.updateBlog(id, {
        title: post.title,
        body: post.body,
        categories: post.categories
      });
      
      toast.success("Cập nhật bài viết thành công!");
      setTimeout(() => navigate("/admin/blogs"), 1500);
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
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
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isSubmitting}>
          Cập nhật
        </Button>
      </DialogActions>

      <ToastContainer />
    </Dialog>
  );
};

export default BlogChange;
