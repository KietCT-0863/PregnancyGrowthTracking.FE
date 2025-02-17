"use client"

import { useState, useEffect } from "react"
import "./BlogPosts.scss"

const BlogPosts = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  const fetchPosts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://dummyjson.com/posts?limit=10&skip=${(page - 1) * 10}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPosts((prevPosts) => [...prevPosts, ...data.posts])
      setPage((prevPage) => prevPage + 1)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, []) // Removed page from dependencies

  return (
    <section className="blog-posts">
      <h2>Bài viết mới nhất</h2>
      {error && <p className="error">Error: {error}</p>}
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-icon">
              <img src={post.image || "https://via.placeholder.com/300x200"} alt={post.title} />
            </div>
            <div className="post-content">
              <h3>{post.title}</h3>
              <p>{post.body.substring(0, 100)}...</p>
              <a href={`/posts/${post.id}`} className="read-more">
                Đọc tiếp
              </a>
            </div>
          </div>
        ))}
      </div>
      {isLoading ? (
        <p>Đang tải bài viết...</p>
      ) : (
        <button onClick={fetchPosts} className="load-more">
          Tải thêm
        </button>
      )}
    </section>
  )
}

export default BlogPosts

