import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Modules() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', or 'delete'
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultModule = {
    moduleCode: '',
    moduleName: '',
    department: 'Electrical and Information Engineering',
    semester: 4,
    coordinator: '',
    labSessions: [],
    active: true
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedModule(defaultModule);
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (module) => {
    setSelectedModule(module);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (module) => {
    setSelectedModule(module);
    setModalType('delete');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      if (modalType === 'create') {
        await axios.post('/api/modules', selectedModule);
      } else if (modalType === 'edit') {
        await axios.put(`/api/modules/${selectedModule.id}`, selectedModule);
      } else if (modalType === 'delete') {
        await axios.delete(`/api/modules/${selectedModule.id}`);
      }
      
      await fetchModules();
      setShowModal(false);
    } catch (error) {
      console.error('Error with module operation:', error);
      setError('Failed to perform operation');
    } finally {
      setActionLoading(false);
    }
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
                <i className="bi bi-book me-2"></i>
                Module Management
              </h1>
              <p className="text-muted mb-0">Manage course modules and lab sessions</p>
            </div>
            {hasRole('ROLE_ADMIN') && (
              <Button variant="primary" onClick={handleCreate}>
                <i className="bi bi-plus-circle me-2"></i>
                Add Module
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
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
                      <th>Module Code</th>
                      <th>Module Name</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Coordinator</th>
                      <th>Lab Sessions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module.id}>
                        <td>
                          <strong>{module.moduleCode}</strong>
                        </td>
                        <td>{module.moduleName}</td>
                        <td>{module.department}</td>
                        <td>{module.semester}</td>
                        <td>{module.coordinator || '-'}</td>
                        <td>
                          {module.labSessions?.length > 0 ? (
                            <Badge bg="info">{module.labSessions.length} sessions</Badge>
                          ) : (
                            <span className="text-muted">No sessions</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={module.active ? 'success' : 'danger'}>
                            {module.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        
                        <td>
                          <div className="d-flex gap-1">
                            {(hasRole('ROLE_ADMIN') || hasRole('ROLE_MODULE_COORDINATOR')) && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleEdit(module)}
                                title="Edit Module"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                            )}
                            {hasRole('ROLE_ADMIN') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => {
                                    const updatedModule = {...module, active: true};
                                    handleEdit(updatedModule);
                                  }}
                                  disabled={module.active}
                                  title="Activate Module"
                                >
                                  <i className="bi bi-check-circle"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => {
                                    const updatedModule = {...module, active: false};
                                    handleEdit(updatedModule);
                                  }}
                                  disabled={!module.active}
                                  title="Deactivate Module"
                                >
                                  <i className="bi bi-slash-circle"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDelete(module)}
                                  title="Delete Module"
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </>
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

      {/* Create/Edit/Delete Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create' && 'Add New Module'}
            {modalType === 'edit' && 'Edit Module'}
            {modalType === 'delete' && 'Delete Module'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body>
            {(modalType === 'create' || modalType === 'edit') && selectedModule && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Module Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedModule.moduleCode}
                        onChange={(e) => setSelectedModule({
                          ...selectedModule,
                          moduleCode: e.target.value
                        })}
                        placeholder="e.g., EE4303"
                        required
                        disabled={modalType === 'edit'}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Semester</Form.Label>
                      <Form.Select
                        value={selectedModule.semester}
                        onChange={(e) => setSelectedModule({
                          ...selectedModule,
                          semester: parseInt(e.target.value)
                        })}
                        required
                      >
                        <option value={4}>Semester 4</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Module Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedModule.moduleName}
                    onChange={(e) => setSelectedModule({
                      ...selectedModule,
                      moduleName: e.target.value
                    })}
                    placeholder="e.g., Digital Logic Design"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={selectedModule.department}
                    onChange={(e) => setSelectedModule({
                      ...selectedModule,
                      department: e.target.value
                    })}
                    required
                  >
                    <option value="Electrical and Information Engineering">
                      Electrical and Information Engineering
                    </option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinator</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedModule.coordinator}
                    onChange={(e) => setSelectedModule({
                      ...selectedModule,
                      coordinator: e.target.value
                    })}
                    placeholder="Module coordinator name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Check
                    type="switch"
                    label="Module Active"
                    checked={selectedModule.active}
                    onChange={(e) => setSelectedModule({
                      ...selectedModule,
                      active: e.target.checked
                    })}
                  />
                </Form.Group>
              </>
            )}
            {modalType === 'delete' && selectedModule && (
              <div>
                <p>Are you sure you want to delete the module <strong>{selectedModule.moduleCode} - {selectedModule.moduleName}</strong>?</p>
                <p className="text-danger">This action cannot be undone and may affect existing requests.</p>
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
                  {modalType === 'create' && 'Create Module'}
                  {modalType === 'edit' && 'Save Changes'}
                  {modalType === 'delete' && 'Delete Module'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Modules;