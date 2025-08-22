import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

function AppealReviewModal({ show, onClose, appeal, onReview }) {
  const [decision, setDecision] = useState(null);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appeal) {
      setDecision(null);
      setComments('');
      setError('');
    }
  }, [appeal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (decision === null) {
      setError('Please select a decision');
      return;
    }

    if (!decision && !comments.trim()) {
      setError('Please provide comments for rejection');
      return;
    }

    setIsSubmitting(true);
    onReview(appeal.id, { decision, comments })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Review Appeal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {appeal && (
            <>
              <div className="mb-3">
                <h6>Appeal Details</h6>
                <p className="mb-1"><strong>Request ID:</strong> {appeal.requestId}</p>
                <p className="mb-1"><strong>Student:</strong> {appeal.studentName || appeal.studentId}</p>
                <p className="mb-1"><strong>Reason:</strong> {appeal.appealReason}</p>
              </div>

              {appeal.attachments?.length > 0 && (
                <div className="mb-3">
                  <h6>Attachments</h6>
                  {appeal.attachments.map((file, index) => (
                    <div key={index}>
                      <a
                        href={`/api/files/${file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        <i className="bi bi-file-earmark me-1"></i>
                        View File {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <Form.Group>
                <Form.Label>Decision</Form.Label>
                <div>
                  <Form.Check
                    inline
                    label="Approve"
                    type="radio"
                    name="decision"
                    id="approve"
                    onChange={() => setDecision(true)}
                    checked={decision === true}
                  />
                  <Form.Check
                    inline
                    label="Reject"
                    type="radio"
                    name="decision"
                    id="reject"
                    onChange={() => setDecision(false)}
                    checked={decision === false}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Panel Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add detailed comments for the decision"
                  required={decision === false}
                />
                <Form.Text className="text-muted">
                  {decision === false ? 'Required for rejections' : 'Optional for approvals'}
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!appeal || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Decision'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AppealReviewModal;