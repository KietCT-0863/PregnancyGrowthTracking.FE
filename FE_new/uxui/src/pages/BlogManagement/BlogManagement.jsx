import { Typography, Paper } from "@mui/material";

const BlogManagement = () => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Quản lý bài viết
      </Typography>
      <Paper sx={{ p: 2 }}>
        {/* Nội dung quản lý bài viết */}
        <Typography>Danh sách bài viết</Typography>
      </Paper>
    </>
  );
};

export default BlogManagement;
