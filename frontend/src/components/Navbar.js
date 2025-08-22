import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
const { user, logout } = useAuth();

const handleLogout = () => {
logout();
};

const hasRole = (role) => {
return user?.roles?.includes(role);
};

return (
<BootstrapNavbar bg="primary" variant="dark" expand="lg" sticky="top" className="shadow-sm">
<Container>
<LinkContainer to="/dashboard">
<BootstrapNavbar.Brand className="fw-bold">
<div className="d-flex align-items-center">
<div className="logo-container me-3">
<img
src="https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop"
alt="University of Ruhuna"
width="40"
height="40"
className="rounded-circle"
/>
</div>
<div>
<div className="fs-5">Lab Rescheduling System</div>
<div className="small text-white-50">University of Ruhuna - Faculty of Engineering</div>
</div>
</div>
</BootstrapNavbar.Brand>
</LinkContainer>
<BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
<BootstrapNavbar.Collapse id="basic-navbar-nav">
<Nav className="me-auto">
<LinkContainer to="/dashboard">
<Nav.Link className="fw-semibold">
<i className="bi bi-house-door me-1"></i>
Dashboard
</Nav.Link>
</LinkContainer>
<LinkContainer to="/requests">
<Nav.Link className="fw-semibold">
<i className="bi bi-file-text me-1"></i>
Requests
</Nav.Link>
</LinkContainer>
{hasRole('ROLE_STUDENT') && (
<LinkContainer to="/appeals">
<Nav.Link className="fw-semibold">
<i className="bi bi-exclamation-triangle me-1"></i>
Appeals
</Nav.Link>
</LinkContainer>
)}
{(hasRole('ROLE_ADMIN') || hasRole('ROLE_MODULE_COORDINATOR') || hasRole('ROLE_LAB_COORDINATOR')) && (
<LinkContainer to="/modules">
<Nav.Link className="fw-semibold">
<i className="bi bi-book me-1"></i>
Modules
</Nav.Link>
</LinkContainer>
)}
{hasRole('ROLE_LAB_COORDINATOR') && (
<NavDropdown title={
<span className="fw-semibold">
<i className="bi bi-gear me-1"></i>
Resources
</span>
} id="resources-dropdown">
<LinkContainer to="/instructors">
<NavDropdown.Item>
<i className="bi bi-person-badge me-2"></i>
Instructors
</NavDropdown.Item>
</LinkContainer>
<LinkContainer to="/lab-rooms">
<NavDropdown.Item>
<i className="bi bi-building me-2"></i>
Lab Rooms
</NavDropdown.Item>
</LinkContainer>
<LinkContainer to="/teaching-assistants">
<NavDropdown.Item>
<i className="bi bi-people me-2"></i>
Teaching Assistants
</NavDropdown.Item>
</LinkContainer>
</NavDropdown>
)}
{hasRole('ROLE_ADMIN') && (
<LinkContainer to="/users">
<Nav.Link className="fw-semibold">
<i className="bi bi-people me-1"></i>
Users
</Nav.Link>
</LinkContainer>
)}


        {hasRole('ROLE_ADMIN') && (
          <LinkContainer to="/appeals/reviewed">
            <Nav.Link className="fw-semibold">
              <i className="bi bi-list-check me-1"></i>
              Reviewed Appeals
            </Nav.Link>
          </LinkContainer>
        )}
      </Nav>
      <Nav>
        <NavDropdown
          title={
            <span className="fw-semibold">
              <i className="bi bi-person-circle me-1"></i>
              {user?.username}
            </span>
          }
          id="basic-nav-dropdown"
          align="end"
        >
          <NavDropdown.Item disabled className="text-center">
            <div className="fw-bold">{user?.username}</div>
            <small className="text-muted">
              {user?.roles?.map(role => role.replace('ROLE_', '')).join(', ')}
            </small>
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogout} className="text-danger">
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </NavDropdown.Item>
        </NavDropdown>
      </Nav>
    </BootstrapNavbar.Collapse>
  </Container>
</BootstrapNavbar>
);
}

export default Navbar;