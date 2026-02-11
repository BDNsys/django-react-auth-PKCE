import { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

interface DashboardData {
    message: string;
    timestamp: string;
}

const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        // Example API call - replace with your actual endpoint
        const response = await api.get<DashboardData>('/dashboard');

        if (response.error) {
            setError(response.error);
        } else {
            setData(response.data || null);
        }

        setLoading(false);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Monitor your application metrics and data</p>
                </div>

                <div className="dashboard-content">
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading dashboard data...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <div className="error-icon">⚠️</div>
                            <h3>Unable to Load Data</h3>
                            <p>{error}</p>
                            <button onClick={fetchData} className="btn-retry">Retry</button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-content">
                                        <h3>Total Users</h3>
                                        <p className="stat-value">1,234</p>
                                        <span className="stat-change positive">+12% from last month</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-content">
                                        <h3>Active Sessions</h3>
                                        <p className="stat-value">567</p>
                                        <span className="stat-change positive">+8% from yesterday</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-content">
                                        <h3>Revenue</h3>
                                        <p className="stat-value">$12,345</p>
                                        <span className="stat-change negative">-3% from last week</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">⚡</div>
                                    <div className="stat-content">
                                        <h3>Performance</h3>
                                        <p className="stat-value">98.5%</p>
                                        <span className="stat-change positive">+0.5% uptime</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <div className="dashboard-card">
                                    <h2>Recent Activity</h2>
                                    <div className="activity-list">
                                        <div className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div>
                                                <p className="activity-title">New user registered</p>
                                                <p className="activity-time">2 minutes ago</p>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div>
                                                <p className="activity-title">Database backup completed</p>
                                                <p className="activity-time">1 hour ago</p>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div>
                                                <p className="activity-title">API rate limit updated</p>
                                                <p className="activity-time">3 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-card">
                                    <h2>Quick Actions</h2>
                                    <div className="actions-grid">
                                        <button className="action-btn">
                                            <span className="action-icon">➕</span>
                                            <span>Add User</span>
                                        </button>
                                        <button className="action-btn">
                                            <span className="action-icon">📤</span>
                                            <span>Export Data</span>
                                        </button>
                                        <button className="action-btn">
                                            <span className="action-icon">⚙️</span>
                                            <span>Settings</span>
                                        </button>
                                        <button className="action-btn">
                                            <span className="action-icon">📧</span>
                                            <span>Send Email</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {data && (
                                <div className="api-response">
                                    <h3>API Response Example</h3>
                                    <pre>{JSON.stringify(data, null, 2)}</pre>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
