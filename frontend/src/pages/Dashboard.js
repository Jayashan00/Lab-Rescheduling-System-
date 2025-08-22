import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    recentRequests: [],
    recentAppeals: [],
    statistics: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsResponse, appealsResponse] = await Promise.all([
        axios.get('/api/requests'),
        axios.get('/api/appeals').catch(() => ({ data: [] })) // Handle if user doesn't have access
      ]);

      const requests = requestsResponse.data;
      const appeals = appealsResponse.data;

      // Calculate statistics
      const statistics = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
        approvedRequests: requests.filter(r => r.status === 'APPROVED').length,
        rejectedRequests: requests.filter(r => r.status === 'REJECTED').length
      };

      setDashboardData({
        recentRequests: requests.slice(0, 5),
        recentAppeals: appeals.slice(0, 5),
        statistics
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="h2 fw-bold text-primary mb-3">
            <i className="bi bi-house-door me-2"></i>
            Dashboard
          </h1>
          <p className="lead text-muted">
            Welcome back, {user?.username}! Here's your overview.
          </p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={3}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Total Requests</h6>
                  <h3 className="fw-bold mb-0">{dashboardData.statistics.totalRequests}</h3>
                </div>
                <div className="text-primary">
                  <i className="bi bi-file-text" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Pending</h6>
                  <h3 className="fw-bold mb-0 text-warning">{dashboardData.statistics.pendingRequests}</h3>
                </div>
                <div className="text-warning">
                  <i className="bi bi-clock" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Approved</h6>
                  <h3 className="fw-bold mb-0 text-success">{dashboardData.statistics.approvedRequests}</h3>
                </div>
                <div className="text-success">
                  <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Rejected</h6>
                  <h3 className="fw-bold mb-0 text-danger">{dashboardData.statistics.rejectedRequests}</h3>
                </div>
                <div className="text-danger">
                  <i className="bi bi-x-circle" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {hasRole('ROLE_STUDENT') && (
                  <>
                    <Col md={6} lg={3}>
                      <LinkContainer to="/create-request">
                        <Button variant="outline-primary" className="w-100">
                          <i className="bi bi-plus-circle me-2"></i>
                          New Request
                        </Button>
                      </LinkContainer>
                    </Col>
                    <Col md={6} lg={3}>
                      <LinkContainer to="/create-appeal">
                        <Button variant="outline-warning" className="w-100">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          New Appeal
                        </Button>
                      </LinkContainer>
                    </Col>
                  </>
                )}
                <Col md={6} lg={3}>
                  <LinkContainer to="/requests">
                    <Button variant="outline-info" className="w-100">
                      <i className="bi bi-list me-2"></i>
                      View Requests
                    </Button>
                  </LinkContainer>
                </Col>
                {hasRole('ROLE_ADMIN') && (
                  <Col md={6} lg={3}>
                    <LinkContainer to="/users">
                      <Button variant="outline-secondary" className="w-100">
                        <i className="bi bi-people me-2"></i>
                        Manage Users
                      </Button>
                    </LinkContainer>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Requests
              </h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentRequests.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recentRequests.map((request) => (
                    <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{request.moduleCode}</h6>
                        <p className="mb-1 text-muted">{request.reason.substring(0, 50)}...</p>
                        <small className="text-muted">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      {getStatusBadge(request.status)}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">No requests found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Recent Appeals
              </h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentAppeals.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recentAppeals.map((appeal) => (
                    <ListGroup.Item key={appeal.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1">{appeal.appealReason.substring(0, 30)}...</p>
                        <small className="text-muted">
                          {new Date(appeal.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      {getStatusBadge(appeal.status)}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">No appeals found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;