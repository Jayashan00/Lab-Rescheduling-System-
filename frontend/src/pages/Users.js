import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', or 'delete'
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const defaultUser = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    department: 'Electrical and Information Engineering',
    semester: 4,
    roles: ['ROLE_STUDENT'],
    enabled: true
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(defaultUser);
    setModalType('create');
    setShowModal(true);
    setPassword('');
  };

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setModalType('edit');
    setShowModal(true);
    setPassword('');
  };

  const handleDelete = (userToDelete) => {
    setSelectedUser(userToDelete);
    setModalType('delete');
    setShowModal(true);
  };

  const handleRoleChange = (role, isChecked) => {
    const newRoles = isChecked
      ? [...selectedUser.roles, role]
      : selectedUser.roles.filter(r => r !== role);

    setSelectedUser({
      ...selectedUser,
      roles: newRoles
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      const userData = { ...selectedUser };

      // Only include password if it's being changed (create or edit with password)
      if (password && (modalType === 'create' || (modalType === 'edit' && password))) {
        userData.password = password;
      }

      if (modalType === 'create') {
        await axios.post('/api/users', userData);
      } else if (modalType === 'edit') {
        await axios.put(`/api/users/${selectedUser.id}`, userData);
      } else if (modalType === 'delete') {
        await axios.delete(`/api/users/${selectedUser.id}`);
      }

      await fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error with user operation:', error);
      setError(error.response?.data?.message || 'Failed to perform operation');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadges = (roles) => {
    const roleColors = {
      'ROLE_ADMIN': 'danger',
      'ROLE_STUDENT': 'primary',
      'ROLE_LAB_ADVISOR': 'info',
      'ROLE_MODULE_COORDINATOR': 'warning',
      'ROLE_LAB_COORDINATOR': 'success'
    };

    return roles?.map(role => (
      <Badge key={role} bg={roleColors[role] || 'secondary'} className="me-1">
        {role.replace('ROLE_', '')}
      </Badge>
    ));
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-primary mb-2">
                <i className="bi bi-people me-2"></i>
                User Management
              </h1>
              <p className="text-muted mb-0">Manage system users and their roles</p>
            </div>
            {hasRole('ROLE_ADMIN') && (
              <Button variant="primary" onClick={handleCreate}>
                <i className="bi bi-plus-circle me-2"></i>
                Add User
              </Button>
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

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Student ID</th>
                      <th>Department</th>
                      <th>Roles</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td>{userItem.firstName} {userItem.lastName}</td>
                        <td>{userItem.username}</td>
                        <td>{userItem.email}</td>
                        <td>{userItem.studentId || '-'}</td>
                        <td>{userItem.department || '-'}</td>
                        <td>{getRoleBadges(userItem.roles)}</td>
                        <td>
                          <Badge bg={userItem.enabled ? 'success' : 'danger'}>
                            {userItem.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEdit(userItem)}
                              disabled={!hasRole('ROLE_ADMIN')}
                              title="Edit User"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setSelectedUser(userItem);
                                setPassword('newpassword'); // Set a default password for reset
                                setModalType('password');
                                setShowModal(true);
                              }}
                              disabled={!hasRole('ROLE_ADMIN')}
                              title="Reset Password"
                            >
                              <i className="bi bi-key"></i>
                            </Button>
                            {hasRole('ROLE_ADMIN') && userItem.id !== user.id && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(userItem)}
                                title="Delete User"
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create' && 'Add New User'}
            {modalType === 'edit' && 'Edit User'}
            {modalType === 'delete' && 'Delete User'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body>
            {(modalType === 'create' || modalType === 'edit') && selectedUser && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedUser.firstName}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          firstName: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedUser.lastName}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          lastName: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedUser.username}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          username: e.target.value
                        })}
                        required
                        disabled={modalType === 'edit'}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          email: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {(modalType === 'create' || (modalType === 'edit' && password)) && (
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={modalType === 'edit' ? "Leave blank to keep current" : ""}
                        minLength={6}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </Button>
                    </div>
                    {modalType === 'create' && (
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters
                      </Form.Text>
                    )}
                  </Form.Group>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedUser.studentId}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          studentId: e.target.value
                        })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        value={selectedUser.department}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser,
                          department: e.target.value
                        })}
                      >
                        <option value="Electrical and Information Engineering">
                          Electrical and Information Engineering
                        </option>
                        {/* Add other departments as needed */}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Roles</Form.Label>
                  <div>
                    {['STUDENT', 'LAB_ADVISOR', 'MODULE_COORDINATOR', 'LAB_COORDINATOR', 'ADMIN'].map((role) => (
                      <Form.Check
                        key={role}
                        type="checkbox"
                        id={`role-${role}`}
                        label={role.replace('_', ' ')}
                        checked={selectedUser.roles.includes(`ROLE_${role}`)}
                        onChange={(e) => handleRoleChange(`ROLE_${role}`, e.target.checked)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Check
                    type="switch"
                    label="User Enabled"
                    checked={selectedUser.enabled}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      enabled: e.target.checked
                    })}
                  />
                </Form.Group>
              </>
            )}

            {modalType === 'delete' && selectedUser && (
              <div>
                <p>Are you sure you want to delete the user <strong>{selectedUser.username}</strong>?</p>
                <p className="text-danger">This action cannot be undone and may affect system functionality.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant={modalType === 'delete' ? 'danger' : 'primary'}
              type="submit"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  {modalType === 'create' && 'Create User'}
                  {modalType === 'edit' && 'Save Changes'}
                  {modalType === 'delete' && 'Delete User'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Users;