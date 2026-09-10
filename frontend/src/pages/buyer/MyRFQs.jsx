import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rfqAPI } from '../../services/api';

const MyRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    fetchMyRFQs();
  }, []);

  const fetchMyRFQs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rfqAPI.getMy();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRfqs(data);
    } catch (err) {
      console.error('Error fetching buyer RFQs:', err);
      setError('Failed to fetch your RFQs. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RFQ?')) return;
    try {
      await rfqAPI.delete(id);
      setDeleteMessage('RFQ deleted successfully.');
      setRfqs(rfqs.filter((item) => item.id !== id));
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting RFQ:', err);
      alert('Could not delete RFQ. It might already have active quotations or server restricted access.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My RFQs</h1>
          <p className="page-subtitle">Manage all Requests for Quotation submitted by your organization.</p>
        </div>
        <Link to="/buyer/create-rfq" className="btn btn-primary">
          + Create New RFQ
        </Link>
      </div>

      {deleteMessage && <div className="alert alert-success mb-4">{deleteMessage}</div>}
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your RFQs...</p>
        </div>
      ) : rfqs.length === 0 ? (
        <div className="card text-center p-5">
          <div className="empty-state-icon">📄</div>
          <h3>No RFQs Created Yet</h3>
          <p className="text-muted">Start sourcing products and services by creating your first RFQ.</p>
          <div className="mt-3">
            <Link to="/buyer/create-rfq" className="btn btn-primary">
              Create New RFQ
            </Link>
          </div>
        </div>
      ) : (
        <div className="rfq-grid">
          {rfqs.map((rfq) => {
            const quotationCount = rfq.quotations_count ?? rfq.quotation_count ?? rfq.quotations?.length ?? 0;
            const statusClass = (rfq.status || 'OPEN').toLowerCase();

            return (
              <div key={rfq.id} className="rfq-card">
                <div className="rfq-card-header">
                  <h3 className="rfq-card-title">{rfq.product_name || rfq.title}</h3>
                  <span className={`badge badge-${statusClass}`}>{(rfq.status || 'OPEN').toUpperCase()}</span>
                </div>

                <p className="rfq-card-description">{rfq.description}</p>

                <div className="rfq-card-details">
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">
                      {rfq.quantity} {rfq.unit || 'pcs'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Budget:</span>
                    <span className="detail-value">${Number(rfq.budget || 0).toLocaleString()}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{rfq.delivery_location || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Delivery Date:</span>
                    <span className="detail-value">{rfq.required_delivery_date || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Closing Date:</span>
                    <span className="detail-value">{rfq.closing_date || rfq.rfq_closing_date || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Quotations:</span>
                    <span className="detail-value highlight-badge">{quotationCount} Received</span>
                  </div>
                </div>

                <div className="rfq-card-footer">
                  <Link to={`/buyer/rfqs/${rfq.id}/quotations`} className="btn btn-primary btn-sm flex-1">
                    View Quotations ({quotationCount})
                  </Link>
                  <button
                    onClick={() => handleDelete(rfq.id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete RFQ"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRFQs;
