import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqAPI, quotationAPI } from '../../services/api';

const SupplierDashboard = () => {
  const { user } = useAuth();
  const [openRfqs, setOpenRfqs] = useState([]);
  const [myQuotations, setMyQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSupplierDashboard();
  }, []);

  const fetchSupplierDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch open RFQs available in marketplace
      const rfqRes = await rfqAPI.getOpen();
      const rfqData = Array.isArray(rfqRes.data) ? rfqRes.data : rfqRes.data.results || [];
      setOpenRfqs(rfqData);

      // Fetch my submitted quotations
      const quotRes = await quotationAPI.getMy();
      const quotData = Array.isArray(quotRes.data) ? quotRes.data : quotRes.data.results || [];
      setMyQuotations(quotData);
    } catch (err) {
      console.error('Error loading supplier dashboard data:', err);
      setError('Could not fetch dashboard metrics. Please check API server.');
    } finally {
      setLoading(false);
    }
  };

  const availableRFQsCount = openRfqs.length;
  const totalQuotationsCount = myQuotations.length;
  const pendingCount = myQuotations.filter((q) => (q.status || 'PENDING').toUpperCase() === 'PENDING').length;
  const acceptedCount = myQuotations.filter((q) => (q.status || '').toUpperCase() === 'ACCEPTED').length;
  const rejectedCount = myQuotations.filter((q) => (q.status || '').toUpperCase() === 'REJECTED').length;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Supplier Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.full_name || user?.email || 'Supplier'}</strong>! Explore RFQs and track your bid status.
          </p>
        </div>
        <div className="action-buttons">
          <Link to="/supplier/rfqs" className="btn btn-primary">
            🔍 Browse Open RFQs
          </Link>
          <Link to="/supplier/quotations" className="btn btn-outline">
            My Submitted Quotations
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
              <div className="stat-icon bg-blue-light">🔍</div>
              <div className="stat-details">
                <span className="stat-value">{availableRFQsCount}</span>
                <span className="stat-label">Available Open RFQs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-purple-light">📝</div>
              <div className="stat-details">
                <span className="stat-value">{totalQuotationsCount}</span>
                <span className="stat-label">Total Quotations</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-orange-light">⏳</div>
              <div className="stat-details">
                <span className="stat-value">{pendingCount}</span>
                <span className="stat-label">Pending Review</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-green-light">✅</div>
              <div className="stat-details">
                <span className="stat-value">{acceptedCount}</span>
                <span className="stat-label">Accepted Bids</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-red-light">❌</div>
              <div className="stat-details">
                <span className="stat-value">{rejectedCount}</span>
                <span className="stat-label">Rejected Bids</span>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h3>Latest Available Opportunities</h3>
              <Link to="/supplier/rfqs" className="link-action">
                Browse All RFQs →
              </Link>
            </div>
            <div className="card-body">
              {openRfqs.length === 0 ? (
                <div className="empty-state">
                  <p>No open RFQs available at the moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product / Service</th>
                        <th>Quantity</th>
                        <th>Est. Budget</th>
                        <th>Location</th>
                        <th>Closing Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openRfqs.slice(0, 5).map((rfq) => (
                        <tr key={rfq.id}>
                          <td>
                            <strong>{rfq.product_name || rfq.title}</strong>
                          </td>
                          <td>
                            {rfq.quantity} {rfq.unit || 'pcs'}
                          </td>
                          <td>${Number(rfq.budget || 0).toLocaleString()}</td>
                          <td>{rfq.delivery_location || 'N/A'}</td>
                          <td>{rfq.closing_date || rfq.rfq_closing_date || 'N/A'}</td>
                          <td>
                            <Link to={`/supplier/rfqs/${rfq.id}`} className="btn btn-sm btn-primary">
                              View Details & Submit Quote
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

export default SupplierDashboard;
