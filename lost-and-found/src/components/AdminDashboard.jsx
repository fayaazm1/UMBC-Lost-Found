import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
    adminDashboard: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    adminHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    tab: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        backgroundColor: '#e0e0e0',
    },
    activeTab: {
        backgroundColor: '#007bff',
        color: 'white',
    },
    dataTable: {
        display: 'grid',
        gap: '20px',
    },
    dataRow: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    deleteBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    logoutBtn: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    loading: {
        textAlign: 'center',
        padding: '20px',
    },
    error: {
        color: '#dc3545',
        padding: '20px',
        textAlign: 'center',
    }
};

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
            const response = await fetch(`https://umbc-lost-found-2-backend.onrender.com/admin/${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error loading data. Please try again.');
            if (err.message.includes('unauthorized')) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`https://umbc-lost-found-2-backend.onrender.com/admin/${activeTab}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (response.ok) {
                setData(data.filter(item => item.id !== id));
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete');
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Error deleting item. Please try again.');
            if (err.message.includes('unauthorized')) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const renderContent = () => {
        if (loading) return <div style={styles.loading}>Loading...</div>;
        if (error) return <div style={styles.error}>{error}</div>;

        return (
            <div style={styles.dataTable}>
                {data.map(item => (
                    <div key={item.id} style={styles.dataRow}>
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
                            style={styles.deleteBtn}
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
        <div style={styles.adminDashboard}>
            <div style={styles.adminHeader}>
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
            <div style={styles.tabs}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'posts' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'comments' ? styles.activeTab : {})}}
                    onClick={() => setActiveTab('comments')}
                >
                    Comments
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminDashboard;
