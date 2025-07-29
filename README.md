# 🎯 JobStack - Job Portal Application

A comprehensive job portal platform that connects job seekers with recruiters, featuring real-time communication, intelligent resume matching, and streamlined application management.

## ✨ Features

### For Job Seekers (Applicants)
- 📝 **Profile Management** - Create and update professional profiles
- 📄 **Resume Upload** - Upload and manage resumes with intelligent parsing
- 🔍 **Job Search & Application** - Browse and apply for jobs seamlessly
- 💬 **Real-time Communication** - Chat with recruiters and receive notifications
- 📊 **Application Tracking** - Monitor application status and history
- 🎯 **Smart Job Matching** - AI-powered job recommendations based on skills

### For Recruiters
- 🏢 **Recruiter Dashboard** - Comprehensive view of job postings and applications
- 📋 **Job Management** - Create, edit, and manage job listings
- 👥 **Candidate Management** - Review applications and candidate profiles
- 🤖 **Resume Matching** - AI-powered candidate ranking and filtering
- 💬 **Direct Communication** - Chat with candidates in real-time
- 📈 **Analytics** - Track recruitment metrics and performance

### For Administrators
- 🛠️ **Admin Panel** - System-wide management and oversight
- 👥 **User Management** - Manage users, roles, and permissions
- 📊 **Platform Analytics** - Monitor platform usage and statistics
- 🔧 **System Configuration** - Configure platform settings and features

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **JWT Decode** - Token management
- **Date-fns** - Date manipulation utilities

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **PDF-Parse** - Resume parsing functionality
- **Natural** - Natural language processing for resume analysis

## 📁 Project Structure

```
JobStack/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   └── assets/         # Static assets
│   ├── public/             # Public static files
│   └── package.json        # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── controllers/        # Business logic controllers
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── middlewares/       # Custom middleware functions
│   ├── services/          # Business services
│   ├── utils/             # Utility functions
│   ├── uploads/           # File upload storage
│   └── package.json       # Backend dependencies
└── README.md              # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/S-Rahul-Naik/JobStack.git
cd JobStack
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobstack
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Start the Application

#### Start Backend Server
```bash
cd server
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

#### Start Frontend Development Server
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🔧 Available Scripts

### Backend (`server/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend (`client/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features Explained

### Real-time Communication
- WebSocket-based chat system between recruiters and applicants
- Real-time notifications for new messages and application updates
- Chat history and conversation management

### Intelligent Resume Matching
- AI-powered resume parsing and skill extraction
- Automatic candidate ranking based on job requirements
- Smart job recommendations for applicants

### Comprehensive Dashboard
- Role-based dashboards for different user types
- Real-time analytics and reporting
- Application status tracking and management

### Security Features
- JWT-based authentication and authorization
- Role-based access control (RBAC)
- Secure file upload and storage
- Password encryption with bcrypt

## 🔐 Authentication & Authorization

The application implements a role-based authentication system:

- **Applicants** - Can create profiles, upload resumes, apply for jobs, and communicate with recruiters
- **Recruiters** - Can post jobs, review applications, communicate with candidates
- **Admins** - Have full system access and can manage users and platform settings

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: S Rahul Naik
- **GitHub**: [@S-Rahul-Naik](https://github.com/S-Rahul-Naik)

## 📞 Support

For support and questions, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

## 🚧 Future Enhancements

- [ ] Video interview integration
- [ ] Advanced analytics dashboard
- [ ] Mobile application (React Native)
- [ ] Integration with LinkedIn and other job boards
- [ ] Advanced AI-powered candidate matching
- [ ] Multi-language support
- [ ] Email notification system
- [ ] Advanced reporting and analytics

---

⭐ **Star this repository if you find it helpful!**

Built with ❤️ by [S Rahul Naik](https://github.com/S-Rahul-Naik)
