import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { ToastContainer, toast } from 'react-toastify';

import './BlogChange.scss'; // Import tệp SCSS
const BlogChange = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState({
        title: '',
        body: '',
        userId: '',
        tags: '',
        image: ''
    });
    const [isTitleEditorVisible, setIsTitleEditorVisible] = useState(false);
    const [isBodyEditorVisible, setIsBodyEditorVisible] = useState(false);
    const [isTagsEditorVisible, setIsTagsEditorVisible] = useState(false);

    useEffect(() => {
        // Fetch the blog post by ID
        fetch(`https://dummyjson.com/posts/${id}`)
            .then(res => res.json())
            .then(data => {
                setPost({
                    title: data.title,
                    body: data.body,
                    userId: data.userId,
                    tags: data.tags.join(', '), // Chuyển đổi mảng tags thành chuỗi
                    image: data.image || '',
                });
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare form data for the API
        const formData = new FormData();
        formData.append("title", post.title);
        formData.append("body", post.body);
        formData.append("tags", post.tags.split(',').map(tag => tag.trim()).join(',')); // Chia tách tags
        formData.append("userId", post.userId);
        formData.append("image", post.image || new Blob([''], { type: 'image/png' })); // Đảm bảo có ảnh

        try {
            // Gửi dữ liệu đến API
            const response = await fetch(`https://dummyjson.com/posts/${id}`, {
                method: "PUT", // Hoặc PATCH nếu cần
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(`Lỗi từ API: ${data.message || 'Unknown error'}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.success("Cập nhật bài viết thành công!");

            // Điều hướng về trang /admin/blogs sau 2 giây
            setTimeout(() => {
                navigate("/admin/blogs");
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Đã xảy ra lỗi khi cập nhật bài viết!");
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`https://dummyjson.com/posts/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(`Lỗi khi xóa bài viết: ${data.message || 'Unknown error'}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.success("Xóa bài viết thành công!");
            navigate("/admin/blogs"); // Điều hướng về trang blogs sau khi xóa
        } catch (error) {
            console.error("Error:", error);
            toast.error("Đã xảy ra lỗi khi xóa bài viết!");
        }
    };

    return (
        <div>
            <h1>Chỉnh sửa Blog</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tiêu đề:</label>
                    {isTitleEditorVisible ? (
                        <Editor
                            apiKey='wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp'
                            initialValue={post.title}
                            init={{
                                menubar: false,
                                plugins: ['bold', 'italic', 'underline'],
                                toolbar: 'undo redo | bold italic underline',
                            }}
                            onEditorChange={(content) => setPost({ ...post, title: content })}
                            onFocus={() => setIsBodyEditorVisible(false)}
                            onBlur={() => setIsTitleEditorVisible(false)}
                        />
                    ) : (
                        <input
                            type="text"
                            value={post.title}
                            onFocus={() => setIsTitleEditorVisible(true)}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            required
                        />
                    )}
                </div>
                <div>
                    <label>Nội dung:</label>
                    {isBodyEditorVisible ? (
                        <Editor
                            apiKey='wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp'
                            initialValue={post.body}
                            init={{
                                plugins: [
                                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                                    'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
                                ],
                                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                tinycomments_mode: 'embedded',
                                tinycomments_author: 'Author name',
                            }}
                            onEditorChange={(content) => setPost({ ...post, body: content })}
                            onFocus={() => setIsBodyEditorVisible(true)}
                        />
                    ) : (
                        <textarea
                            onFocus={() => setIsBodyEditorVisible(true)}
                            placeholder="Nhập nội dung ở đây..."
                            required
                        />
                    )}
                </div>
                <div>
                    <label>Thẻ:</label>
                    {isTagsEditorVisible ? (
                        <Editor
                            apiKey='wd7qyd7yuks718m18g7067mk6ko2px16rtu4zekc8rmxp3hp'
                            initialValue={post.tags}
                            init={{
                                menubar: false,
                                plugins: ['bold', 'italic', 'underline'],
                                toolbar: 'undo redo | bold italic underline',
                            }}
                            onEditorChange={(content) => setPost({ ...post, tags: content })}
                            onFocus={() => setIsBodyEditorVisible(false)}
                            onBlur={() => setIsTagsEditorVisible(false)}
                        />
                    ) : (
                        <input
                            type="text"
                            value={post.tags}
                            onFocus={() => setIsTagsEditorVisible(true)}
                            onChange={(e) => setPost({ ...post, tags: e.target.value })}
                            required
                        />
                    )}
                </div>
                <div>
                    <label>User ID:</label>
                    <input
                        type="number"
                        value={post.userId}
                        onChange={(e) => setPost({ ...post, userId: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Ảnh:</label>
                    <input
                        type="file"
                        onChange={(e) => setPost({ ...post, image: e.target.files[0] })}
                    />
                </div>
                <button type="submit">Cập nhật bài viết</button>
                <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
                    Xóa bài viết
                </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default BlogChange;
