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

function InstructorManagement() {
const [instructors, setInstructors] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');
const [currentInstructor, setCurrentInstructor] = useState({
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
const [availableInstructors, setAvailableInstructors] = useState([]);
const [showAvailability, setShowAvailability] = useState(false);

const timeSlots = [
'08:30-10:30',
'10:30-12:30',
'13:30-15:30',
'15:30-17:30'
];

useEffect(() => {
fetchInstructors();
}, []);

const fetchInstructors = async () => {
try {
const response = await API.get('/api/instructors');
setInstructors(response.data);
setError('');
} catch (error) {
console.error('Error fetching instructors:', error);
setError('Failed to fetch instructors. Please check your connection and try again.');
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
      const payload = { ...currentInstructor };
      delete payload.id; // let backend generate ID
      await API.post('/api/instructors', payload);
      setSuccess('Instructor created successfully');
    } else {
      await API.put(`/api/instructors/${currentInstructor.id}`, currentInstructor);
      setSuccess('Instructor updated successfully');
    }

    fetchInstructors();
    setShowModal(false);
  } catch (error) {
    console.error('Error saving instructor:', error);
    setError('Operation failed: ' + (error.response?.data?.message || error.message));
  }
};

const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this instructor?')) {
    try {
      await API.delete(`/api/instructors/${id}`);
      setSuccess('Instructor deleted successfully');
      fetchInstructors();
    } catch (error) {
      console.error('Error deleting instructor:', error);
      setError('Delete failed: ' + (error.response?.data?.message || error.message));
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
  const response = await API.get(`/api/instructors/available`, {
    params: {
      date: dateStr,
      timeSlot: selectedTimeSlot
    }
  });
  setAvailableInstructors(response.data);
  setShowAvailability(true);
} catch (error) {
  console.error('Error checking availability:', error);
  setError('Failed to check availability: ' + (error.response?.data?.message || error.message));
} finally {
  setAvailabilityLoading(false);
}
};

const filteredInstructors = instructors.filter(instructor =>
instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
);

if (loading) {
return (
<Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
<div className="text-center">
<Spinner animation="border" variant="primary" />
<p className="mt-2 text-muted">Loading instructors...</p>
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
<i className="bi bi-person-badge me-2"></i>
Instructor Management
</h2>
<p className="text-muted mb-0">Manage instructor availability and schedules</p>
</div>
<Button
variant="primary"
size="lg"
className="shadow-sm"
onClick={() => {
setCurrentInstructor({
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
Add New Instructor
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
    <Card.Header className="bg-gradient bg-primary text-white">
      <h5 className="mb-0">
        <i className="bi bi-search me-2"></i>
        Check Instructor Availability
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
            variant="info"
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
            Available Instructors on {selectedDate?.toDateString()} at {selectedTimeSlot}
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
        {availableInstructors.length > 0 ? (
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
                {availableInstructors.map(instructor => (
                  <tr key={instructor.id}>
                    <td className="fw-semibold">{instructor.name}</td>
                    <td>{instructor.email}</td>
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
            No instructors available for the selected date and time slot
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
          All Instructors ({filteredInstructors.length})
        </h5>
        <Form.Group className="mb-0" style={{ width: '300px' }}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search instructors..."
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
            {filteredInstructors.map(instructor => (
              <tr key={instructor.id}>
                <td className="fw-semibold">{instructor.name}</td>
                <td>{instructor.email}</td>
                <td>
                  {instructor.unavailableDates?.length > 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-calendar-x me-1"></i>
                        {instructor.unavailableDates.length} dates
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {instructor.unavailableDates.map((date, idx) => (
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
                  {instructor.unavailableTimeSlots?.length > 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-clock me-1"></i>
                        {instructor.unavailableTimeSlots.length} slots
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {instructor.unavailableTimeSlots.map((slot, idx) => (
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
                        setCurrentInstructor(instructor);
                        setModalType('edit');
                        setShowModal(true);
                      }}
                      title="Edit Instructor"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(instructor.id)}
                      title="Delete Instructor"
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
        {modalType === 'create' ? 'Add New Instructor' : 'Edit Instructor'}
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
                value={currentInstructor.name}
                onChange={(e) => setCurrentInstructor({
                  ...currentInstructor,
                  name: e.target.value
                })}
                required
                className="form-control-lg"
                placeholder="Enter instructor name"
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
                value={currentInstructor.email}
                onChange={(e) => setCurrentInstructor({
                  ...currentInstructor,
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
              setCurrentInstructor({
                ...currentInstructor,
                unavailableDates: [...new Set([
                  ...currentInstructor.unavailableDates,
                  dateStr
                ])]
              });
            }}
            className="form-control form-control-lg mb-2"
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
            placeholderText="Add unavailable date"
          />
          {currentInstructor.unavailableDates.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {currentInstructor.unavailableDates.map((date, idx) => (
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
                    onClick={() => setCurrentInstructor({
                      ...currentInstructor,
                      unavailableDates: currentInstructor.unavailableDates.filter(d => d !== date)
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
                  setCurrentInstructor({
                    ...currentInstructor,
                    unavailableTimeSlots: [...new Set([
                      ...currentInstructor.unavailableTimeSlots,
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
          {currentInstructor.unavailableTimeSlots.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {currentInstructor.unavailableTimeSlots.map((slot, idx) => (
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
                    onClick={() => setCurrentInstructor({
                      ...currentInstructor,
                      unavailableTimeSlots: currentInstructor.unavailableTimeSlots.filter(t => t !== slot)
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
          {modalType === 'create' ? 'Create Instructor' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
</Container>
);
}

export default InstructorManagement;