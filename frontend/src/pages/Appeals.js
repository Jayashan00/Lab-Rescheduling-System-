import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AppealReviewModal from '../components/AppealReviewModal';

function Appeals() {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = user?.roles?.includes('ROLE_ADMIN')
        ? '/api/appeals/pending'
        : '/api/appeals';
      const response = await axios.get(endpoint);
      setAppeals(response.data);
    } catch (error) {
      console.error('Error fetching appeals:', error);
      setError(error.response?.data?.message || 'Failed to fetch appeals');
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
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleReviewClick = (appeal) => {
    setSelectedAppeal(appeal);
    setShowReviewModal(true);
    setError('');
  };

  const formatRequestId = (id) => {
    if (!id) return 'N/A';
    if (id.startsWith('REQ-')) return id;
    return `REQ-${id.substring(0, 6)}`;
  };

  const formatStudentName = (studentName, studentId) => {
    if (studentName) return studentName;
    if (!studentId) return 'Unknown Student';
    return `Student-${studentId.substring(0, 6)}`;
  };

  const handleQuickAction = async (appealId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision ? 'approve' : 'reject'} this appeal?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/appeals/${appealId}/review`, {
        decision,
        comments: decision ? 'Approved via quick action' : 'Rejected via quick action'
      });
      setSuccess(`Appeal ${decision ? 'approved' : 'rejected'} successfully`);
      await fetchAppeals();
    } catch (error) {
      console.error('Error processing quick action:', error);
      setError(error.response?.data?.message || 'Failed to process quick action');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (appealId, reviewData) => {
    try {
      setLoading(true);
      await axios.post(`/api/appeals/${appealId}/review`, reviewData);
      setSuccess('Appeal reviewed successfully');
      await fetchAppeals();
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  if (loading && appeals.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading appeals...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-primary mb-2">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Appeals
              </h1>
              <p className="text-muted mb-0">Manage appeal requests for rejected lab rescheduling</p>
            </div>
            {isStudent && (
              <Link to="/create-appeal" className="btn btn-warning btn-lg">
                <i className="bi bi-plus-circle me-2"></i>
                New Appeal
              </Link>
            )}
            {isAdmin && (
              <Link to="/appeals/reviewed" className="btn btn-info">
                <i className="bi bi-list-check me-2"></i>
                View Reviewed Appeals
              </Link>
            )}
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')} dismissible>
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-list-ul me-2"></i>
                {isAdmin ? 'Pending Appeals' : 'All Appeals'} ({appeals.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {appeals.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Request ID</th>
                        <th>Student</th>
                        <th>Appeal Reason</th>
                        <th>Attachments</th>
                        <th>Status</th>
                        <th>Panel Decision</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appeals.map((appeal) => (
                        <tr key={appeal.id}>
                          <td>
                            <code className="text-primary">{formatRequestId(appeal.requestId)}</code>
                          </td>
                          <td className="fw-semibold">{formatStudentName(appeal.studentName, appeal.studentId)}</td>
                          <td>
                            <span title={appeal.appealReason}>
                              {appeal.appealReason.length > 50
                                ? `${appeal.appealReason.substring(0, 50)}...`
                                : appeal.appealReason}
                            </span>
                          </td>
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
                          <td>
                            {appeal.panelDecision ? (
                              <span title={appeal.panelDecision} className="text-muted">
                                {appeal.panelDecision.length > 30
                                  ? `${appeal.panelDecision.substring(0, 30)}...`
                                  : appeal.panelDecision}
                              </span>
                            ) : (
                              <span className="text-muted">Pending review</span>
                            )}
                          </td>
                          <td>{new Date(appeal.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              {isAdmin && appeal.status === 'PENDING' && (
                                <>
                                  <Button
                                    variant="primary"
                                    size="md"
                                    onClick={() => handleReviewClick(appeal)}
                                    className="me-2"
                                  >
                                    <i className="bi bi-clipboard-check me-1"></i> Review
                                  </Button>
                                  <Button
                                    variant="success"
                                    size="md"
                                    onClick={() => handleQuickAction(appeal.id, true)}
                                    className="me-2"
                                  >
                                    <i className="bi bi-check-circle me-1"></i> Approve
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="md"
                                    onClick={() => handleQuickAction(appeal.id, false)}
                                  >
                                    <i className="bi bi-x-circle me-1"></i> Reject
                                  </Button>
                                </>
                              )}
                              {!isAdmin && (
                                <Button variant="secondary" size="md">
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                  <h4 className="text-muted mt-3">No appeals found</h4>
                  <p className="text-muted">
                    {isAdmin ? 'There are no pending appeals to review.' : 'There are no appeal requests to display.'}
                  </p>
                  {isStudent && (
                    <Link to="/create-appeal" className="btn btn-warning">
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Your First Appeal
                    </Link>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AppealReviewModal
        show={showReviewModal}
        appeal={selectedAppeal}
        onClose={() => setShowReviewModal(false)}
        onReview={handleReviewSubmit}
      />
    </Container>
  );
}

export default Appeals;