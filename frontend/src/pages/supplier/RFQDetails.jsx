import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rfqAPI, quotationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RFQDetails = () => {
  const { id: rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [existingQuotation, setExistingQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Quotation form state
  const [formData, setFormData] = useState({
    price: '',
    delivery_time: '',
    message: '',
  });

  useEffect(() => {
    fetchRFQAndQuotation();
  }, [rfqId]);

  const fetchRFQAndQuotation = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch RFQ details
      const rfqRes = await rfqAPI.getById(rfqId);
      setRfq(rfqRes.data);

      // Check if supplier already submitted a quote for this RFQ
      try {
        const quotRes = await quotationAPI.getMy();
        const myQuotations = Array.isArray(quotRes.data)
          ? quotRes.data
          : quotRes.data.results || [];
        
        const alreadySubmitted = myQuotations.find(
          (q) => String(q.rfq) === String(rfqId) || String(q.rfq_id) === String(rfqId)
        );

        if (alreadySubmitted) {
          setExistingQuotation(alreadySubmitted);
        }
      } catch (qErr) {
        console.warn('Could not verify existing supplier quotations:', qErr);
      }
    } catch (err) {
      console.error('Error fetching RFQ details:', err);
      setError('Could not load RFQ details. The RFQ might not exist or backend is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.price || !formData.delivery_time) {
      setError('Please provide your quoted price and estimated delivery time.');
      return;
    }

    if (Number(formData.price) <= 0) {
      setError('Quoted price must be greater than 0.');
      return;
    }

    setSubmitting(true);

    const payload = {
      rfq: rfqId,
      rfq_id: rfqId, // Alias for DRF flexibility
      price: Number(formData.price),
      quoted_price: Number(formData.price),
      delivery_time: formData.delivery_time,
      delivery_days: formData.delivery_time,
      message: formData.message,
      status: 'PENDING',
    };

    try {
      const response = await quotationAPI.create(payload);
      setSuccess('Quotation submitted successfully! Redirecting to My Quotations...');
      setExistingQuotation(response.data);
      setTimeout(() => {
        navigate('/supplier/quotations');
      }, 1800);
    } catch (err) {
      console.error('Error submitting quotation:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to submit quotation. Please try again.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isRFQOpen = (rfq?.status || 'OPEN').toUpperCase() === 'OPEN';

  return (
    <div className="page-container">
      <div className="mb-3">
        <Link to="/supplier/rfqs" className="link-action">
          ← Back to RFQ Listings
        </Link>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading RFQ details...</p>
        </div>
      ) : error && !rfq ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="detail-layout">
          {/* RFQ Main Overview */}
          <div className="card">
            <div className="card-header border-bottom">
              <div>
                <span className={`badge badge-${(rfq?.status || 'OPEN').toLowerCase()} mb-1`}>
                  {(rfq?.status || 'OPEN').toUpperCase()}
                </span>
                <h2>{rfq?.product_name || rfq?.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-muted small display-block">Est. Budget</span>
                <span className="text-large font-bold text-primary">
                  ${Number(rfq?.budget || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="description-box mb-4">
                <h4>Description & Requirements</h4>
                <p>{rfq?.description}</p>
              </div>

              <div className="rfq-meta-grid bg-light p-3 rounded">
                <div>
                  <strong>Quantity:</strong> {rfq?.quantity} {rfq?.unit || 'pcs'}
                </div>
                <div>
                  <strong>Delivery Location:</strong> {rfq?.delivery_location || 'N/A'}
                </div>
                <div>
                  <strong>Required Delivery Date:</strong> {rfq?.required_delivery_date || 'N/A'}
                </div>
                <div>
                  <strong>RFQ Closing Date:</strong> {rfq?.closing_date || rfq?.rfq_closing_date || 'N/A'}
                </div>
                <div>
                  <strong>Buyer Info:</strong>{' '}
                  {rfq?.buyer_name || rfq?.buyer?.full_name || rfq?.buyer?.email || 'Verified Buyer'}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form or Existing Submission View */}
          <div className="card mt-4">
            <div className="card-header border-bottom">
              <h3>Submit Your Quotation</h3>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {existingQuotation ? (
                <div className="alert alert-info">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">✓ Quotation Already Submitted</span>
                    <span className={`badge badge-${(existingQuotation.status || 'PENDING').toLowerCase()}`}>
                      {(existingQuotation.status || 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  <p className="mb-2">You have already submitted a bid for this RFQ.</p>
                  <div className="bg-white p-3 rounded border text-dark mt-2">
                    <div>
                      <strong>Quoted Price:</strong> ${Number(existingQuotation.price || existingQuotation.quoted_price || 0).toLocaleString()}
                    </div>
                    <div>
                      <strong>Delivery Time:</strong> {existingQuotation.delivery_time || existingQuotation.delivery_days}
                    </div>
                    {existingQuotation.message && (
                      <div>
                        <strong>Message:</strong> {existingQuotation.message}
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <Link to="/supplier/quotations" className="btn btn-outline btn-sm">
                      View All My Quotations
                    </Link>
                  </div>
                </div>
              ) : !isRFQOpen ? (
                <div className="alert alert-warning">
                  This RFQ is currently <strong>{(rfq?.status || 'CLOSED').toUpperCase()}</strong> and is no longer accepting new quotations.
                </div>
              ) : (
                <form onSubmit={handleSubmitQuotation} className="form-grid">
                  <div className="form-group">
                    <label htmlFor="price">Quoted Total Price ($) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="e.g. 4500.00"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="delivery_time">Estimated Delivery Time *</label>
                    <input
                      type="text"
                      id="delivery_time"
                      name="delivery_time"
                      className="form-control"
                      placeholder="e.g. 7 Business Days / By Oct 15"
                      value={formData.delivery_time}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="message">Supplier Proposal / Notes (Optional)</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="form-control"
                      placeholder="Include details about payment terms, warranty, quality certifications, or bulk discounts..."
                      value={formData.message}
                      onChange={handleChange}
                      disabled={submitting}
                    ></textarea>
                  </div>

                  <div className="form-actions full-width">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting Proposal...' : 'Submit Quotation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQDetails;
