import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ReviewedAppeals() {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviewedAppeals();
  }, []);

  const fetchReviewedAppeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appeals/reviewed');
      setAppeals(response.data);
    } catch (error) {
      console.error('Error fetching reviewed appeals:', error);
      setError(error.response?.data?.message || 'Failed to fetch reviewed appeals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reviewed Appeals</h2>
        <Link to="/appeals" className="btn btn-primary">
          View Pending Appeals
        </Link>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {appeals.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="text-muted mt-3">No reviewed appeals found</h4>
          <p className="text-muted">There are no reviewed appeals to display.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student</th>
                <th>Appeal Reason</th>
                <th>Attachments</th>
                <th>Status</th>
                <th>Decision</th>
                <th>Reviewed By</th>
                <th>Reviewed Date</th>
              </tr>
            </thead>
            <tbody>
              {appeals.map((appeal) => (
                <tr key={appeal.id}>
                  <td>{appeal.requestId}</td>
                  <td>{appeal.studentName || appeal.studentId}</td>
                  <td>{appeal.appealReason}</td>
                  <td>
                    {appeal.attachments?.map((file, index) => (
                      <div key={index}>
                        <a
                          href={`/api/files/${file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none"
                        >
                          <i className="bi bi-file-earmark me-1"></i>
                          File {index + 1}
                        </a>
                      </div>
                    ))}
                  </td>
                  <td>{getStatusBadge(appeal.status)}</td>
                  <td>{appeal.panelDecision}</td>
                  <td>{appeal.reviewedBy}</td>
                  <td>{new Date(appeal.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default ReviewedAppeals;