# Lab Rescheduling System

A comprehensive full-stack web application for managing lab rescheduling requests at the Faculty of Engineering, University of Ruhuna.

## Features

### Core Functionality
- **Multi-role Authentication**: Students, Lab Advisors, Module Coordinators, Lab Coordinators, and Admins
- **Lab Rescheduling Workflow**: Complete approval chain with recommendations and approvals
- **Appeal System**: Students can appeal rejected requests with administrative panel review
- **Document Management**: File upload and attachment support
- **Dashboard Analytics**: Role-based dashboards with statistics and recent activity
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for all entities

### User Roles & Permissions
- **Students**: Submit requests, view own requests, create appeals
- **Lab Advisors**: Review and recommend requests
- **Module Coordinators**: Approve/reject requests after lab advisor review
- **Lab Coordinators**: Final approval authority, resource management
- **Admins**: Full system access, user management, module management

### Supported Modules (Semester 4)
- EE4303 - Digital Logic Design
- EC4206 - Software Testing and Quality Assurance
- EC4307 - Web Application Development
- EC4205 - Software Engineering Principles
- EC4203 - Database Systems
- EC4202 - Computer Architecture
- EC4201 - Advanced Data Structure and Algorithms
- EE4201 - Analog and Digital Communication
- EE4305 - Electric Machines

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Database**: MongoDB
- **Security**: Spring Security with JWT authentication
- **Build Tool**: Maven
- **Java Version**: 17

### Frontend
- **Framework**: React 18
- **UI Library**: Bootstrap 5 + React Bootstrap
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Bootstrap Icons

## Prerequisites

Before running this application, make sure you have the following installed:

1. **Java 17 or higher**
2. **Node.js 16 or higher**
3. **MongoDB** (running on localhost:27017)
4. **Maven** (for building the backend)
5. **IntelliJ IDEA** (recommended IDE)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lab-rescheduling-system
```

### 2. Backend Setup

#### Navigate to backend directory:
```bash
cd backend
```

#### Configure MongoDB:
Make sure MongoDB is running on `localhost:27017`. The application will automatically create the database `lab_rescheduling_system`.

#### Build and run the backend:
```bash
# Using Maven
mvn clean install
mvn spring-boot:run

# Or using Maven Wrapper (if available)
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

#### Navigate to frontend directory:
```bash
cd frontend
```

#### Install dependencies:
```bash
npm install
```

#### Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Running with IntelliJ IDEA

### Backend:
1. Open IntelliJ IDEA
2. Open the `backend` folder as a project
3. Wait for Maven to download dependencies
4. Navigate to `src/main/java/com/uor/engineering/labreschedulingsystem/LabReschedulingSystemApplication.java`
5. Right-click and select "Run"

### Frontend:
1. Open terminal in IntelliJ
2. Navigate to the `frontend` directory
3. Run `npm install` then `npm start`

## Default Users

The system requires manual user registration. Register users with different roles:

### Student Account:
- Username: `student1`
- Email: `student1@eng.ruh.ac.lk`
- Role: Student
- Department: Electrical and Information Engineering
- Semester: 4

### Admin Account:
- Username: `admin`
- Email: `admin@eng.ruh.ac.lk`
- Role: Admin

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Requests
- `GET /api/requests` - Get all requests (role-based filtering)
- `POST /api/requests` - Create new request (Students only)
- `PUT /api/requests/{id}` - Update request (Advisors/Coordinators)
- `DELETE /api/requests/{id}` - Delete request (Admin only)

### Appeals
- `GET /api/appeals` - Get appeals
- `POST /api/appeals` - Create appeal (Students only)
- `PUT /api/appeals/{id}` - Update appeal (Admin only)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Modules
- `GET /api/modules` - Get all modules
- `POST /api/modules` - Create module (Admin only)
- `PUT /api/modules/{id}` - Update module
- `DELETE /api/modules/{id}` - Delete module (Admin only)

## Database Collections

The MongoDB database contains the following collections:
- `users` - User accounts and authentication
- `reschedule_requests` - Lab rescheduling requests
- `appeals` - Appeal requests for rejected applications
- `modules` - Course modules and lab sessions

## Security Features

- JWT-based authentication
- Role-based access control
- Password encryption with BCrypt
- CORS configuration for frontend-backend communication
- Request validation and sanitization

## Development Notes

### Backend Structure:
```
backend/
├── src/main/java/com/uor/engineering/labreschedulingsystem/
│   ├── config/          # Security and application configuration
│   ├── controller/      # REST API controllers
│   ├── dto/            # Data Transfer Objects
│   ├── model/          # Entity models
│   ├── repository/     # MongoDB repositories
│   ├── security/       # JWT and security components
│   └── service/        # Business logic services
└── src/main/resources/
    └── application.yml  # Application configuration
```

### Frontend Structure:
```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable React components
│   ├── contexts/       # React contexts (Auth)
│   ├── pages/          # Page components
│   ├── App.js          # Main application component
│   └── index.js        # Application entry point
└── package.json        # Dependencies and scripts
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running on localhost:27017
   - Check if the database service is started

2. **Port Already in Use**:
   - Backend (8080): Stop any other Spring Boot applications
   - Frontend (3000): Stop any other React applications

3. **CORS Errors**:
   - Ensure backend is running on port 8080
   - Check proxy configuration in frontend package.json

4. **JWT Token Issues**:
   - Clear browser localStorage
   - Re-login to get a fresh token

### Logs:
- Backend logs: Check IntelliJ console or terminal
- Frontend logs: Check browser developer console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for educational purposes at the University of Ruhuna, Faculty of Engineering.