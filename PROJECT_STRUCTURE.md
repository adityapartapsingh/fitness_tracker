# Project Structure Guide

## Overview
This fitness tracker is organized using industry best practices for scalability and maintainability.

## Backend Structure

### `/config`
- **database.js** - MongoDB connection management
- **constants.js** - Application constants (JWT secret, ports, etc.)

### `/middleware`
- **authMiddleware.js** - JWT authentication
- **asyncHandler.js** - Wraps async route handlers for error catching
- **errorHandler.js** - Global error handling

### `/controllers`
- **workoutController.js** - Business logic for workout operations
- **authController.js** - Authentication logic
- **profileController.js** - User profile operations
- **aiController.js** - AI workout generation

### `/routes`
- **workoutRoutes.js** - Workout CRUD endpoints
- **authRoutes.js** - Authentication endpoints
- **profileRoutes.js** - Profile endpoints
- **aiRoutes.js** - AI service endpoints

### `/models`
- **Workout.js** - MongoDB Workout schema
- **User.js** - MongoDB User schema

### `/utils`
- **responseHandler.js** - Standardized response formatting
- **sendEmail.js** - Email utilities

### `/lib`
- **aiProviders.js** - AI provider integrations

## Frontend Structure

### `/constants`
- **apiConstants.js** - API endpoints and base URL configuration

### `/hooks`
- **useCustom.js** - Custom React hooks (useAsync, useForm, useLocalStorage, usePagination)

### `/utils`
- **helpers.js** - Utility functions (date formatting, validation, etc.)
- **errorHandler.js** - Centralized error handling

### `/api`
- **client.js** - Centralized API client with interceptors
- **authAPI.js** - Auth endpoints
- **profileAPI.js** - Profile endpoints
- **workoutAPI.js** - Workout endpoints

### `/components`
- Organized by feature
- **Auth/** - Login, Signup, ResetPassword
- **Dashboard.js** - Main dashboard
- **WorkoutForm.js** - Add workout form
- **WorkoutList.js** - Workout history display
- **Statistics.js** - Stats display
- **ProgressCharts.js** - Visualization

### `/pages`
- **AuthPage.js** - Authentication page
- **Dashboard.js** - Main app page

## Key Improvements Made

### Backend
1. ✅ Configuration separation (config/)
2. ✅ Middleware consolidation (asyncHandler, errorHandler)
3. ✅ Controller-based route handling
4. ✅ Unified response format (responseHandler)
5. ✅ Better error messages
6. ✅ Token expiration handling
7. ✅ Environment variables management

### Frontend
1. ✅ Centralized API client with interceptors
2. ✅ Custom hooks for common operations
3. ✅ Utility functions library
4. ✅ Error handling utilities
5. ✅ API constants management
6. ✅ Form handling hook
7. ✅ Local storage hook

## Best Practices Implemented

### Code Organization
- **Separation of Concerns** - Each module has a single responsibility
- **DRY Principle** - No code duplication (utilities, hooks)
- **Configuration Management** - Centralized config files

### Error Handling
- Global error middleware on backend
- Interceptors on frontend for common errors
- Specific error types and messages

### API Communication
- Request/response interceptors
- Automatic token attachment
- Unified error handling
- Consistent response format

### Security
- JWT token validation
- Authorization checks
- Environment variable protection
- Secure password handling

### Maintainability
- Clear naming conventions
- JSDoc comments on functions
- Grouped related functionality
- Easy to extend and modify

## Running the Application

### Backend
```bash
cd backend
npm install
# Copy .env.example to .env and configure
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Copy .env.example to .env if needed
npm start
```

## Environment Setup

See `.env.example` files in both directories for required variables.

## Next Steps for Further Improvement
1. Add input validation using Joi or express-validator
2. Add request logging middleware
3. Add rate limiting
4. Add API documentation (Swagger/OpenAPI)
5. Add unit and integration tests
6. Add CI/CD pipeline
7. Container (Docker) setup
