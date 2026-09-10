import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfqAPI } from '../../services/api';

const CreateRFQ = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quantity: '',
    unit: 'pcs',
    budget: '',
    delivery_location: '',
    required_delivery_date: '',
    closing_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field validation
    if (
      !formData.product_name ||
      !formData.description ||
      !formData.quantity ||
      !formData.budget ||
      !formData.delivery_location ||
      !formData.required_delivery_date ||
      !formData.closing_date
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    if (Number(formData.budget) <= 0) {
      setError('Budget must be greater than 0.');
      return;
    }

    setLoading(true);

    const payload = {
      product_name: formData.product_name,
      title: formData.product_name, // DRF field alias
      description: formData.description,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      budget: Number(formData.budget),
      delivery_location: formData.delivery_location,
      required_delivery_date: formData.required_delivery_date,
      closing_date: formData.closing_date,
      status: 'OPEN',
    };

    try {
      await rfqAPI.create(payload);
      setSuccess('RFQ created successfully! Redirecting to My RFQs...');
      setTimeout(() => {
        navigate('/buyer/rfqs');
      }, 1500);
    } catch (err) {
      console.error('Failed to create RFQ:', err);
      const serverErr =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create RFQ. Please try again.');
      setError(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card max-w-2xl mx-auto">
        <div className="card-header border-bottom">
          <h2 className="card-title">Create Request for Quotation (RFQ)</h2>
          <p className="card-subtitle">Fill in the details below to receive competitive supplier quotes.</p>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="product_name">Product / Service Name *</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                className="form-control"
                placeholder="e.g. Industrial Steel Pipes 50mm"
                value={formData.product_name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="form-control"
                placeholder="Describe specifications, quality standards, packaging, or special requirements..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                className="form-control"
                placeholder="e.g. 500"
                value={formData.quantity}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit of Measure *</label>
              <select
                id="unit"
                name="unit"
                className="form-control"
                value={formData.unit}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Tons</option>
                <option value="meters">Meters</option>
                <option value="hours">Hours</option>
                <option value="boxes">Boxes</option>
                <option value="units">Units</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget">Estimated Budget ($) *</label>
              <input
                type="number"
                id="budget"
                name="budget"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="e.g. 5000.00"
                value={formData.budget}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="delivery_location">Delivery Location *</label>
              <input
                type="text"
                id="delivery_location"
                name="delivery_location"
                className="form-control"
                placeholder="e.g. Warehouse B, Chicago, IL"
                value={formData.delivery_location}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="required_delivery_date">Required Delivery Date *</label>
              <input
                type="date"
                id="required_delivery_date"
                name="required_delivery_date"
                className="form-control"
                value={formData.required_delivery_date}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="closing_date">RFQ Closing Date *</label>
              <input
                type="date"
                id="closing_date"
                name="closing_date"
                className="form-control"
                value={formData.closing_date}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-actions full-width">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/buyer/rfqs')}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating RFQ...' : 'Create RFQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRFQ;
