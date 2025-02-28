import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { ToastContainer, toast } from "react-toastify";
import "./BlogChange.scss";

const BlogChange = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: "",
    body: "",
    categories: [],
    image: "",
  });
  const [isTitleEditorVisible, setIsTitleEditorVisible] = useState(false);
  const [isBodyEditorVisible, setIsBodyEditorVisible] = useState(false);
  const [availableCategories] = useState([
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
  ]);

  const editorConfig = {
    plugins: [
      "anchor",
      "autolink",
      "charmap",
      "codesample",
      "emoticons",
      "image",
      "link",
      "lists",
      "media",
      "searchreplace",
      "table",
      "visualblocks",
      "wordcount",
      "checklist",
      "mediaembed",
      "casechange",
      "export",
      "formatpainter",
      "pageembed",
      "a11ychecker",
      "tinymcespellchecker",
      "permanentpen",
      "powerpaste",
      "advtable",
      "advcode",
      "editimage",
      "advtemplate",
      "ai",
      "mentions",
      "tinycomments",
      "tableofcontents",
      "footnotes",
      "mergetags",
      "autocorrect",
      "typography",
      "inlinecss",
    ],
    toolbar:
      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
    tinycomments_mode: "embedded",
    tinycomments_author: "Author name",
  };

  useEffect(() => {
    // Fetch the blog post by ID
    fetch(
      `https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog`
    )
      .then((res) => res.json())
      .then((data) => {
        // Tìm bài viết có id tương ứng
        const blogPost = data.find((post) => post.id === parseInt(id));

        if (blogPost) {
          setPost({
            title: blogPost.title,
            body: blogPost.body,
            categories: blogPost.categories || [],
            image: blogPost.image || "",
          });
        } else {
          toast.info("Tạo bài viết mới");
        }
      })
      .catch((error) => {
        console.error("Error fetching blog:", error);
        toast.error("Không thể tải thông tin bài viết!");
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            title: post.title,
            body: post.body,
            categories: post.categories.map((cat) => ({ categoryName: cat })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Cập nhật bài viết thành công!");
      setTimeout(() => {
        navigate("/admin/blogs");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật bài viết!");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Xóa bài viết thành công!");
      navigate("/admin/blogs");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Đã xảy ra lỗi khi xóa bài viết!");
    }
  };

  const handleCategoryToggle = (category) => {
    setPost((prevPost) => {
      const currentCategories = prevPost.categories.map((cat) =>
        typeof cat === "string" ? cat : cat.categoryName
      );

      if (currentCategories.includes(category)) {
        // Remove category
        const newCategories = currentCategories.filter(
          (cat) => cat !== category
        );
        return {
          ...prevPost,
          categories: newCategories.map((cat) => ({ categoryName: cat })),
        };
      } else {
        // Add category
        const newCategories = [...currentCategories, category];
        return {
          ...prevPost,
          categories: newCategories.map((cat) => ({ categoryName: cat })),
        };
      }
    });
  };

  const handleSave = async () => {
    try {
      // Nếu có id, sử dụng PUT để cập nhật bản nháp
      // Nếu không có id, sử dụng POST để tạo mới
      const url = id
        ? `https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog/${id}`
        : "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog";

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(id && { id: id }), // Chỉ thêm id nếu là cập nhật
          title: post.title,
          body: post.body,
          categories: post.categories.map((cat) =>
            typeof cat === "string" ? { categoryName: cat } : cat
          ),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(
        id ? "Lưu bản nháp thành công!" : "Tạo bài viết mới thành công!"
      );
      setTimeout(() => {
        navigate("/admin/blogs");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        id
          ? "Đã xảy ra lỗi khi lưu bản nháp!"
          : "Đã xảy ra lỗi khi tạo bài viết mới!"
      );
    }
  };

  return (
    <div className="blog-change-container">
      <h1>{id ? "Chỉnh sửa Blog" : "Tạo Blog Mới"}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tiêu đề:</label>
          {isTitleEditorVisible ? (
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              initialValue={post.title}
              init={{
                ...editorConfig,
                min_height: 100,
                max_height: 200,
                menubar: false,
              }}
              onEditorChange={(content) => setPost({ ...post, title: content })}
              onBlur={() => setIsTitleEditorVisible(false)}
            />
          ) : (
            <div
              className="editor-placeholder"
              onClick={() => setIsTitleEditorVisible(true)}
            >
              {post.title || "Nhấp vào đây để thêm tiêu đề..."}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Nội dung:</label>
          {isBodyEditorVisible ? (
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              initialValue={post.body}
              init={{
                ...editorConfig,
                height: 500,
              }}
              onEditorChange={(content) => setPost({ ...post, body: content })}
              onBlur={() => setIsBodyEditorVisible(false)}
            />
          ) : (
            <div
              className="editor-placeholder"
              onClick={() => setIsBodyEditorVisible(true)}
            >
              {post.body || "Nhấp vào đây để thêm nội dung..."}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Danh mục:</label>
          <div className="categories-container">
            {availableCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`category-button ${
                  post.categories.some(
                    (cat) =>
                      (typeof cat === "string" ? cat : cat.categoryName) ===
                      category
                  )
                    ? "active"
                    : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="button-group">
          {!id ? (
            <button type="button" onClick={handleSave} className="save-button">
              Lưu bài viết
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="save-button"
              >
                Lưu bản nháp
              </button>
              <button type="submit" className="submit-button">
                Cập nhật bài viết
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
              >
                Xóa bài viết
              </button>
            </>
          )}
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default BlogChange;
