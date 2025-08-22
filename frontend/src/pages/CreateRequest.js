import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function CreateRequest() {
const { user } = useAuth();
const navigate = useNavigate();
const [formData, setFormData] = useState({
moduleCode: '',
originalLabDate: '',
requestedDate: '',
requestedTimeSlot: '',
reason: '',
attachments: []
});
const [modules, setModules] = useState([]);
const [loading, setLoading] = useState(false);
const [fileLoading, setFileLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [selectedFile, setSelectedFile] = useState(null);

useEffect(() => {
fetchModules();
}, []);

const fetchModules = async () => {
try {
const response = await API.get('/api/modules/department/Electrical and Information Engineering/semester/4');
setModules(response.data);
} catch (error) {
console.error('Error fetching modules:', error);
}
};

const handleChange = (e) => {
const { name, value } = e.target;
setFormData({
...formData,
[name]: value
});
};

const handleFileChange = (e) => {
setSelectedFile(e.target.files[0]);
};

const handleFileUpload = async () => {
if (!selectedFile) return;


setFileLoading(true);
try {
  const formDataFile = new FormData();
  formDataFile.append('file', selectedFile);

 const response = await API.post('/api/requests/upload', formDataFile, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  setFormData(prev => ({
    ...prev,
    attachments: [...prev.attachments, response.data]
  }));
  setSelectedFile(null);
} catch (error) {
  console.error('Error uploading file:', error);
  setError('Failed to upload file');
} finally {
  setFileLoading(false);
}
};

const removeAttachment = (index) => {
setFormData(prev => ({
...prev,
attachments: prev.attachments.filter((_, i) => i !== index)
}));
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError('');
setSuccess('');


try {
  const requestData = {
    ...formData,
    studentId: user.id,
    studentName: user.username
  };

  await API.post('/api/requests', requestData);
  setSuccess('Request submitted successfully!');
  setTimeout(() => {
    navigate('/requests');
  }, 2000);
} catch (error) {
  console.error('Error creating request:', error);
  setError(error.response?.data?.message || 'Failed to create request');
} finally {
  setLoading(false);
}
};

const checkAvailability = async () => {
  if (!formData.moduleCode || !formData.requestedDate || !formData.requestedTimeSlot) {
    setError("Please select module, date, and time slot first");
    return;
  }

  try {
    setLoading(true);
    setError('');
    setSuccess('');

    // Fetch all resources in parallel
    const [instructorsRes, labRoomsRes, tasRes] = await Promise.all([
      API.get('/api/instructors'),
      API.get('/api/lab-rooms'),
      API.get('/api/teaching-assistants')
    ]);

    const reqDate = new Date(formData.requestedDate).toISOString().split('T')[0]; // YYYY-MM-DD
    const reqTime = formData.requestedTimeSlot;

    // Helper to check availability
    const isAvailable = (resource) => {
      const dates = resource.unavailableDates?.map(d => new Date(d).toISOString().split('T')[0]) || [];
      const times = resource.unavailableTimeSlots || [];
      return !(dates.includes(reqDate) && times.includes(reqTime));
    };

    const availableInstructors = instructorsRes.data.some(isAvailable);
    const availableLabRooms = labRoomsRes.data.some(isAvailable);
    const availableTAs = tasRes.data.some(isAvailable);

    if (availableInstructors && availableLabRooms && availableTAs) {
      setSuccess("All resources are available for this date and time slot!");
    } else {
      let messages = [];
      if (!availableInstructors) messages.push("No instructors available");
      if (!availableLabRooms) messages.push("No lab rooms available");
      if (!availableTAs) messages.push("No teaching assistants available");
      setError(messages.join("; "));
    }

  } catch (error) {
    console.error('Availability check error:', error);
    setError("Unable to check availability at this time. You can still submit your request.");
  } finally {
    setLoading(false);
  }
};



const availableModules = [
{ code: 'EE4303', name: 'Digital Logic Design' },
{ code: 'EC4206', name: 'Software Testing and Quality Assurance' },
{ code: 'EC4307', name: 'Web Application Development' },
{ code: 'EC4205', name: 'Software Engineering Principles' },
{ code: 'EC4203', name: 'Database Systems' },
{ code: 'EC4202', name: 'Computer Architecture' },
{ code: 'EC4201', name: 'Advanced Data Structure and Algorithms' },
{ code: 'EE4201', name: 'Analog and Digital Communication' },
{ code: 'EE4305', name: 'Electric Machines' }
];

return (
<Container className="py-4">
<Row className="justify-content-center">
<Col lg={8}>
<Card className="shadow-lg border-0">
<Card.Header className="bg-gradient-primary text-white">
<h3 className="mb-0">
<i className="bi bi-plus-circle me-2"></i>
Create Lab Reschedule Request
</h3>
</Card.Header>
<Card.Body className="p-4">
{error && (
<Alert variant="danger" className="mb-4">
<i className="bi bi-exclamation-triangle me-2"></i>
{error}
</Alert>
)}


          {success && (
            <Alert variant="success" className="mb-4">
              <i className="bi bi-check-circle me-2"></i>
              {success} {!success.includes('Redirecting') && ''}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-book me-2"></i>
                    Module
                  </Form.Label>
                  <Form.Select
                    name="moduleCode"
                    value={formData.moduleCode}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="form-select-lg"
                  >
                    <option value="">Select a module</option>
                    {availableModules.map((module) => (
                      <option key={module.code} value={module.code}>
                        {module.code} - {module.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-calendar me-2"></i>
                    Original Lab Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="originalLabDate"
                    value={formData.originalLabDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-calendar-event me-2"></i>
                    Requested New Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="requestedDate"
                    value={formData.requestedDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-clock me-2"></i>
                    Requested Time Slot
                  </Form.Label>
                  <Form.Select
                    name="requestedTimeSlot"
                    value={formData.requestedTimeSlot}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="form-select-lg"
                  >
                    <option value="">Select time slot</option>
                    <option value="08:30-10:30">08:30 - 10:30</option>
                    <option value="10:30-12:30">10:30 - 12:30</option>
                    <option value="13:30-15:30">13:30 - 15:30</option>
                    <option value="15:30-17:30">15:30 - 17:30</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <i className="bi bi-chat-text me-2"></i>
                Reason for Rescheduling
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a detailed reason for your rescheduling request..."
                required
                disabled={loading}
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                Please provide a valid and detailed reason for your request.
                This will be reviewed by the lab advisor, module coordinator, and lab coordinator.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <i className="bi bi-paperclip me-2"></i>
                Attachments
              </Form.Label>
              <div className="mb-3">
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  disabled={fileLoading}
                  className="form-control-lg"
                />
                <Form.Text className="text-muted">
                  Upload supporting documents (e.g., medical certificate, official letter)
                </Form.Text>
                <Button
                  variant="outline-primary"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || fileLoading}
                  className="mt-2"
                >
                  {fileLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      Upload File
                    </>
                  )}
                </Button>
              </div>

              {formData.attachments.length > 0 && (
                <div className="mt-3">
                  <h6>Uploaded Files:</h6>
                  <ul className="list-group">
                    {formData.attachments.map((file, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          <i className="bi bi-file-earmark me-2"></i>
                          {file.substring(0, 20)}...
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          disabled={loading}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>

            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-2">
                <i className="bi bi-info-circle me-2"></i>
                Request Process
              </h6>
              <ol className="mb-0 small">
                <li>Your request will be reviewed by the Lab Advisor</li>
                <li>If recommended, it goes to the Module Coordinator for approval</li>
                <li>Finally, the Lab Coordinator will make the final decision</li>
                <li>If rejected, you can submit an appeal</li>
              </ol>
            </div>

            <Button
              variant="info"
              onClick={checkAvailability}
              disabled={!formData.moduleCode || !formData.requestedDate || !formData.requestedTimeSlot || loading}
              className="mb-3 me-3"
            >
              <i className="bi bi-check-circle me-2"></i>
              Check Availability
            </Button>

            <div className="d-flex gap-3">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex-grow-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Submit Request
                  </>
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/requests')}
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</Container>
);
}

export default CreateRequest;