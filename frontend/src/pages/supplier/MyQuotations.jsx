import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotationAPI } from '../../services/api';

const MyQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyQuotations();
  }, []);

  const fetchMyQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await quotationAPI.getMy();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching supplier quotations:', err);
      setError('Could not load your submitted quotations. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Quotations</h1>
          <p className="page-subtitle">Track all proposals and bids submitted to buyers.</p>
        </div>
        <Link to="/supplier/rfqs" className="btn btn-primary">
          + Browse New RFQs
        </Link>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your submitted quotations...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="card text-center p-5">
          <div className="empty-state-icon">📝</div>
          <h3>No Quotations Submitted Yet</h3>
          <p className="text-muted">Browse open RFQs in the marketplace and submit your first quote.</p>
          <div className="mt-3">
            <Link to="/supplier/rfqs" className="btn btn-primary">
              Browse RFQs
            </Link>
          </div>
        </div>
      ) : (
        <div className="quotation-grid">
          {quotations.map((quot) => {
            const status = (quot.status || 'PENDING').toUpperCase();
            const statusClass = status.toLowerCase();

            return (
              <div key={quot.id} className="card quotation-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      {quot.rfq_title ||
                        quot.rfq_product_name ||
                        quot.rfq?.product_name ||
                        quot.rfq?.title ||
                        `RFQ #${quot.rfq || quot.rfq_id}`}
                    </h3>
                    <p className="card-subtitle">
                      Buyer: {quot.buyer_name || quot.buyer_email || quot.rfq?.buyer_name || 'Verified Buyer'}
                    </p>
                  </div>
                  <div>
                    <span className={`badge badge-${statusClass}`}>{status}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Quoted Price:</span>
                      <span className="detail-value text-primary font-bold">
                        ${Number(quot.price || quot.quoted_price || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Delivery Time:</span>
                      <span className="detail-value">{quot.delivery_time || quot.delivery_days || 'N/A'}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Submitted On:</span>
                      <span className="detail-value">
                        {quot.submitted_date || quot.created_at?.split('T')[0] || 'Recently'}
                      </span>
                    </div>
                  </div>

                  {quot.message && (
                    <div className="quotation-message-box mt-3">
                      <strong>Your Proposal Message:</strong>
                      <p>{quot.message}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <Link to={`/supplier/rfqs/${quot.rfq || quot.rfq_id}`} className="btn btn-outline btn-sm">
                    View RFQ Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyQuotations;
