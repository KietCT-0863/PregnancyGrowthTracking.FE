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
  Paper,
} from "@mui/material";
import "./BlogChange.scss";
import blogService from "../../../api/services/blogService";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const API_URL =
  "https://pregnancy-growth-tracking-web-api-a6hxfqhsenaagthw.australiasoutheast-01.azurewebsites.net/api/Blog";

const AVAILABLE_CATEGORIES = [
  "french",
  "fiction",
  "english",
  "history",
  "magical",
  "american",
  "mystery",
  "crime",
  "love",
  "classic",
];

const EDITOR_CONFIG = {
  plugins: ["anchor", "autolink", "charmap", "lists", "media", "table"],
  toolbar: "undo redo | blocks | bold italic | link image | align | lists",
  height: 400,
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const BlogChange = ({ open, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: "",
    body: "",
    categories: [],
  });

  const [originalImage, setOriginalImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const data = await blogService.getBlogById(id);
        console.log("Fetched blog data:", data);

        setPost({
          title: data.title || "",
          body: data.body || "",
          categories:
            data.categories?.map((cat) =>
              typeof cat === "string" ? cat : cat.categoryName
            ) || [],
        });

        if (data.imageUrl || data.blogPhotoUrl) {
          const imageUrl = data.imageUrl || data.blogPhotoUrl;
          console.log("Setting image from:", imageUrl);
          setImagePreview(imageUrl);
          setOriginalImage(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Không thể tải thông tin bài viết: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  console.log(post);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected new image:", file.name);

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG");
        return;
      }

      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (!id) {
        toast.error("Không tìm thấy ID bài viết!");
        return;
      }

      await blogService.updateBlog(id, {
        title: post.title,
        body: post.body,
        categories: post.categories,
      });

      if (selectedImage) {
        console.log("Uploading new image...");
        await blogService.replaceBlogPhoto(id, selectedImage);
      }

      toast.success("Cập nhật bài viết thành công!");
      setTimeout(() => navigate("/admin/blogs"), 1500);
    } catch (error) {
      console.error("Error updating blog:", error);
      if (originalImage) {
        setImagePreview(originalImage);
      }
      toast.error("Lỗi khi cập nhật bài viết: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setPost((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      {isLoading ? (
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            Đang tải...
          </Box>
        </DialogContent>
      ) : (
        <>
          <DialogTitle>Chỉnh sửa Blog</DialogTitle>

          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
            >
              <Box>
                <h4>Tiêu đề</h4>
                <Editor
                  apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
                  value={post.title}
                  init={{
                    ...EDITOR_CONFIG,
                    height: 100,
                    menubar: false,
                  }}
                  onEditorChange={(content) =>
                    setPost((prev) => ({ ...prev, title: content }))
                  }
                />
              </Box>

              <Box>
                <h4>Nội dung</h4>
                <Editor
                  apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
                  value={post.body}
                  init={EDITOR_CONFIG}
                  onEditorChange={(content) =>
                    setPost((prev) => ({ ...prev, body: content }))
                  }
                />
              </Box>

              <Box>
                <h4>Ảnh bài viết</h4>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {imagePreview && (
                    <Box sx={{ position: "relative", width: "fit-content" }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          console.error("Image load error");
                          e.target.src = "/placeholder-blog.jpg";
                        }}
                      />
                    </Box>
                  )}
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    disabled={isSubmitting}
                  >
                    {imagePreview ? "Thay đổi ảnh" : "Tải ảnh lên"}
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                  </Button>
                </Box>
              </Box>

              <Box>
                <h4>Danh mục</h4>
                <Paper sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => handleCategoryToggle(category)}
                      color={
                        post.categories.includes(category)
                          ? "primary"
                          : "default"
                      }
                      clickable
                    />
                  ))}
                </Paper>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => navigate("/admin/blogs")}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogActions>
        </>
      )}
      <ToastContainer />
    </Dialog>
  );
};

export default BlogChange;
