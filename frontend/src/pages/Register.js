import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    studentId: '',
    department: 'Electrical and Information Engineering',
    semester: 4,
    role: ['student']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'role') {
        const roles = formData.role.includes(value)
          ? formData.role.filter(role => role !== value)
          : [...formData.role, value];
        setFormData({ ...formData, role: roles });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await register(formData);
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="login-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem' }}></i>
                  <h2 className="fw-bold mt-3 mb-2">Create Account</h2>
                  <p className="text-muted">Register for Lab Rescheduling System</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4">
                    <i className="bi bi-check-circle me-2"></i>
                    {success} Redirecting to login...
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          required
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          required
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password (min 6 characters)"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Student/Admin ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter student ID"
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="Electrical and Information Engineering">
                            Electrical and Information Engineering
                          </option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Semester</Form.Label>
                        <Form.Select
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value={4}>Semester 4</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Role</Form.Label>
                    <div>
                      <Form.Check
                        type="checkbox"
                        name="role"
                        value="student"
                        label="Student"
                        checked={formData.role.includes('student')}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <Form.Check
                        type="checkbox"
                        name="role"
                        value="lab_advisor"
                        label="Lab Advisor"
                        checked={formData.role.includes('lab_advisor')}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <Form.Check
                        type="checkbox"
                        name="role"
                        value="module_coordinator"
                        label="Module Coordinator"
                        checked={formData.role.includes('module_coordinator')}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <Form.Check
                        type="checkbox"
                        name="role"
                        value="lab_coordinator"
                        label="Lab Coordinator"
                        checked={formData.role.includes('lab_coordinator')}
                        onChange={handleChange}
                        disabled={loading}
                      />

                      <Form.Check
                         type="checkbox"
                         name="role"
                         value="admin"
                         label="Administrator"
                         checked={formData.role.includes('admin')}
                          onChange={handleChange}
                          disabled={loading}
                       />


                    </div>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <LinkContainer to="/login">
                      <Button variant="link" className="p-0">
                        Sign in here
                      </Button>
                    </LinkContainer>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;