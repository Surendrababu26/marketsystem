import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqAPI } from '../../services/api';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await rfqAPI.getMy();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setRfqs(data);
    } catch (err) {
      console.error('Failed to load dashboard RFQs:', err);
      setError('Could not load dashboard data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Compute dashboard metrics
  const totalRFQs = rfqs.length;
  const openRFQs = rfqs.filter((r) => (r.status || 'OPEN').toUpperCase() === 'OPEN').length;
  const closedRFQs = rfqs.filter(
    (r) => (r.status || '').toUpperCase() === 'CLOSED' || (r.status || '').toUpperCase() === 'AWARDED'
  ).length;

  const totalQuotations = rfqs.reduce((acc, curr) => {
    return acc + (curr.quotations_count || curr.quotation_count || curr.quotations?.length || 0);
  }, 0);

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Buyer Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.full_name || user?.email || 'Buyer'}</strong>! Here is an overview of your RFQs.
          </p>
        </div>
        <div className="action-buttons">
          <Link to="/buyer/create-rfq" className="btn btn-primary">
            + Create New RFQ
          </Link>
          <Link to="/buyer/rfqs" className="btn btn-outline">
            View My RFQs
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon bg-blue-light">📋</div>
              <div className="stat-details">
                <span className="stat-value">{totalRFQs}</span>
                <span className="stat-label">Total RFQs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-green-light">🟢</div>
              <div className="stat-details">
                <span className="stat-value">{openRFQs}</span>
                <span className="stat-label">Open RFQs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-orange-light">🔒</div>
              <div className="stat-details">
                <span className="stat-value">{closedRFQs}</span>
                <span className="stat-label">Closed / Awarded</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-purple-light">💬</div>
              <div className="stat-details">
                <span className="stat-value">{totalQuotations}</span>
                <span className="stat-label">Quotations Received</span>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h3>Recent RFQs</h3>
              <Link to="/buyer/rfqs" className="link-action">
                View All →
              </Link>
            </div>
            <div className="card-body">
              {rfqs.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't posted any RFQs yet.</p>
                  <Link to="/buyer/create-rfq" className="btn btn-primary btn-sm mt-2">
                    Create Your First RFQ
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product / Service</th>
                        <th>Quantity</th>
                        <th>Budget</th>
                        <th>Closing Date</th>
                        <th>Status</th>
                        <th>Quotations</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs.slice(0, 5).map((rfq) => (
                        <tr key={rfq.id}>
                          <td>
                            <strong>{rfq.product_name || rfq.title || rfq.name}</strong>
                          </td>
                          <td>
                            {rfq.quantity} {rfq.unit || 'units'}
                          </td>
                          <td>${Number(rfq.budget || 0).toLocaleString()}</td>
                          <td>{rfq.closing_date || rfq.rfq_closing_date || 'N/A'}</td>
                          <td>
                            <span className={`badge badge-${(rfq.status || 'OPEN').toLowerCase()}`}>
                              {(rfq.status || 'OPEN').toUpperCase()}
                            </span>
                          </td>
                          <td>{rfq.quotations_count || rfq.quotation_count || rfq.quotations?.length || 0}</td>
                          <td>
                            <Link to={`/buyer/rfqs/${rfq.id}/quotations`} className="btn btn-sm btn-outline">
                              View Quotations
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerDashboard;
