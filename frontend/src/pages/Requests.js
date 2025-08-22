import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({
    labAdvisorRecommendation: '',
    moduleCoordinatorApproval: '',
    labCoordinatorApproval: '',
    approvedDate: '',
    rejectionReason: '',
    status: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionData({
      labAdvisorRecommendation: request.labAdvisorRecommendation || '',
      moduleCoordinatorApproval: request.moduleCoordinatorApproval || '',
      labCoordinatorApproval: request.labCoordinatorApproval || '',
      approvedDate: request.approvedDate || '',
      rejectionReason: request.rejectionReason || '',
      status: request.status
    });
    setShowModal(true);
    setError('');
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      let newStatus = actionData.status;

      // Determine new status based on action type and user role
      if (actionType === 'recommend' && hasRole('ROLE_LAB_ADVISOR')) {
        newStatus = 'LAB_ADVISOR_REVIEWED';
      } else if (actionType === 'approve') {
        if (hasRole('ROLE_MODULE_COORDINATOR')) {
          newStatus = 'MODULE_COORDINATOR_REVIEWED';
        } else if (hasRole('ROLE_LAB_COORDINATOR')) {
          newStatus = 'APPROVED';
        } else if (hasRole('ROLE_ADMIN')) {
          // Admin can approve directly
          newStatus = 'APPROVED';
        }
      } else if (actionType === 'reject') {
        newStatus = 'REJECTED';
      } else if (actionType === 'admin-override' && hasRole('ROLE_ADMIN')) {
        // Admin can set any status
        newStatus = actionData.status;
      }

      const updateData = {
        ...actionData,
        status: newStatus
      };

      await axios.put(`/api/requests/${selectedRequest.id}`, updateData);
      setSuccess('Request updated successfully');
      await fetchRequests();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating request:', error);
      setError(error.response?.data?.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'LAB_ADVISOR_REVIEWED': 'info',
      'MODULE_COORDINATOR_REVIEWED': 'info',
      'LAB_COORDINATOR_REVIEWED': 'info',
      'APPEALED': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const canTakeAction = (request) => {
    if (hasRole('ROLE_ADMIN')) return true;
    if (hasRole('ROLE_LAB_ADVISOR') && request.status === 'PENDING') return true;
    if (hasRole('ROLE_MODULE_COORDINATOR') && request.status === 'LAB_ADVISOR_REVIEWED') return true;
    if (hasRole('ROLE_LAB_COORDINATOR') && request.status === 'MODULE_COORDINATOR_REVIEWED') return true;
    return false;
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
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-primary mb-2">
                <i className="bi bi-file-text me-2"></i>
                Reschedule Requests
              </h1>
              <p className="text-muted mb-0">Manage lab rescheduling requests</p>
            </div>
            {hasRole('ROLE_STUDENT') && (
              <LinkContainer to="/create-request">
                <Button variant="primary" size="lg">
                  <i className="bi bi-plus-circle me-2"></i>
                  New Request
                </Button>
              </LinkContainer>
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
            <Card.Body>
              {requests.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Student</th>
                        <th>Module</th>
                        <th>Original Date</th>
                        <th>Requested Date</th>
                        <th>Time Slot</th>
                        <th>Reason</th>
                        <th>Attachments</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td className="fw-semibold">{request.studentName}</td>
                          <td>
                            <strong className="text-primary">{request.moduleCode}</strong>
                          </td>
                          <td>{new Date(request.originalLabDate).toLocaleDateString()}</td>
                          <td>{new Date(request.requestedDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg="secondary">{request.requestedTimeSlot || 'Not specified'}</Badge>
                          </td>
                          <td>
                            <span title={request.reason}>
                              {request.reason.length > 30
                                ? `${request.reason.substring(0, 30)}...`
                                : request.reason}
                            </span>
                          </td>
                          <td>
                            {request.attachments && request.attachments.length > 0 ? (
                              request.attachments.map((attachment, index) => (
                                <div key={index}>
                                  <a
                                    href={`/api/requests/files/${attachment}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                  >
                                    <i className="bi bi-paperclip me-1"></i>
                                    Attachment {index + 1}
                                  </a>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted">None</span>
                            )}
                          </td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-1">
                              {canTakeAction(request) && (
                                <>
                                  {hasRole('ROLE_LAB_ADVISOR') && request.status === 'PENDING' && (
                                    <Button
                                      size="sm"
                                      variant="outline-info"
                                      onClick={() => handleAction(request, 'recommend')}
                                      title="Lab Advisor Recommendation"
                                    >
                                      <i className="bi bi-check-circle"></i>
                                    </Button>
                                  )}

                                  {((hasRole('ROLE_MODULE_COORDINATOR') && request.status === 'LAB_ADVISOR_REVIEWED') ||
                                    (hasRole('ROLE_LAB_COORDINATOR') && request.status === 'MODULE_COORDINATOR_REVIEWED') ||
                                    hasRole('ROLE_ADMIN')) && (
                                    <Button
                                      size="sm"
                                      variant="outline-success"
                                      onClick={() => handleAction(request, 'approve')}
                                      title="Approve Request"
                                    >
                                      <i className="bi bi-check-circle-fill"></i>
                                    </Button>
                                  )}

                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleAction(request, 'reject')}
                                    title="Reject Request"
                                  >
                                    <i className="bi bi-x-circle-fill"></i>
                                  </Button>
                                </>
                              )}

                              {hasRole('ROLE_ADMIN') && (
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => handleAction(request, 'admin-override')}
                                  title="Admin Override"
                                >
                                  <i className="bi bi-gear-fill"></i>
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
                  <h4 className="text-muted mt-3">No requests found</h4>
                  <p className="text-muted">There are no reschedule requests to display.</p>
                  {hasRole('ROLE_STUDENT') && (
                    <LinkContainer to="/create-request">
                      <Button variant="primary">
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Your First Request
                      </Button>
                    </LinkContainer>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {actionType === 'recommend' && 'Lab Advisor Recommendation'}
            {actionType === 'approve' && 'Approve Request'}
            {actionType === 'reject' && 'Reject Request'}
            {actionType === 'admin-override' && 'Admin Override'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleActionSubmit}>
          <Modal.Body className="p-4">
            {selectedRequest && (
              <>
                <div className="bg-light p-3 rounded mb-3">
                  <h6 className="text-primary mb-2">Request Details</h6>
                  <Row>
                    <Col md={6}>
                      <p className="mb-1"><strong>Student:</strong> {selectedRequest.studentName}</p>
                      <p className="mb-1"><strong>Module:</strong> {selectedRequest.moduleCode}</p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-1"><strong>Original Date:</strong> {new Date(selectedRequest.originalLabDate).toLocaleDateString()}</p>
                      <p className="mb-1"><strong>Requested Date:</strong> {new Date(selectedRequest.requestedDate).toLocaleDateString()}</p>
                    </Col>
                  </Row>
                  <p className="mb-0"><strong>Reason:</strong> {selectedRequest.reason}</p>
                </div>

                {actionType === 'recommend' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Lab Advisor Recommendation</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={actionData.labAdvisorRecommendation}
                      onChange={(e) => setActionData({
                        ...actionData,
                        labAdvisorRecommendation: e.target.value
                      })}
                      placeholder="Enter your recommendation..."
                      required
                    />
                  </Form.Group>
                )}

                {actionType === 'approve' && hasRole('ROLE_MODULE_COORDINATOR') && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Module Coordinator Approval</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={actionData.moduleCoordinatorApproval}
                      onChange={(e) => setActionData({
                        ...actionData,
                        moduleCoordinatorApproval: e.target.value
                      })}
                      placeholder="Enter approval comments..."
                      required
                    />
                  </Form.Group>
                )}

                {((actionType === 'approve' && hasRole('ROLE_LAB_COORDINATOR')) ||
                  (actionType === 'approve' && hasRole('ROLE_ADMIN'))) && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        {hasRole('ROLE_ADMIN') ? 'Admin Approval' : 'Lab Coordinator Approval'}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={actionData.labCoordinatorApproval}
                        onChange={(e) => setActionData({
                          ...actionData,
                          labCoordinatorApproval: e.target.value
                        })}
                        placeholder="Enter final approval comments..."
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Approved Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={actionData.approvedDate}
                        onChange={(e) => setActionData({
                          ...actionData,
                          approvedDate: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </>
                )}

                {actionType === 'reject' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Rejection Reason</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={actionData.rejectionReason}
                      onChange={(e) => setActionData({
                        ...actionData,
                        rejectionReason: e.target.value
                      })}
                      placeholder="Enter reason for rejection..."
                      required
                    />
                  </Form.Group>
                )}

                {actionType === 'admin-override' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Status Override</Form.Label>
                      <Form.Select
                        value={actionData.status}
                        onChange={(e) => setActionData({
                          ...actionData,
                          status: e.target.value
                        })}
                        required
                      >
                        <option value="PENDING">Pending</option>
                        <option value="LAB_ADVISOR_REVIEWED">Lab Advisor Reviewed</option>
                        <option value="MODULE_COORDINATOR_REVIEWED">Module Coordinator Reviewed</option>
                        <option value="LAB_COORDINATOR_REVIEWED">Lab Coordinator Reviewed</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Admin Comments</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={actionData.labCoordinatorApproval}
                        onChange={(e) => setActionData({
                          ...actionData,
                          labCoordinatorApproval: e.target.value
                        })}
                        placeholder="Enter admin comments..."
                      />
                    </Form.Group>
                  </>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </Button>
            <Button
              variant={actionType === 'reject' ? 'danger' : 'primary'}
              type="submit"
              disabled={actionLoading}
              className="px-4"
            >
              {actionLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className={`bi bi-${actionType === 'reject' ? 'x' : 'check'}-circle me-2`}></i>
                  Submit
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Requests;