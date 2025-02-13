import React from 'react';

const BlogPosts = () => {
  const posts = [
    {
      title: "10 thực phẩm tốt cho bà bầu",
      excerpt: "Khám phá các thực phẩm giàu dinh dưỡng giúp thai nhi phát triển khỏe mạnh..."
    },
    {
      title: "Các bài tập an toàn cho mẹ bầu",
      excerpt: "Tìm hiểu về các bài tập nhẹ nhàng giúp cải thiện sức khỏe trong thai kỳ..."
    },
    {
      title: "Chuẩn bị tâm lý cho ngày vượt cạn",
      excerpt: "Những lời khuyên hữu ích giúp bạn sẵn sàng cho ngày trọng đại..."
    }
  ];

  return (
    <section className="blog-posts">
      <h2>Bài viết mới nhất</h2>
      <div className="posts-grid">
        {posts.map((post, index) => (
          <div key={index} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogPosts;