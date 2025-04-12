import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBaseURL } from '../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${getBaseURL()}/admin/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                    return;
                }
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data);
            setError('');
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Error loading posts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${getBaseURL()}/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                    return;
                }
                throw new Error('Failed to delete post');
            }

            setPosts(posts.filter(post => post.id !== postId));
            setError('');
        } catch (err) {
            console.error('Error deleting post:', err);
            setError('Error deleting post. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-dashboard">
            <div className="header">
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>

            <div className="posts-grid">
                {posts.length === 0 ? (
                    <div className="no-posts">No posts found</div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="post-card">
                            <h3>{post.item_name || 'Untitled Post'}</h3>
                            <p><strong>Type:</strong> {post.report_type}</p>
                            <p><strong>Description:</strong> {post.description}</p>
                            <p><strong>Location:</strong> {post.location}</p>
                            <p><strong>Date:</strong> {post.date}</p>
                            <p><strong>Time:</strong> {post.time || 'N/A'}</p>
                            {post.image_path && (
                                <img 
                                    src={post.image_path} 
                                    alt="Post" 
                                    className="post-image"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            <button 
                                onClick={() => handleDelete(post.id)}
                                className="delete-button"
                            >
                                Delete Post
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
