import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import uniLogo from '../assets/university-logo.png';
import facLogo from '../assets/faculty-logo.png';

const features = [
  { icon: 'bi-file-earmark-text', title: 'Request Submission', description: 'Submit lab rescheduling requests with valid reasons and supporting documents' },
  { icon: 'bi-check-circle', title: 'Approval Workflow', description: 'Multi-level approval system through Lab Advisors, Module Coordinators, and Lab Coordinators' },
  { icon: 'bi-exclamation-triangle', title: 'Appeal System', description: 'Submit appeals for rejected requests with administrative panel review' },
  { icon: 'bi-graph-up', title: 'Dashboard & Analytics', description: 'Comprehensive dashboard with request tracking and history management' },

];

const modules = [
  'EE4303 - Digital Logic Design',
  'EC4206 - Software Testing and Quality Assurance',
  'EC4307 - Web Application Development',
  'EC4205 - Software Engineering Principles',
  'EC4203 - Database Systems',
  'EC4202 - Computer Architecture',
  'EC4201 - Advanced Data Structure and Algorithms',
  'EE4201 - Analog and Digital Communication',
  'EE4305 - Electric Machines',
];

const Home = () => {
  return (
    <div className="overflow-hidden">

{/* Hero Section */}
<section
  className="hero-section"
  style={{ backgroundColor: '#0D2B56', padding: '100px 0', color: '#fff' }}
>
  <Container>
    <Row className="align-items-center">
      {/* Left Column */}
      <Col lg={6}>
        <div className="d-flex align-items-center mb-4">
          <img src={uniLogo} alt="University logo" width="80" className="me-3" />
          <img src={facLogo} alt="Faculty logo" width="60" className="me-3" />
          <div>
            <h5 className="mb-1">University of Ruhuna</h5>
            <p className="mb-0" style={{ fontSize: '0.9rem', color: '#cfd8e2' }}>
              Faculty of Engineering
            </p>
          </div>
        </div>

        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '20px',
          }}
        >
          Lab Rescheduling <span style={{ color: '#f9b234' }}>System</span>
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '25px' }}>
          Department of Electrical and Information Engineering
        </p>
        <p
          style={{
            fontSize: '1rem',
            color: '#cfd8e2',
            marginBottom: '35px',
          }}
        >
          Streamline your lab rescheduling process with our comprehensive
          digital platform designed for engineering students and faculty
          members.
        </p>

        <div className="d-flex gap-3 flex-wrap">
          <LinkContainer to="/login">
            <Button
              style={{ backgroundColor: '#f9b234', border: 'none' }}
              size="lg"
            >
              <i className="bi bi-box-arrow-in-right me-2"></i> Login
            </Button>
          </LinkContainer>
          <LinkContainer to="/register">
            <Button variant="outline-light" size="lg">
              <i className="bi bi-person-plus me-2"></i> Register Now
            </Button>
          </LinkContainer>
        </div>
      </Col>

      {/* Right Column - Calendar Image */}
      <Col lg={6} className="text-center">
        <img
          src={require('../assets/calendar.png')}
          alt="Calendar illustration"
          className="img-fluid rounded shadow-lg"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />
      </Col>
    </Row>
  </Container>
</section>



      {/* Features Section */}
      <section className="py-6 bg-white">
        <Container>
          <Row className="justify-content-center mb-5 text-center">
            <Col lg={8}>
              <span className="badge bg-primary-soft text-primary mb-3"></span>
              <h2 className="display-5 fw-bold mb-3">System Capabilities</h2>
              <p className="lead text-muted">Everything you need for efficient lab rescheduling management</p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, idx) => (
              <Col md={6} lg={4} key={idx}>
                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                  <Card.Body className="p-4 text-center">
                    <div className="icon-lg bg-primary-soft text-primary rounded-circle mb-4 d-inline-flex align-items-center justify-content-center" style={{ fontSize: '2rem', width: '60px', height: '60px' }}>
                      <i className={`bi ${feature.icon}`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Modules Section */}
      <section className="py-6 bg-light">
        <Container>
          <Row className="justify-content-center mb-5 text-center">
            <Col lg={8}>
              <span className="badge bg-primary-soft text-primary mb-3"></span>
              <h2 className="display-5 fw-bold mb-3">Supported Courses</h2>
              <p className="lead text-muted">Semester 4 - Electrical and Information Engineering Department</p>
            </Col>
          </Row>
          <Row className="g-4">
            {modules.map((mod, idx) => {
              const [code, name] = mod.split(' - ');
              return (
                <Col md={6} lg={4} key={idx}>
                  <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                    <Card.Body className="p-4 d-flex align-items-center">
                      <div className="icon-md bg-primary-soft text-primary rounded-circle flex-shrink-0 me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-book"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 text-primary">{code}</h6>
                        <p className="mb-0 text-muted">{name}</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-dark text-white text-center">
        <Container>
          <img src={uniLogo} alt="University of Ruhuna" width="80" className="img-fluid mb-3" />
          <h2 className="display-5 fw-bold mb-3">Ready to Get Started?</h2>
          <p className="lead text-white-70 mb-4">
            Join the Lab Rescheduling System and streamline your academic experience today
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <LinkContainer to="/register">
              <Button variant="primary" size="lg" className="px-4 fw-semibold">
                <i className="bi bi-person-plus me-2"></i> Create Account
              </Button>
            </LinkContainer>
            <LinkContainer to="/login">
              <Button variant="outline-light" size="lg" className="px-4 fw-semibold">
                <i className="bi bi-box-arrow-in-right me-2"></i> Login
              </Button>
            </LinkContainer>
          </div>
        </Container>
      </section>

    </div>
  );
};

export default Home;
