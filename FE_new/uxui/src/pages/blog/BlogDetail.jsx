import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, Calendar, User } from 'lucide-react';
import './BlogDetail.scss';
import { NavLink } from 'react-router-dom';
const BlogDetail = () => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`https://dummyjson.com/posts/${params.id}`);
                if (!response.ok) {
                    throw new Error("Không thể tải bài viết");
                }
                const data = await response.json();
                setPost(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id]);

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="spinner" />
                <p>Đang tải bài viết...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Có lỗi xảy ra: {error}</p>
            </div>
        );
    }

    if (!post) return null;

    return (
        
        <div className="blog-detail">
            <div className="blog-detail-header">
                <div className="blog-detail-image">
                    <NavLink to="/blog">back</NavLink>
                    <img 
                        src={`https://picsum.photos/seed/${post.id}/1200/600`}
                        alt={post.title}
                    />
                </div>
                <h1>{post.title}</h1>
                <div className="blog-detail-meta">
                    <span className="blog-date">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString("vi-VN")}
                    </span>
                    <span className="blog-author">
                        <User size={16} />
                        {`Tác giả ${post.userId}`}
                    </span>
                </div>
            </div>
            
            <div className="blog-detail-content">
                <div className="blog-detail-tags">
                    {post.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                    ))}
                </div>
                <p>{post.body}</p>
            </div>
        </div>
    );
};

export default BlogDetail;
