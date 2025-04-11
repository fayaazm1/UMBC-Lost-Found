import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/admin.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('posts');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/admin/${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (err) {
            setError('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/admin/${activeTab}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (response.ok) {
                setData(data.filter(item => item.id !== id));
            } else {
                throw new Error('Failed to delete');
            }
        } catch (err) {
            setError('Error deleting item');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const renderContent = () => {
        if (loading) return <div className="loading">Loading...</div>;
        if (error) return <div className="error">{error}</div>;

        return (
            <div className="data-table">
                {data.map(item => (
                    <div key={item.id} className="data-row">
                        {activeTab === 'posts' && (
                            <>
                                <h3>{item.title}</h3>
                                <p>{item.content}</p>
                                <span>Posted by: {item.author}</span>
                            </>
                        )}
                        {activeTab === 'users' && (
                            <>
                                <h3>{item.username}</h3>
                                <p>Email: {item.email}</p>
                                <span>Joined: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </>
                        )}
                        {activeTab === 'comments' && (
                            <>
                                <p>{item.content}</p>
                                <span>By: {item.author} on Post: {item.postTitle}</span>
                            </>
                        )}
                        <button 
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>
            <nav className="admin-nav">
                <button 
                    className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    Comments
                </button>
            </nav>
            <main className="admin-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
