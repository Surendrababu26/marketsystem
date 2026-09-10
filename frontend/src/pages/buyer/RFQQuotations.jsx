import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quotationAPI, rfqAPI } from '../../services/api';

const RFQQuotations = () => {
  const { id: rfqId } = useParams();
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [rfqId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch RFQ info
      const rfqRes = await rfqAPI.getById(rfqId);
      setRfq(rfqRes.data);

      // Fetch Quotations for this RFQ
      const quotRes = await quotationAPI.getByRFQ(rfqId);
      const data = Array.isArray(quotRes.data) ? quotRes.data : quotRes.data.results || [];
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Could not load quotations for this RFQ. Please verify backend endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    setProcessingId(quotationId);
    setActionMessage({ type: '', text: '' });

    try {
      // Update quotation status (ACCEPTED or REJECTED)
      await quotationAPI.update(quotationId, { status: newStatus });

      // If accepted, update RFQ status to AWARDED if backend doesn't automatically do so
      if (newStatus === 'ACCEPTED' && rfq) {
        try {
          await rfqAPI.update(rfqId, { status: 'AWARDED' });
          setRfq((prev) => (prev ? { ...prev, status: 'AWARDED' } : null));
        } catch (e) {
          console.warn('Could not update RFQ status to AWARDED:', e);
        }
      }

      setActionMessage({
        type: 'success',
        text: `Quotation status successfully updated to ${newStatus}.`,
      });

      // Update local quotations state
      setQuotations((prev) =>
        prev.map((q) => (q.id === quotationId ? { ...q, status: newStatus } : q))
      );
    } catch (err) {
      console.error(`Failed to update quotation status:`, err);
      setActionMessage({
        type: 'danger',
        text: `Failed to update quotation to ${newStatus}. Please try again.`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-3">
        <Link to="/buyer/rfqs" className="link-action">
          ← Back to My RFQs
        </Link>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading RFQ details and quotations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* RFQ Header Card */}
          <div className="card mb-4">
            <div className="card-header border-bottom">
              <div>
                <span className={`badge badge-${(rfq?.status || 'OPEN').toLowerCase()} mb-1`}>
                  {(rfq?.status || 'OPEN').toUpperCase()}
                </span>
                <h2>{rfq?.product_name || rfq?.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-muted">Budget: </span>
                <strong className="text-large">${Number(rfq?.budget || 0).toLocaleString()}</strong>
              </div>
            </div>
            <div className="card-body rfq-meta-grid">
              <div>
                <strong>Quantity:</strong> {rfq?.quantity} {rfq?.unit || 'pcs'}
              </div>
              <div>
                <strong>Location:</strong> {rfq?.delivery_location || 'N/A'}
              </div>
              <div>
                <strong>Required Delivery:</strong> {rfq?.required_delivery_date || 'N/A'}
              </div>
              <div>
                <strong>Closing Date:</strong> {rfq?.closing_date || rfq?.rfq_closing_date || 'N/A'}
              </div>
            </div>
            {rfq?.description && (
              <div className="card-footer border-top bg-light">
                <small className="text-muted">Description: {rfq.description}</small>
              </div>
            )}
          </div>

          {/* Action Message Alert */}
          {actionMessage.text && (
            <div className={`alert alert-${actionMessage.type} mb-4`}>{actionMessage.text}</div>
          )}

          {/* Quotations List */}
          <div className="section-header">
            <h3>Supplier Quotations ({quotations.length})</h3>
          </div>

          {quotations.length === 0 ? (
            <div className="card text-center p-5">
              <div className="empty-state-icon">⏳</div>
              <h4>No Quotations Received Yet</h4>
              <p className="text-muted">
                Suppliers have not submitted quotes for this RFQ yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="quotation-list">
              {quotations.map((quot) => {
                const status = (quot.status || 'PENDING').toUpperCase();
                const isAccepted = status === 'ACCEPTED';
                const isRejected = status === 'REJECTED';

                return (
                  <div key={quot.id} className={`quotation-card ${isAccepted ? 'border-success' : ''}`}>
                    <div className="quotation-header">
                      <div>
                        <h4>
                          {quot.supplier_name ||
                            quot.supplier?.full_name ||
                            quot.supplier?.email ||
                            quot.supplier_company ||
                            'Supplier Quote'}
                        </h4>
                        <span className="text-muted small">
                          Company: {quot.supplier_company || quot.company_name || 'N/A'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="quotation-price">
                          ${Number(quot.price || quot.quoted_price || 0).toLocaleString()}
                        </span>
                        <div>
                          <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="quotation-body">
                      <div className="quotation-meta">
                        <div>
                          <strong>Delivery Time:</strong> {quot.delivery_time || quot.delivery_days || 'N/A'}
                        </div>
                        <div>
                          <strong>Submitted:</strong>{' '}
                          {quot.submitted_date || quot.created_at?.split('T')[0] || 'Recently'}
                        </div>
                      </div>

                      {quot.message && (
                        <div className="quotation-message">
                          <strong>Message / Proposal:</strong>
                          <p>{quot.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="quotation-footer">
                      {!isAccepted && (
                        <button
                          onClick={() => handleStatusChange(quot.id, 'ACCEPTED')}
                          className="btn btn-success btn-sm"
                          disabled={processingId === quot.id}
                        >
                          {processingId === quot.id ? 'Processing...' : 'Accept Quotation'}
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          onClick={() => handleStatusChange(quot.id, 'REJECTED')}
                          className="btn btn-outline-danger btn-sm"
                          disabled={processingId === quot.id}
                        >
                          {processingId === quot.id ? 'Processing...' : 'Reject Quotation'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RFQQuotations;
