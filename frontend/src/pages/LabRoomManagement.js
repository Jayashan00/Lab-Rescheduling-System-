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

function LabRoomManagement() {
const [rooms, setRooms] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');
const [currentRoom, setCurrentRoom] = useState({
id: '',
roomNumber: '',
capacity: '',
equipment: '',
unavailableDates: [],
unavailableTimeSlots: []
});
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
fetchRooms();
}, []);

  const fetchRooms = async () => {
    try {
      const response = await API.get('/api/lab-rooms'); // use API
      setRooms(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching lab rooms:', error);
      setError('Failed to fetch lab rooms. Please check your connection and try again.');
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
        const payload = { ...currentRoom };
        delete payload.id; // let backend generate ID
        await API.post('/api/lab-rooms', payload); // use API
        setSuccess('Lab room created successfully');
      } else {
        await API.put(`/api/lab-rooms/${currentRoom.id}`, currentRoom); // use API
        setSuccess('Lab room updated successfully');
      }
      fetchRooms();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving lab room:', error);
      setError('Operation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab room?')) {
      try {
        await API.delete(`/api/lab-rooms/${id}`); // use API
        setSuccess('Lab room deleted successfully');
        fetchRooms();
      } catch (error) {
        console.error('Error deleting lab room:', error);
        setError('Delete failed: ' + (error.response?.data?.message || error.message));
      }
    }
  };

const filteredRooms = rooms.filter(room =>
room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
room.equipment.toLowerCase().includes(searchTerm.toLowerCase())
);

if (loading) {
return (
<Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
<div className="text-center">
<Spinner animation="border" variant="primary" />
<p className="mt-2 text-muted">Loading lab rooms...</p>
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
<i className="bi bi-building me-2"></i>
Lab Room Management
</h2>
<p className="text-muted mb-0">Manage lab room availability and equipment</p>
</div>
<Button
variant="primary"
size="lg"
className="shadow-sm"
onClick={() => {
setCurrentRoom({
id: '',
roomNumber: '',
capacity: '',
equipment: '',
unavailableDates: [],
unavailableTimeSlots: []
});
setModalType('create');
setShowModal(true);
}}
>
<FaPlus className="me-2" />
Add New Lab Room
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

  <Card className="shadow-sm border-0">
    <Card.Header className="bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">
          <i className="bi bi-list-ul me-2"></i>
          All Lab Rooms ({filteredRooms.length})
        </h5>
        <Form.Group className="mb-0" style={{ width: '300px' }}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search rooms..."
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
              <th>Room Number</th>
              <th>Capacity</th>
              <th>Equipment</th>
              <th>Unavailable Dates</th>
              <th>Unavailable Times</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map(room => (
              <tr key={room.id}>
                <td className="fw-semibold">{room.roomNumber}</td>
                <td>{room.capacity} students</td>
                <td>{room.equipment}</td>
                <td>
                  {room.unavailableDates?.length > 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-calendar-x me-1"></i>
                        {room.unavailableDates.length} dates
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {room.unavailableDates.map((date, idx) => (
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
                  {room.unavailableTimeSlots?.length > 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-clock me-1"></i>
                        {room.unavailableTimeSlots.length} slots
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {room.unavailableTimeSlots.map((slot, idx) => (
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
                        setCurrentRoom(room);
                        setModalType('edit');
                        setShowModal(true);
                      }}
                      title="Edit Room"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                      title="Delete Room"
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
        <i className="bi bi-building-add me-2"></i>
        {modalType === 'create' ? 'Add New Lab Room' : 'Edit Lab Room'}
      </Modal.Title>
    </Modal.Header>
    <Form onSubmit={handleSubmit}>
      <Modal.Body className="p-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-door-open me-2"></i>
                Room Number
              </Form.Label>
              <Form.Control
                type="text"
                value={currentRoom.roomNumber}
                onChange={(e) => setCurrentRoom({
                  ...currentRoom,
                  roomNumber: e.target.value
                })}
                required
                className="form-control-lg"
                placeholder="e.g., Lab-101"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-people me-2"></i>
                Capacity
              </Form.Label>
              <Form.Control
                type="number"
                value={currentRoom.capacity}
                onChange={(e) => setCurrentRoom({
                  ...currentRoom,
                  capacity: e.target.value
                })}
                required
                min="1"
                className="form-control-lg"
                placeholder="Number of students"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <i className="bi bi-tools me-2"></i>
            Equipment
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={currentRoom.equipment}
            onChange={(e) => setCurrentRoom({
              ...currentRoom,
              equipment: e.target.value
            })}
            className="form-control-lg"
            placeholder="List available equipment and facilities..."
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <i className="bi bi-calendar-x me-2"></i>
            Unavailable Dates
          </Form.Label>
          <DatePicker
            selected={null}
            onChange={(date) => {
              const dateStr = date.toISOString().split('T')[0];
              setCurrentRoom({
                ...currentRoom,
                unavailableDates: [...new Set([
                  ...currentRoom.unavailableDates,
                  dateStr
                ])]
              });
            }}
            className="form-control form-control-lg mb-2"
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
            placeholderText="Add unavailable date"
          />
          {currentRoom.unavailableDates.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {currentRoom.unavailableDates.map((date, idx) => (
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
                    onClick={() => setCurrentRoom({
                      ...currentRoom,
                      unavailableDates: currentRoom.unavailableDates.filter(d => d !== date)
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
                  setCurrentRoom({
                    ...currentRoom,
                    unavailableTimeSlots: [...new Set([
                      ...currentRoom.unavailableTimeSlots,
                      e.target.value
                    ])]
                  });
                }
              }}
              className="form-select-lg"
            >
              <option value="">Select time slot to add</option>
              {['08:30-10:30', '10:30-12:30', '13:30-15:30', '15:30-17:30'].map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </Form.Select>
          </div>
          {currentRoom.unavailableTimeSlots.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {currentRoom.unavailableTimeSlots.map((slot, idx) => (
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
                    onClick={() => setCurrentRoom({
                      ...currentRoom,
                      unavailableTimeSlots: currentRoom.unavailableTimeSlots.filter(t => t !== slot)
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
          {modalType === 'create' ? 'Create Room' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
</Container>
);
}

export default LabRoomManagement;