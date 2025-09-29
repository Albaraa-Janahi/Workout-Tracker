# 🏋️ Workout Tracker

A comprehensive calisthenics workout tracking app built with React. Perfect for transitioning from gym workouts to home-based calisthenics training.

## ✨ Features

### 🏃‍♂️ Exercise Management
- Create, edit, and delete exercises
- Categorize exercises by type (Warmup, Stretching, Main)
- Specify target and secondary muscles
- Organize exercises by muscle groups

### 🏋️ Workout Planning
- Build custom workout routines
- Select exercises from your library
- Auto-populate muscles covered
- Set recommended workout days
- Track workout composition

### ⏱️ Session Tracking
- Interactive workout timer (default 100 seconds)
- Customizable rest periods (1:00, 1:30, 2:00, 2:30)
- Real-time exercise tracking
- Previous performance comparison
- Progress visualization

### 📊 Progress Analytics
- Comprehensive workout statistics
- Performance insights and trends
- Completion rates and volume tracking
- Recent activity timeline
- Data export functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WorkoutTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the app.

## 📱 App Structure

### Screens

1. **Exercise Management** (`/exercises`)
   - Create and manage your exercise library
   - Organize by type and muscle groups
   - Edit exercise details and specifications

2. **Workout Planning** (`/workouts`)
   - Build workout routines
   - Select exercises and set schedules
   - Start workout sessions

3. **Profile & Statistics** (`/profile`)
   - View workout analytics
   - Track progress over time
   - Export data and manage settings

4. **Workout Session** (`/session/:workoutId`)
   - Active workout tracking
   - Timer and rest management
   - Exercise completion tracking

### Data Models

- **Exercise**: Individual exercise with type, muscles, and metadata
- **Workout**: Collection of exercises with scheduling and organization
- **WorkoutSession**: Individual workout instance with performance data

## 💾 Data Storage

All data is stored locally in your browser using localStorage:
- **Exercises**: Your personal exercise library
- **Workouts**: Custom workout routines
- **Sessions**: Historical workout performance
- **User Profile**: Personal settings and statistics

## 🎨 Design Features

- **Modern UI**: Clean, intuitive interface with gradient designs
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Color-coded**: Visual indicators for exercise types and progress
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🔧 Customization

### Adding New Exercise Types
Edit `src/models/Exercise.js` to add new exercise categories:
```javascript
static getTypes() {
  return ['Warmup', 'Stretching', 'Main', 'YourNewType'];
}
```

### Adding New Muscle Groups
Update the muscle groups list in the same file:
```javascript
static getMuscleGroups() {
  return [
    'Chest', 'Back', 'Shoulders', 'Arms', 
    'Core', 'Legs', 'Glutes', 'Full Body', 
    'Cardio', 'YourNewMuscle'
  ];
}
```

### Customizing Timer Defaults
Modify the default timer duration in `src/screens/SessionScreen.js`:
```javascript
const [timer, setTimer] = useState(120); // Change to your preferred default
```

## 📈 Usage Tips

1. **Start with Exercises**: Build your exercise library first
2. **Create Workouts**: Combine exercises into structured routines
3. **Track Sessions**: Use the timer and tracking features during workouts
4. **Monitor Progress**: Check your profile for insights and improvements
5. **Export Data**: Backup your progress regularly

## 🛠️ Technical Details

- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router DOM for navigation
- **Storage**: Browser localStorage for data persistence
- **Styling**: Custom CSS with modern design patterns
- **State Management**: React useState and useEffect hooks

## 📝 Development Notes

- All components are well-commented for easy modification
- Data models include validation and utility methods
- Local storage utilities handle all data persistence
- Responsive design works on all screen sizes
- No external dependencies beyond React ecosystem

## 🎯 Future Enhancements

Potential features for future development:
- Workout templates and sharing
- Advanced analytics and charts
- Exercise video demonstrations
- Social features and challenges
- Mobile app version
- Cloud synchronization

## 📄 License

This project is for personal use. Feel free to modify and adapt for your own workout tracking needs.

---

**Happy Training! 💪**

Start your calisthenics journey with organized, trackable workouts that help you progress and stay motivated.