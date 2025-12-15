# Exercise Progress Tracker - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (Port 3000)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │         App.js (Main Component)                  │  │
│  │  - State Management (workouts, stats, activeTab) │  │
│  │  - Tab Navigation (Dashboard, Add, History)      │  │
│  └──────────────────────────────────────────────────┘  │
│           ↓          ↓          ↓          ↓             │
│  ┌────────┴────┬──────────┬──────────┬─────────────┐   │
│  │ Statistics  │ Progress │ Workout  │ Workout    │   │
│  │ Component   │ Charts   │ Form     │ List       │   │
│  └────────┬────┴──────────┴──────────┴─────────────┘   │
│           │ (API Calls)                                  │
│  ┌────────▼──────────────────────────────────────────┐  │
│  │     workoutAPI Service (Axios Instance)           │  │
│  │  - getAllWorkouts()                               │  │
│  │  - createWorkout()                                │  │
│  │  - updateWorkout()                                │  │
│  │  - deleteWorkout()                                │  │
│  │  - getStats()                                     │  │
│  └────────┬──────────────────────────────────────────┘  │
└─────────────┼──────────────────────────────────────────┘
              │ HTTP/REST (JSON)
              ↓
┌─────────────────────────────────────────────────────────┐
│         Express Backend (Port 5000)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         server.js (Express App)                  │  │
│  │  - CORS Middleware                               │  │
│  │  - JSON Parser                                   │  │
│  │  - Request Routing                               │  │
│  └──────────────────────────────────────────────────┘  │
│           ↓          ↓          ↓          ↓             │
│  ┌────────┴────┬──────────┬──────────┬─────────────┐   │
│  │ GET /api/   │ POST /api│ PUT /api │ DELETE /api │   │
│  │ workouts    │ /workouts│ /workouts│ /workouts  │   │
│  └────────┬────┴──────────┴──────────┴─────────────┘   │
│           │ (Route Handlers)                             │
│  ┌────────▼──────────────────────────────────────────┐  │
│  │     Workout Model (Mongoose)                      │  │
│  │  - Schema Definition                              │  │
│  │  - Data Validation                                │  │
│  │  - Instance Methods                               │  │
│  └────────┬──────────────────────────────────────────┘  │
└─────────────┼──────────────────────────────────────────┘
              │ Connection String (MongoDB URI)
              ↓
┌─────────────────────────────────────────────────────────┐
│        MongoDB Atlas Cloud Database                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │      fitness_tracker (Database)                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  workouts Collection                       │ │  │
│  │  │  ┌──────────────────────────────────────┐ │ │  │
│  │  │  │ {                                    │ │ │  │
│  │  │  │   _id: ObjectId,                     │ │ │  │
│  │  │  │   exerciseName: String,              │ │ │  │
│  │  │  │   duration: Number,                  │ │ │  │
│  │  │  │   calories: Number,                  │ │ │  │
│  │  │  │   reps: Number,                      │ │ │  │
│  │  │  │   weight: Number,                    │ │ │  │
│  │  │  │   date: Date,                        │ │ │  │
│  │  │  │   notes: String,                     │ │ │  │
│  │  │  │   createdAt: Date                    │ │ │  │
│  │  │  │ }                                    │ │ │  │
│  │  │  └──────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Component Tree

```
App (Main Container)
├── Header
├── Navigation (Tabs)
│   ├── Dashboard Tab
│   │   ├── Statistics Component
│   │   │   └── 4 Stat Cards
│   │   └── ProgressCharts Component
│   │       ├── Line Chart (Calories & Duration)
│   │       ├── Pie Chart (Exercise Frequency)
│   │       └── Bar Chart (Top Exercises)
│   ├── Add Workout Tab
│   │   └── WorkoutForm Component
│   │       └── Form Inputs
│   └── History Tab
│       └── WorkoutList Component
│           └── Workout Cards Grid
└── Footer
```

## Data Flow Architecture

### Creating a Workout (POST)

```
1. User Input
   ↓
2. WorkoutForm Component (React)
   - Validates input
   - Prepares data object
   ↓
3. workoutAPI.createWorkout(data)
   - Axios POST request
   - Sends to http://localhost:5000/api/workouts
   ↓
4. Express Backend (server.js)
   - Receives POST request
   - Creates Workout model instance
   ↓
5. Mongoose Validation
   - Validates schema
   - Generates ObjectId
   ↓
6. MongoDB Storage
   - Inserts document
   - Returns saved document
   ↓
7. Response (201 Created)
   - Backend sends workout object back
   ↓
8. Frontend Update
   - State updates
   - Components re-render
   - Charts refresh
   ↓
9. UI Feedback
   - Success message shown
   - Form clears
   - Statistics update
```

### Fetching Workouts (GET)

```
1. App Component Mount
   - useEffect hook triggers
   ↓
2. fetchWorkouts() called
   - workoutAPI.getAllWorkouts()
   - Axios GET request
   ↓
3. Express Route Handler
   - GET /api/workouts
   - Mongoose query: find()
   ↓
4. MongoDB Query
   - Retrieves all documents
   - Sorts by date (descending)
   ↓
5. Response (200 OK)
   - Returns array of workouts
   ↓
6. Frontend Processing
   - setWorkouts(data)
   - State updates
   ↓
7. Component Re-render
   - WorkoutList gets new data
   - Charts recalculate
   - Statistics update
```

### Deleting a Workout (DELETE)

```
1. User Clicks Delete
   - Confirmation dialog
   ↓
2. handleDeleteWorkout(id)
   - workoutAPI.deleteWorkout(id)
   - Axios DELETE request
   ↓
3. Express Route Handler
   - DELETE /api/workouts/:id
   - Mongoose: findByIdAndDelete()
   ↓
4. MongoDB Operation
   - Finds document by _id
   - Deletes document
   ↓
5. Response (200 OK)
   - Returns success message
   ↓
6. Frontend Update
   - fetchWorkouts() called
   - State refreshed
   ↓
7. UI Update
   - Workout card disappears
   - Statistics recalculate
   - Charts update
```

## File & Responsibility Breakdown

### Backend Files

#### server.js
```
Responsibilities:
- Initialize Express app
- Configure middleware (CORS, JSON)
- Connect to MongoDB
- Define all API routes
- Handle errors
- Start server on port 5000

Size: ~100 lines
Routes: 8 endpoints
```

#### models/Workout.js
```
Responsibilities:
- Define MongoDB schema
- Specify field types
- Set validation rules
- Create Mongoose model
- Export for use in server

Size: ~30 lines
Fields: 9 (including system fields)
```

### Frontend Files

#### App.js
```
Responsibilities:
- Main application component
- Manage global state (workouts, stats, activeTab)
- Handle API calls (fetch workouts, stats)
- Route between tabs
- Pass data to child components
- Handle user actions

Size: ~80 lines
State: 3 useState hooks
Effects: 1 useEffect hook
```

#### api/workoutAPI.js
```
Responsibilities:
- Create axios instance
- Define API methods
- Handle base URL
- Set default headers
- Export API functions

Size: ~25 lines
Methods: 6 (CRUD + Stats)
```

#### components/WorkoutForm.js
```
Responsibilities:
- Display form for adding workouts
- Handle form input changes
- Validate required fields
- Submit workout data
- Show success message
- Clear form on submit

Size: ~90 lines
State: 2 useState hooks
Fields: 6 input fields
```

#### components/WorkoutList.js
```
Responsibilities:
- Display all workouts
- Format workout data
- Show workout cards
- Handle delete action
- Show empty state
- Confirm deletion

Size: ~70 lines
Features: Card grid, delete button
```

#### components/Statistics.js
```
Responsibilities:
- Display 4 stat cards
- Show total workouts
- Show total calories
- Show total duration
- Show average calories
- Apply gradient styling

Size: ~35 lines
Props: stats object
Cards: 4 stat cards
```

#### components/ProgressCharts.js
```
Responsibilities:
- Process workout data
- Create chart datasets
- Render 3 different charts
- Show empty state
- Handle responsive sizing
- Use Recharts library

Size: ~120 lines
Charts: 3 types
Calculations: Data aggregation
```

## State Management Flow

```
App.js (Global State)
│
├── workouts: [Workout]
│   └── Updated by: fetchWorkouts(), handleAddWorkout(), handleDeleteWorkout()
│   └── Used by: WorkoutList, ProgressCharts, Statistics
│
├── stats: {totalWorkouts, totalCalories, ...}
│   └── Updated by: fetchStats()
│   └── Used by: Statistics
│
└── activeTab: 'dashboard' | 'add' | 'history'
    └── Updated by: setActiveTab()
    └── Used by: Conditional rendering
```

## Styling Architecture

### CSS Organization

```
frontend/src/
├── App.css
│   └── Global layout, header, nav, footer
│
├── index.css
│   └── Reset, body, scrollbar styling
│
├── components/
│   ├── WorkoutForm.css
│   │   └── Form styling, inputs, buttons
│   │
│   ├── WorkoutList.css
│   │   └── Card grid, workout cards, delete button
│   │
│   ├── Statistics.css
│   │   └── Stat cards, gradients, icons
│   │
│   └── ProgressCharts.css
│       └── Chart containers, grid, responsive
```

### CSS Features

- Custom CSS properties (--primary-color, etc.)
- Flexbox and Grid layouts
- Gradient backgrounds
- Media queries for responsiveness
- Smooth transitions and animations
- Shadow effects for depth
- Color coding for different sections

## API Contract

### Request/Response Examples

#### Create Workout
```
REQUEST:
POST /api/workouts
Content-Type: application/json

{
  "exerciseName": "Running",
  "duration": 30,
  "calories": 300,
  "reps": null,
  "weight": null,
  "notes": "Morning jog",
  "date": "2025-12-15T09:00:00Z"
}

RESPONSE (201):
{
  "_id": "507f1f77bcf86cd799439011",
  "exerciseName": "Running",
  "duration": 30,
  "calories": 300,
  "reps": null,
  "weight": null,
  "notes": "Morning jog",
  "date": "2025-12-15T09:00:00Z",
  "createdAt": "2025-12-15T10:00:00Z"
}
```

#### Get All Workouts
```
REQUEST:
GET /api/workouts

RESPONSE (200):
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "exerciseName": "Running",
    "duration": 30,
    "calories": 300,
    ...
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "exerciseName": "Yoga",
    "duration": 60,
    "calories": 150,
    ...
  }
]
```

#### Get Statistics
```
REQUEST:
GET /api/stats/summary

RESPONSE (200):
{
  "totalWorkouts": 5,
  "totalCalories": 1350,
  "totalDuration": 195,
  "avgCalories": 270
}
```

## Technology Integration Points

### React ↔ Axios
- Axios instance created in workoutAPI.js
- API methods called from components
- Responses processed and stored in state
- Error handling via try-catch

### Express ↔ MongoDB
- Mongoose connects on server start
- Routes use Workout model
- CRUD operations via Mongoose
- Data validated by schema

### Frontend ↔ Backend
- HTTP/REST communication
- JSON payload format
- CORS enabled for localhost:3000
- Base URL: http://localhost:5000

### Recharts ↔ React
- Charts receive data via props
- Data formatted in useMemo hook
- Charts auto-update on prop change
- ResponsiveContainer handles sizing

## Error Handling Strategy

### Frontend
```
API Error → try-catch block → console.error → Optional: Alert user
Form Error → Validation check → Alert message → Prevent submit
```

### Backend
```
Database Error → Catch block → 500 status → Error message response
Validation Error → Schema validation → 400 status → Error details
Not Found → 404 status → "Not found" message
```

## Performance Considerations

### Frontend
- useMemo for chart data calculations
- Components only re-render when data changes
- CSS transitions for smooth animations
- Lazy loading ready for future enhancements

### Backend
- Asynchronous handlers (async/await)
- Indexed database queries (.sort())
- Connection pooling via MongoDB Atlas
- Stateless design for scalability

## Scalability Architecture

Current Design:
- Single backend server (Node.js)
- Cloud database (MongoDB Atlas)
- Stateless REST API
- Responsive frontend

Future Enhancements:
- Load balancer for multiple backend instances
- Caching layer (Redis)
- Database indexing optimization
- Frontend code splitting
- PWA capabilities

---

This architecture provides a solid foundation for a modern fitness tracking application with room for growth and enhancement.
