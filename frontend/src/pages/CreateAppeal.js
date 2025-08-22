import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateAppeal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requestId: '',
    appealReason: ''
  });
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    fetchRejectedRequests();
  }, []);

  const fetchRejectedRequests = async () => {
    try {
      const response = await axios.get('/api/requests');
      const rejected = response.data.filter(request =>
        request.status === 'REJECTED' && request.studentId === user.id
      );
      setRejectedRequests(rejected);
    } catch (error) {
      console.error('Error fetching rejected requests:', error);
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

      const response = await axios.post('/api/requests/upload', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAttachments(prev => [...prev, response.data]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
    } finally {
      setFileLoading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const appealData = {
        requestId: formData.requestId,
        appealReason: formData.appealReason,
        attachments: attachments
      };

      await axios.post('/api/appeals', appealData);
      setSuccess('Appeal submitted successfully!');
      setTimeout(() => {
        navigate('/appeals');
      }, 2000);
    } catch (error) {
      console.error('Error creating appeal:', error);
      setError(error.response?.data?.message || 'Failed to create appeal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Create Appeal Request
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
                  {success} Redirecting...
                </Alert>
              )}

              {rejectedRequests.length === 0 ? (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  You don't have any rejected requests to appeal. Appeals can only be submitted for rejected lab rescheduling requests.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bi bi-file-text me-2"></i>
                      Select Rejected Request
                    </Form.Label>
                    <Form.Select
                      name="requestId"
                      value={formData.requestId}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select a rejected request</option>
                      {rejectedRequests.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.moduleCode} - {new Date(request.originalLabDate).toLocaleDateString()}
                          (Rejected: {request.rejectionReason?.substring(0, 50)}...)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="bi bi-paperclip me-2"></i>
                      Attachments (Optional)
                    </Form.Label>
                    <div className="mb-3">
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        disabled={fileLoading}
                      />
                      <Form.Text className="text-muted">
                        Upload supporting documents for your appeal
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

                    {attachments.length > 0 && (
                      <div className="mt-3">
                        <h6>Uploaded Files:</h6>
                        <ul className="list-group">
                          {attachments.map((file, index) => (
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

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="bi bi-chat-text me-2"></i>
                      Appeal Reason
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="appealReason"
                      value={formData.appealReason}
                      onChange={handleChange}
                      placeholder="Please provide a detailed explanation for your appeal. Include any additional information or circumstances that were not considered in the original request..."
                      required
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Your appeal will be reviewed by an administrative panel. 
                      Please provide compelling reasons and any new information that supports your case.
                    </Form.Text>
                  </Form.Group>

                  <div className="bg-light p-3 rounded mb-4">
                    <h6 className="text-warning mb-2">
                      <i className="bi bi-info-circle me-2"></i>
                      Appeal Process
                    </h6>
                    <ol className="mb-0 small">
                      <li>Your appeal will be submitted to the administrative panel</li>
                      <li>The panel will review your case and the original rejection reason</li>
                      <li>A decision will be made within 5-7 business days</li>
                      <li>You will be notified of the final decision via email</li>
                      <li>The panel's decision is final and cannot be appealed further</li>
                    </ol>
                  </div>

                  <div className="d-flex gap-3">
                    <Button
                      variant="warning"
                      type="submit"
                      disabled={loading}
                      className="flex-grow-1"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Submitting Appeal...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Submit Appeal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate('/appeals')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateAppeal;