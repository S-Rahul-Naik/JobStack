# 🎯 JobStack - Complete Job Portal Platform

A full-stack job portal application built with modern web technologies that connects job seekers with recruiters through intelligent matching, real-time communication, and comprehensive application management.

## 🚀 Tech Stack Overview

### Frontend Architecture
- **React 19.1.0** - Latest React with concurrent features and automatic batching
- **Vite 4.4.1** - Ultra-fast build tool with HMR (Hot Module Replacement)
- **React Router DOM 7.6.0** - Client-side routing with nested routes and data loading
- **Tailwind CSS 3.x** - Utility-first CSS framework for responsive design
- **PostCSS & Autoprefixer** - CSS processing and browser compatibility
- **Axios 1.9.0** - Promise-based HTTP client for API communication
- **JWT Decode 4.0.0** - Client-side JWT token parsing and validation
- **Date-fns 4.1.0** - Modern date utility library for formatting and manipulation

### Backend Architecture
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework with middleware support
- **MongoDB 6.16.0** - NoSQL document database for flexible data storage
- **Mongoose 8.15.0** - ODM (Object Document Mapper) for MongoDB
- **JWT (jsonwebtoken 9.0.2)** - Stateless authentication tokens
- **Bcrypt.js 3.0.2** - Password hashing with salt rounds
- **Multer 2.0.2** - Middleware for handling multipart/form-data (file uploads)
- **PDF-Parse 1.1.1** - Extract text content from PDF resumes
- **Natural 8.0.1** - Natural language processing for skill extraction
- **ExcelJS 4.4.0** - Excel file generation for reports
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **Dotenv 16.5.0** - Environment variable management

## 🏗️ Application Architecture

### Frontend Structure
```
client/src/
├── components/           # Reusable UI components
│   ├── Chat/            # Real-time chat components
│   ├── Navbar.jsx       # Main navigation with role-based menus
│   ├── ProtectedRoute.jsx # Route protection based on authentication
│   └── GlobalFooterBar.jsx # Application footer
├── pages/               # Main application pages
│   ├── Login.jsx        # Authentication with profile completion
│   ├── Register.jsx     # User registration
│   ├── ApplicantDashboard.jsx # Job seeker dashboard
│   ├── RecruiterDashboard.jsx # Recruiter management panel
│   ├── AdminDashboard.jsx     # Admin control panel
│   ├── Profile.jsx      # User profile management
│   ├── Chat.jsx         # Real-time messaging interface
│   ├── UploadResume.jsx # Resume upload and parsing
│   └── ApplicantApplications.jsx # Application tracking
├── context/             # React Context providers
│   └── AuthContext.jsx  # Global authentication state
├── services/            # API service functions
│   └── api.js          # Axios configuration and API calls
└── assets/             # Static resources
```

### Backend Structure
```
server/
├── controllers/         # Business logic handlers
│   ├── authController.js      # Authentication & user management
│   ├── jobController.js       # Job posting and management
│   ├── applicationController.js # Application processing
│   ├── communicationController.js # Chat functionality
│   ├── resumeController.js    # Resume upload and parsing
│   └── adminController.js     # Admin operations
├── models/             # Database schemas
│   ├── User.js         # User profiles (applicants, recruiters, admins)
│   ├── Job.js          # Job postings with requirements
│   ├── Application.js  # Job applications with status tracking
│   ├── ArchivedApplication.js # Historical application data
│   ├── Conversation.js # Chat conversations
│   └── Message.js      # Individual chat messages
├── routes/             # API endpoint definitions
│   ├── authRoutes.js   # Authentication endpoints
│   ├── jobRoutes.js    # Job management endpoints
│   ├── applicationRoutes.js # Application endpoints
│   ├── communicationRoutes.js # Chat endpoints
│   ├── resumeRoutes.js # Resume handling endpoints
│   └── adminRoutes.js  # Admin panel endpoints
├── middlewares/        # Custom middleware functions
│   ├── authMiddleware.js # JWT token verification
│   ├── roleMiddleware.js # Role-based access control
│   └── uploadMiddleware.js # File upload handling
├── services/           # Business services
│   └── aiService.js    # AI-powered resume matching
├── utils/             # Utility functions
│   ├── resumeParser.js # PDF text extraction and parsing
│   └── resumeMatcher.js # Skill matching algorithms
└── uploads/           # File storage directory
```

## 🔥 Key Features Breakdown

### 1. Authentication & Authorization System
**How it works:**
- JWT-based stateless authentication
- Role-based access control (Applicant, Recruiter, Admin)
- Password hashing with bcrypt (10 salt rounds)
- Token expiration and refresh handling
- Profile completion flow for new users

**Technical Implementation:**
- `authMiddleware.js` - Verifies JWT tokens on protected routes
- `roleMiddleware.js` - Checks user roles for specific endpoints
- `AuthContext.jsx` - Global state management for user session

### 2. Real-time Communication System
**How it works:**
- WebSocket-like real-time messaging between recruiters and applicants
- Conversation threading and message history
- Notification system for new messages
- Chat status indicators (online/offline)

**Technical Implementation:**
- `communicationController.js` - Handles message creation and retrieval
- `Conversation.js` & `Message.js` models - Database schema for chat data
- `ChatNotifications.jsx` - Real-time notification component
- `Chat.jsx` - Main chat interface with message history

### 3. Intelligent Resume Processing
**How it works:**
- PDF text extraction using pdf-parse library
- Natural language processing for skill identification
- Automatic categorization of experience and education
- Skill matching against job requirements
- Resume scoring and ranking system

**Technical Implementation:**
- `resumeParser.js` - Extracts text from uploaded PDF files
- `aiService.js` - AI algorithms for resume analysis
- `resumeMatcher.js` - Matches candidate skills with job requirements
- `uploadMiddleware.js` - Handles secure file uploads

### 4. Job Management System
**How it works:**
- Dynamic job posting with custom requirements
- Application tracking with status updates
- Automated candidate filtering and ranking
- Bulk application management
- Job analytics and reporting

**Technical Implementation:**
- `jobController.js` - CRUD operations for job postings
- `applicationController.js` - Application lifecycle management
- `Job.js` model - Flexible job schema with requirements array
- `Application.js` model - Application status tracking

### 5. Admin Dashboard & Analytics
**How it works:**
- System-wide user management
- Platform usage analytics
- Role assignment and permissions
- Data export capabilities
- System configuration management

**Technical Implementation:**
- `adminController.js` - Admin-specific operations
- Role-based middleware for admin routes
- Excel report generation using ExcelJS
- Advanced MongoDB aggregation queries

## 🛠️ Setup Instructions

### Prerequisites
```bash
Node.js >= 16.0.0
MongoDB >= 5.0
npm >= 8.0.0
```

### 1. Environment Configuration
Create `.env` in server directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/jobstack
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobstack

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES=application/pdf

# AI Service (if using external APIs)
OPENAI_API_KEY=your_openai_key_here
```

### 2. Database Setup
```bash
# Start MongoDB locally
mongod --dbpath /path/to/your/db

# Or use MongoDB Atlas cloud database
# Create cluster and get connection string
```

### 3. Backend Installation
```bash
cd server
npm install

# Install development dependencies
npm install --save-dev nodemon

# Start development server
npm run dev
```

### 4. Frontend Installation
```bash
cd client
npm install

# Start development server
npm run dev
```

## 🔧 Available Scripts

### Backend Scripts
```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm run test       # Run tests (if configured)
```

### Frontend Scripts
```bash
npm run dev        # Development server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint code checking
```

## 📱 User Roles & Capabilities

### 👤 Applicants (Job Seekers)
- **Profile Management**: Complete profile with skills, experience, education
- **Resume Upload**: PDF upload with automatic parsing and skill extraction
- **Job Search**: Browse jobs with filters (location, salary, experience level)
- **Application Tracking**: Real-time status updates (Applied, Reviewed, Interview, Hired, Rejected)
- **Communication**: Direct messaging with recruiters
- **Recommendations**: AI-powered job suggestions based on profile
- **Application History**: Complete history of all applications

### 🏢 Recruiters
- **Job Posting**: Create detailed job postings with specific requirements
- **Candidate Management**: View and filter applications
- **Resume Analysis**: AI-powered candidate ranking and matching
- **Communication**: Chat with potential candidates
- **Interview Scheduling**: Manage interview processes
- **Analytics**: Track recruitment metrics and success rates
- **Bulk Operations**: Manage multiple applications simultaneously

### 👑 Administrators
- **User Management**: Create, edit, and manage all user accounts
- **System Analytics**: Platform usage statistics and reports
- **Content Moderation**: Review and moderate job postings and profiles
- **Role Management**: Assign and modify user roles
- **Data Export**: Generate comprehensive reports in Excel format
- **System Configuration**: Modify platform settings and parameters

## 🔐 Security Features

### Authentication Security
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: Bcrypt with 10 salt rounds
- **Token Validation**: Middleware-based token verification
- **Role-based Access**: Route protection based on user roles

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Type and size restrictions for uploads
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data in environment files

### API Security
- **Rate Limiting**: Prevent abuse with request rate limiting
- **Helmet Integration**: Security headers for Express.js
- **HTTPS Ready**: SSL/TLS certificate support
- **MongoDB Injection Prevention**: Mongoose schema validation

## 🎨 Frontend Features

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layout for tablets
- **Desktop Optimization**: Full-featured desktop experience
- **Cross-browser**: Compatible with modern browsers

### User Interface
- **Tailwind CSS**: Utility-first styling approach
- **Component-based**: Reusable UI components
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG 2.1 compliant interface
- **Loading States**: Skeleton screens and loading indicators

### Performance
- **Vite Build**: Ultra-fast development and build process
- **Code Splitting**: Dynamic imports for optimal loading
- **Image Optimization**: Compressed and responsive images
- **Caching Strategy**: Browser and service worker caching

## 🤖 AI & Machine Learning Features

### Resume Parsing
- **Text Extraction**: PDF content extraction using pdf-parse
- **Skill Identification**: NLP-based skill recognition
- **Experience Calculation**: Automatic experience level detection
- **Education Parsing**: Degree and institution extraction

### Matching Algorithm
- **Skill Matching**: Weighted skill comparison
- **Experience Matching**: Level and domain experience matching
- **Location Matching**: Geographic preference matching
- **Salary Matching**: Compensation expectation alignment

### Recommendations
- **Job Recommendations**: ML-based job suggestions
- **Candidate Recommendations**: Recruiter-focused candidate suggestions
- **Skill Gap Analysis**: Identification of missing skills
- **Career Path Suggestions**: Progression recommendations

## 📊 Analytics & Reporting

### User Analytics
- **Application Success Rate**: Track hiring success
- **Profile Completion Rate**: Monitor profile quality
- **Engagement Metrics**: User activity tracking
- **Conversion Funnels**: Application to hire conversion

### System Analytics
- **Performance Monitoring**: API response times
- **Error Tracking**: Application error monitoring
- **Usage Statistics**: Feature usage analytics
- **Database Performance**: Query optimization metrics

## 🚀 Deployment Guide

### Production Build
```bash
# Frontend build
cd client
npm run build

# Backend preparation
cd server
npm install --production
```

### Docker Deployment
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup
- **Production Database**: MongoDB Atlas or dedicated MongoDB server
- **File Storage**: AWS S3 or similar cloud storage
- **SSL Certificate**: Let's Encrypt or commercial SSL
- **Domain Configuration**: DNS setup and domain pointing

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards and add tests
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Create Pull Request

### Code Standards
- **ESLint Configuration**: Follow provided ESLint rules
- **Prettier Formatting**: Use Prettier for code formatting
- **Component Structure**: Follow React best practices
- **API Design**: RESTful API conventions
- **Documentation**: Comment complex logic and functions

## 📞 Support & Contact

- **GitHub Issues**: Report bugs and request features
- **Developer**: S Rahul Naik
- **Email**: Contact through GitHub profile
- **Documentation**: Comprehensive README and code comments

---

⭐ **Star this repository if you find it helpful!**

Built with ❤️ using modern web technologies by [S Rahul Naik](https://github.com/S-Rahul-Naik)
