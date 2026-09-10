import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rfqAPI } from '../../services/api';

const RFQList = () => {
  const [rfqs, setRfqs] = useState([]);
  const [filteredRfqs, setFilteredRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOpenRFQs();
  }, []);

  const fetchOpenRFQs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rfqAPI.getOpen();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRfqs(data);
      setFilteredRfqs(data);
    } catch (err) {
      console.error('Failed to fetch open RFQs:', err);
      // Fallback to getAll if getOpen is not implemented on backend
      try {
        const fallbackRes = await rfqAPI.getAll();
        const fallbackData = Array.isArray(fallbackRes.data)
          ? fallbackRes.data
          : fallbackRes.data.results || [];
        setRfqs(fallbackData);
        setFilteredRfqs(fallbackData);
      } catch (fallbackErr) {
        setError('Unable to load RFQ marketplace listings. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever search or filter state updates
  useEffect(() => {
    let result = [...rfqs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const name = (r.product_name || r.title || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        return name.includes(query) || desc.includes(query);
      });
    }

    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      result = result.filter((r) =>
        (r.delivery_location || '').toLowerCase().includes(loc)
      );
    }

    if (maxBudgetFilter) {
      const maxB = parseFloat(maxBudgetFilter);
      if (!isNaN(maxB)) {
        result = result.filter((r) => parseFloat(r.budget || 0) <= maxB);
      }
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(
        (r) => (r.status || 'OPEN').toUpperCase() === statusFilter
      );
    }

    setFilteredRfqs(result);
  }, [searchQuery, locationFilter, maxBudgetFilter, statusFilter, rfqs]);

  const resetFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setMaxBudgetFilter('');
    setStatusFilter('ALL');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Open RFQs</h1>
          <p className="page-subtitle">Find business opportunities and submit your competitive quotes.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-4 p-3 bg-light">
        <div className="filter-grid">
          <div className="form-group mb-0">
            <label htmlFor="searchQuery" className="small font-bold">Search Keyword</label>
            <input
              type="text"
              id="searchQuery"
              className="form-control"
              placeholder="e.g. Steel pipes, Solar panels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group mb-0">
            <label htmlFor="locationFilter" className="small font-bold">Location</label>
            <input
              type="text"
              id="locationFilter"
              className="form-control"
              placeholder="e.g. Chicago, NY..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>

          <div className="form-group mb-0">
            <label htmlFor="maxBudgetFilter" className="small font-bold">Max Budget ($)</label>
            <input
              type="number"
              id="maxBudgetFilter"
              className="form-control"
              placeholder="e.g. 10000"
              value={maxBudgetFilter}
              onChange={(e) => setMaxBudgetFilter(e.target.value)}
            />
          </div>

          <div className="form-group mb-0">
            <label htmlFor="statusFilter" className="small font-bold">Status</label>
            <select
              id="statusFilter"
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed</option>
              <option value="AWARDED">Awarded</option>
            </select>
          </div>
        </div>

        {(searchQuery || locationFilter || maxBudgetFilter || statusFilter !== 'ALL') && (
          <div className="mt-2 text-right">
            <button onClick={resetFilters} className="btn btn-link btn-sm text-muted">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Searching RFQ marketplace...</p>
        </div>
      ) : filteredRfqs.length === 0 ? (
        <div className="card text-center p-5">
          <div className="empty-state-icon">🔍</div>
          <h3>No Matching RFQs Found</h3>
          <p className="text-muted">Try relaxing your search terms or clearing filters.</p>
          {(searchQuery || locationFilter || maxBudgetFilter || statusFilter !== 'ALL') && (
            <button onClick={resetFilters} className="btn btn-outline btn-sm mt-2">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="rfq-grid">
          {filteredRfqs.map((rfq) => {
            const statusClass = (rfq.status || 'OPEN').toLowerCase();
            const isOpen = statusClass === 'open';

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
                    <span className="detail-label">Est. Budget:</span>
                    <span className="detail-value text-primary font-bold">
                      ${Number(rfq.budget || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{rfq.delivery_location || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Closing Date:</span>
                    <span className="detail-value">{rfq.closing_date || rfq.rfq_closing_date || 'N/A'}</span>
                  </div>
                </div>

                <div className="rfq-card-footer">
                  <Link to={`/supplier/rfqs/${rfq.id}`} className="btn btn-primary btn-block">
                    View Details & Submit Quote
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

export default RFQList;
