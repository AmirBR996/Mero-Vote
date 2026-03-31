# Mero Vote - Online Voting System 🗳️

A secure, modern online voting platform with facial recognition technology for voter verification. Built with Node.js, Express, React,postres js and facial recognition capabilities.

## 🎯 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Facial Recognition**: Face-based voter verification to ensure authenticity
- **Election Management**: Create and manage multiple elections
- **Candidate Management**: Manage candidates across different elections
- **Secure Voting**: Encrypted vote submission and storage
- **Admin Dashboard**: Administrative controls for election management
- **Real-time Results**: View election results
- **Protected Routes**: Role-based access control (Admin, User)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs/bcrypt
- **Validation & CORS**: Express middleware

### Frontend
- **Library**: React 19.x
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Face Recognition**: face-api.js
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Icons**: Lucide React, React Icons
- **Notifications**: React Hot Toast
- **UI Components**: React Modal

## 📋 Project Structure

```
Mero-Vote/
├── Backend/
│   ├── src/
│   │   ├── server.js                 # Express app setup
│   │   ├── controller/               # Request handlers
│   │   ├── routes/                   # API routes
│   │   ├── middleware/               # Auth & admin middleware
│   │   ├── db/                       # Database config & schema
│   │   └── utils/                    # JWT, password utilities
│   ├── drizzle/                      # Database migrations
│   ├── package.json
│   └── drizzle.config.js
│
└── Front_End/voting/
    ├── src/
    │   ├── App.jsx                   # Main app component
    │   ├── main.jsx                  # Entry point
    │   ├── api/                      # API integration
    │   ├── components/               # Reusable components
    │   ├── pages/                    # Page components
    │   ├── context/                  # React context (Auth)
    │   └── assets/                   # Static assets
    ├── public/                       # Face recognition models
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+)
- **npm** or **yarn**
- **PostgreSQL** (v12+)

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the `Backend/` directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/mero_vote

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Server Port
   PORT=3000
   ```

4. **Setup Database**
   ```bash
   # Generate migrations
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Seed initial elections
   npm run db:seed

   # (Optional) Promote user to admin
   npm run user:make-admin
   ```

5. **Start Backend Server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

   Backend will be running on `http://localhost:3000`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Front_End/voting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables** (if needed)
   Create a `.env` file with API URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Frontend will be running on `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users` - List all users (Admin)

### Elections
- `GET /elections` - Get all elections
- `GET /elections/:id` - Get election details
- `POST /elections` - Create election (Admin)
- `PUT /elections/:id` - Update election (Admin)
- `DELETE /elections/:id` - Delete election (Admin)

### Candidates
- `GET /candidates` - Get all candidates
- `GET /candidates/:electionId` - Get candidates for election
- `POST /candidates` - Add candidate (Admin)
- `DELETE /candidates/:id` - Delete candidate (Admin)

### Votes
- `POST /votes` - Submit vote
- `GET /votes/results/:electionId` - Get election results
- `GET /votes/user/:userId` - Get user's votes

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Face Recognition**: Facial verification to prevent impersonation
- **CORS Protection**: Configured origin restrictions
- **Role-based Access Control**: Admin and User roles
- **Protected Routes**: HTTPS-ready endpoints with middleware validation

## 📖 Usage

### For Voters
1. Register with email and password
2. Verify identity using facial recognition
3. Browse available elections
4. Select election and vote
5. View election results after voting closes

### For Administrators
1. Login with admin credentials
2. Create and manage elections
3. Add candidates to elections
4. Monitor voting activity
5. View real-time election results

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database user has proper permissions

### Facial Recognition Not Working
- Ensure face models are downloaded in `Front_End/voting/public/models/`
- Check browser console for model loading errors
- Verify adequate lighting for face detection

### CORS Errors
- Confirm backend CORS configuration includes frontend URL
- Default: `http://localhost:5173` and `http://localhost:5174`

### Port Already in Use
- Backend: Change `PORT=3000` in `.env`
- Frontend: Vite will prompt to use different port

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Amir

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Version**: 2.0.0  
**Last Updated**: March 2026
