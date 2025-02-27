"use client"

import { useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./BlogCreate.scss"

const BlogCreate = () => {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")
  const [image, setImage] = useState(null)
  const [userId, setUserId] = useState("")
  const [isTitleEditorVisible, setIsTitleEditorVisible] = useState(false)
  const [isTagsEditorVisible, setIsTagsEditorVisible] = useState(false)
  const [isBodyEditorVisible, setIsBodyEditorVisible] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !body || !tags || !userId) {
      toast.error("Vui lòng điền đầy đủ thông tin!")
      return
    }
    if (isNaN(userId) || Number.parseInt(userId) <= 0) {
      toast.error("User ID must be a positive number.")
      return
    }

    const formData = new FormData()
    formData.append("title", title.replace(/<[^>]*>/g, ""))
    formData.append("body", body.replace(/<[^>]*>/g, ""))
    formData.append(
      "tags",
      tags
        .split(",")
        .map((tag) => tag.trim())
        .join(","),
    )
    formData.append("userId", userId)
    formData.append("image", image || new Blob([""], { type: "image/png" }))

    try {
      const response = await fetch("https://dummyjson.com/posts/add", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Response Data:", data)
        toast.error(`Lỗi từ API: ${data.message || "Unknown error"}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Success:", data)
      toast.success("Tạo bài viết thành công!")

      setTimeout(() => {
        navigate("/admin/blogs")
      }, 2000)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Đã xảy ra lỗi khi tạo bài viết!")
    }
  }

  return (
    <div className="blog-create">
      <h1 className="blog-create__title">Tạo bài viết mới</h1>
      <form onSubmit={handleSubmit} className="blog-create__form">
        <div className="blog-create__form-group">
          <label className="blog-create__label">Tiêu đề:</label>
          {isTitleEditorVisible ? (
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              initialValue={title}
              init={{
                menubar: false,
                plugins: ["bold", "italic", "underline"],
                toolbar: "undo redo | bold italic underline",
              }}
              onEditorChange={(content) => setTitle(content)}
              onFocus={() => setIsBodyEditorVisible(false)}
              onBlur={() => setIsTitleEditorVisible(false)}
            />
          ) : (
            <input
              type="text"
              value={title}
              onFocus={() => setIsTitleEditorVisible(true)}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="blog-create__input"
            />
          )}
        </div>
        <div className="blog-create__form-group">
          <label className="blog-create__label">Nội dung:</label>
          {isBodyEditorVisible ? (
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              initialValue={body}
              init={{
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
                  "markdown",
                  "importword",
                  "exportword",
                  "exportpdf",
                ],
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                tinycomments_mode: "embedded",
                tinycomments_author: "Author name",
                mergetags_list: [
                  { value: "First.Name", title: "First Name" },
                  { value: "Email", title: "Email" },
                ],
                ai_request: (request, respondWith) =>
                  respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
              }}
              onEditorChange={(content) => setBody(content)}
              onFocus={() => setIsBodyEditorVisible(true)}
            />
          ) : (
            <textarea
              onFocus={() => setIsBodyEditorVisible(true)}
              placeholder="Nhập nội dung ở đây..."
              required
              className="blog-create__textarea"
            />
          )}
        </div>
        <div className="blog-create__form-group">
          <label className="blog-create__label">Thẻ:</label>
          {isTagsEditorVisible ? (
            <Editor
              apiKey="wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp"
              initialValue={tags}
              init={{
                menubar: false,
                plugins: ["bold", "italic", "underline"],
                toolbar: "undo redo | bold italic underline",
              }}
              onEditorChange={(content) => setTags(content)}
              onFocus={() => setIsBodyEditorVisible(false)}
              onBlur={() => setIsTagsEditorVisible(false)}
            />
          ) : (
            <input
              type="text"
              value={tags}
              onFocus={() => setIsTagsEditorVisible(true)}
              onChange={(e) => setTags(e.target.value)}
              required
              className="blog-create__input"
            />
          )}
        </div>
        <div className="blog-create__form-group">
          <label className="blog-create__label">User ID:</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="blog-create__input"
          />
        </div>
        <div className="blog-create__form-group">
          <label className="blog-create__label">Ảnh:</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} className="blog-create__file-input" />
        </div>
        <button type="submit" className="blog-create__submit-btn">
          Tạo bài viết
        </button>
      </form>
      <ToastContainer />
    </div>
  )
}

export default BlogCreate

