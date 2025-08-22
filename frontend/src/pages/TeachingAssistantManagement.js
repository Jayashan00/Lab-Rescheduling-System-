import React, { useState, useEffect } from 'react';
import {
Container, Row, Col, Card, Table, Button,
Badge, Modal, Form, Spinner, Alert,
InputGroup, FormControl, Dropdown
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function TeachingAssistantManagement() {
const [tas, setTAs] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');
const [currentTA, setCurrentTA] = useState({
id: '',
name: '',
email: '',
unavailableDates: [],
unavailableTimeSlots: []
});
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [searchTerm, setSearchTerm] = useState('');
const [selectedDate, setSelectedDate] = useState(null);
const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
const [availabilityLoading, setAvailabilityLoading] = useState(false);
const [availableTAs, setAvailableTAs] = useState([]);
const [showAvailability, setShowAvailability] = useState(false);

const timeSlots = [
'08:30-10:30',
'10:30-12:30',
'13:30-15:30',
'15:30-17:30'
];

useEffect(() => {
fetchTAs();
}, []);

  const fetchTAs = async () => {
    try {
      const response = await API.get('/api/teaching-assistants');
      setTAs(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch teaching assistants. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setSuccess('');


    try {
      if (modalType === 'create') {
        const payload = { ...currentTA };
        delete payload.id; // backend generates ID
        await API.post('/api/teaching-assistants', payload);
        setSuccess('Teaching Assistant created successfully');
      } else {
        await API.put(`/api/teaching-assistants/${currentTA.id}`, currentTA);
        setSuccess('Teaching Assistant updated successfully');
      }
      fetchTAs();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teaching assistant?')) {
      try {
        await API.delete(`/api/teaching-assistants/${id}`);
        setSuccess('Teaching Assistant deleted successfully');
        fetchTAs();
      } catch (err) {
        console.error(err);
        setError('Delete failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

const checkAvailability = async () => {
if (!selectedDate || !selectedTimeSlot) {
setError('Please select both date and time slot');
return;
}


    try {
      setAvailabilityLoading(true);
      setError('');
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await API.get('/api/teaching-assistants/available', {
        params: { date: dateStr, timeSlot: selectedTimeSlot }
      });
  setAvailableTAs(response.data);
  setShowAvailability(true);
} catch (error) {
  console.error('Error checking availability:', error);
  setError('Failed to check availability: ' + (error.response?.data?.message || error.message));
} finally {
  setAvailabilityLoading(false);
}
};

const filteredTAs = tas.filter(ta =>
ta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
ta.email.toLowerCase().includes(searchTerm.toLowerCase())
);

if (loading) {
return (
<Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
<div className="text-center">
<Spinner animation="border" variant="primary" />
<p className="mt-2 text-muted">Loading teaching assistants...</p>
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
<h2 className="mb-2 text-primary fw-bold">
<i className="bi bi-people me-2"></i>
Teaching Assistant Management
</h2>
<p className="text-muted mb-0">Manage teaching assistant availability and schedules</p>
</div>
<Button
variant="primary"
size="lg"
className="shadow-sm"
onClick={() => {
setCurrentTA({
id: '',
name: '',
email: '',
unavailableDates: [],
unavailableTimeSlots: []
});
setModalType('create');
setShowModal(true);
}}
>
<FaPlus className="me-2" />
Add New TA
</Button>
</div>
</Col>
</Row>


  {error && (
    <Alert variant="danger" onClose={() => setError('')} dismissible className="shadow-sm">
      <i className="bi bi-exclamation-triangle me-2"></i>
      {error}
    </Alert>
  )}

  {success && (
    <Alert variant="success" onClose={() => setSuccess('')} dismissible className="shadow-sm">
      <i className="bi bi-check-circle me-2"></i>
      {success}
    </Alert>
  )}

  <Card className="mb-4 shadow-sm border-0">
    <Card.Header className="bg-gradient bg-warning text-dark">
      <h5 className="mb-0">
        <i className="bi bi-search me-2"></i>
        Check TA Availability
      </h5>
    </Card.Header>
    <Card.Body className="p-4">
      <Row className="g-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              <i className="bi bi-calendar me-2"></i>
              Date
            </Form.Label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              className="form-control form-control-lg"
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              <i className="bi bi-clock me-2"></i>
              Time Slot
            </Form.Label>
            <Form.Select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="form-select-lg"
            >
              <option value="">Select time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button
            variant="warning"
            size="lg"
            className="w-100"
            onClick={checkAvailability}
            disabled={!selectedDate || !selectedTimeSlot || availabilityLoading}
          >
            {availabilityLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Checking...
              </>
            ) : (
              <>
                <FaSearch className="me-2" />
                Check Availability
              </>
            )}
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>

  {showAvailability && (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-gradient bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-check-circle me-2"></i>
            Available TAs on {selectedDate?.toDateString()} at {selectedTimeSlot}
          </h5>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setShowAvailability(false)}
          >
            <i className="bi bi-x"></i>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {availableTAs.length > 0 ? (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {availableTAs.map(ta => (
                  <tr key={ta.id}>
                    <td className="fw-semibold">{ta.name}</td>
                    <td>{ta.email}</td>
                    <td>
                      <Badge bg="success">
                        <i className="bi bi-check-circle me-1"></i>
                        Available
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info" className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            No TAs available for the selected date and time slot
          </Alert>
        )}
      </Card.Body>
    </Card>
  )}

  <Card className="shadow-sm border-0">
    <Card.Header className="bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">
          <i className="bi bi-list-ul me-2"></i>
          All Teaching Assistants ({filteredTAs.length})
        </h5>
        <Form.Group className="mb-0" style={{ width: '300px' }}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search TAs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control-lg"
            />
          </InputGroup>
        </Form.Group>
      </div>
    </Card.Header>
    <Card.Body className="p-0">
      <div className="table-responsive">
        <Table striped hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Unavailable Dates</th>
              <th>Unavailable Times</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTAs.map(ta => (
              <tr key={ta.id}>
                <td className="fw-semibold">{ta.name}</td>
                <td>{ta.email}</td>
                <td>
                  {ta.unavailableDates?.length > 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-calendar-x me-1"></i>
                        {ta.unavailableDates.length} dates
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {ta.unavailableDates.map((date, idx) => (
                          <Dropdown.Item key={idx}>
                            <i className="bi bi-calendar me-2"></i>
                            {new Date(date).toLocaleDateString()}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <Badge bg="success">Available</Badge>
                  )}
                </td>
                <td>
                  {ta.unavailableTimeSlots?.length > 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-clock me-1"></i>
                        {ta.unavailableTimeSlots.length} slots
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {ta.unavailableTimeSlots.map((slot, idx) => (
                          <Dropdown.Item key={idx}>
                            <i className="bi bi-clock me-2"></i>
                            {slot}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <Badge bg="success">All slots available</Badge>
                  )}
                </td>
                <td className="text-center">
                  <div className="btn-group" role="group">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setCurrentTA(ta);
                        setModalType('edit');
                        setShowModal(true);
                      }}
                      title="Edit TA"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(ta.id)}
                      title="Delete TA"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card.Body>
  </Card>

  {/* Add/Edit Modal */}
  <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
    <Modal.Header closeButton className="bg-primary text-white">
      <Modal.Title>
        <i className="bi bi-person-plus me-2"></i>
        {modalType === 'create' ? 'Add New Teaching Assistant' : 'Edit Teaching Assistant'}
      </Modal.Title>
    </Modal.Header>
    <Form onSubmit={handleSubmit}>
      <Modal.Body className="p-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-person me-2"></i>
                Name
              </Form.Label>
              <Form.Control
                type="text"
                value={currentTA.name}
                onChange={(e) => setCurrentTA({
                  ...currentTA,
                  name: e.target.value
                })}
                required
                className="form-control-lg"
                placeholder="Enter TA name"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-envelope me-2"></i>
                Email
              </Form.Label>
              <Form.Control
                type="email"
                value={currentTA.email}
                onChange={(e) => setCurrentTA({
                  ...currentTA,
                  email: e.target.value
                })}
                required
                className="form-control-lg"
                placeholder="Enter email address"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <i className="bi bi-calendar-x me-2"></i>
            Unavailable Dates
          </Form.Label>
          <DatePicker
            selected={null}
            onChange={(date) => {
              const dateStr = date.toISOString().split('T')[0];
              setCurrentTA({
                ...currentTA,
                unavailableDates: [...new Set([
                  ...currentTA.unavailableDates,
                  dateStr
                ])]
              });
            }}
            className="form-control form-control-lg mb-2"
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
            placeholderText="Add unavailable date"
          />
          {currentTA.unavailableDates.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {currentTA.unavailableDates.map((date, idx) => (
                <Badge
                  key={idx}
                  bg="secondary"
                  className="d-flex align-items-center p-2"
                >
                  <i className="bi bi-calendar me-2"></i>
                  {new Date(date).toLocaleDateString()}
                  <Button
                    variant="link"
                    size="sm"
                    className="text-white p-0 ms-2"
                    onClick={() => setCurrentTA({
                      ...currentTA,
                      unavailableDates: currentTA.unavailableDates.filter(d => d !== date)
                    })}
                  >
                    <FaTimes />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-semibold">
            <i className="bi bi-clock me-2"></i>
            Unavailable Time Slots
          </Form.Label>
          <div className="d-flex gap-2 mb-2">
            <Form.Select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentTA({
                    ...currentTA,
                    unavailableTimeSlots: [...new Set([
                      ...currentTA.unavailableTimeSlots,
                      e.target.value
                    ])]
                  });
                }
              }}
              className="form-select-lg"
            >
              <option value="">Select time slot to add</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </Form.Select>
          </div>
          {currentTA.unavailableTimeSlots.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {currentTA.unavailableTimeSlots.map((slot, idx) => (
                <Badge
                  key={idx}
                  bg="secondary"
                  className="d-flex align-items-center p-2"
                >
                  <i className="bi bi-clock me-2"></i>
                  {slot}
                  <Button
                    variant="link"
                    size="sm"
                    className="text-white p-0 ms-2"
                    onClick={() => setCurrentTA({
                      ...currentTA,
                      unavailableTimeSlots: currentTA.unavailableTimeSlots.filter(t => t !== slot)
                    })}
                  >
                    <FaTimes />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
          <i className="bi bi-x-circle me-2"></i>
          Cancel
        </Button>
        <Button variant="primary" type="submit" className="px-4">
          <i className="bi bi-check-circle me-2"></i>
          {modalType === 'create' ? 'Create TA' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
</Container>
);
}

export default TeachingAssistantManagement;