# Quick Start Guide - Exercise Progress Tracker

Get your fitness tracker running in 5 minutes!

## 🚀 Quick Setup

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

## 🎯 Running the Application

### Terminal 1 - Start Backend Server
```bash
cd backend
npm run dev
```
✅ Backend will run on: http://localhost:5000

### Terminal 2 - Start Frontend Application
```bash
cd frontend
npm start
```
✅ Frontend will open on: http://localhost:3000

## 📋 First Steps

1. **Open Dashboard Tab** - See your statistics and charts
2. **Add a Workout** - Click "Add Workout" and fill the form
3. **View Progress** - Check the Dashboard for charts and stats
4. **Browse History** - See all your logged workouts

## 📊 Try Adding Sample Data

Here are some example workouts you can add:

### Workout 1: Running
- Exercise: Running
- Duration: 30 minutes
- Calories: 300
- Notes: Morning jog at the park

### Workout 2: Gym Session
- Exercise: Bench Press
- Duration: 45 minutes
- Calories: 350
- Reps: 12
- Weight: 185 lbs

### Workout 3: Yoga
- Exercise: Yoga
- Duration: 60 minutes
- Calories: 150
- Notes: Evening relaxation session

## 🔧 Configuration

### MongoDB Atlas Connection
Already configured with your credentials:
- **User**: adityapartapsingh92_db_user
- **Database**: fitness_tracker
- **Connection**: MongoDB Atlas (Cloud)

### Backend Port
Default: 5000 (can be changed in `backend/.env`)

### Frontend Port
Default: 3000 (React dev server default)

## 💡 Common Commands

### Backend
```bash
npm run dev    # Start with auto-reload
npm start      # Start production server
```

### Frontend
```bash
npm start      # Start dev server
npm build      # Build for production
npm test       # Run tests
```

## 🐛 Troubleshooting

**Backend not connecting?**
```bash
# Check if port 5000 is available
# Verify MongoDB Atlas connection in .env
# Try: npm run dev
```

**Frontend won't load?**
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm start
```

**CORS errors?**
```bash
# Ensure backend is running before frontend
# Both need to be running simultaneously
```

## 📚 Project Files Overview

```
fitness-tracker/
├── backend/
│   ├── models/Workout.js       # Data model
│   ├── server.js               # API server
│   ├── .env                    # Configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   ├── api/                # API integration
    │   ├── App.js              # Main app
    │   └── App.css             # Styles
    └── package.json
```

## 🎨 Features to Explore

- ✅ Add multiple workouts with different exercises
- ✅ View real-time statistics updates
- ✅ Interactive charts showing progress
- ✅ Delete workouts from history
- ✅ Responsive design on mobile

## 🚀 Next Steps

1. Add 5-10 workouts to see charts populate
2. Check the Dashboard for visualization
3. Explore the responsive mobile design
4. Customize exercises based on your routine

## 📱 Responsive Design

The application works perfectly on:
- 🖥️ Desktop (1920px and above)
- 💻 Laptop (1024px to 1920px)
- 📱 Tablet (768px to 1024px)
- 📱 Mobile (320px to 768px)

## ⚡ Performance Notes

- Charts auto-update when workouts are added
- Responsive design adapts to screen size
- Data persists in MongoDB Atlas
- Smooth animations and transitions

---

**Ready to track your fitness? Get started now! 🏋️💪**

For full documentation, see [README.md](README.md)
