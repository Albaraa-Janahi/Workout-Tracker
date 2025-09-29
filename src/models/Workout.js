/**
 * Workout model for the Workout Tracker app
 * Represents a workout routine with exercises and metadata
 */
export class Workout {
  constructor(id, name, exercises = [], recommendedDay = '') {
    this.id = id;
    this.name = name;
    this.exercises = exercises; // Array of exercise IDs
    this.musclesCovered = []; // Auto-populated based on exercises
    this.recommendedDay = recommendedDay;
    this.createdAt = new Date().toISOString();
  }

  // Static method to create workout from object
  static fromObject(obj) {
    const workout = new Workout(
      obj.id,
      obj.name,
      obj.exercises || [],
      obj.recommendedDay || ''
    );
    workout.musclesCovered = obj.musclesCovered || [];
    workout.createdAt = obj.createdAt;
    return workout;
  }

  // Get all available days of the week
  static getDaysOfWeek() {
    return [
      'Monday',
      'Tuesday', 
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];
  }

  // Update muscles covered based on selected exercises
  updateMusclesCovered(exercisesList) {
    const muscles = new Set();
    
    this.exercises.forEach(exerciseId => {
      const exercise = exercisesList.find(ex => ex.id === exerciseId);
      if (exercise) {
        muscles.add(exercise.targetMuscle);
        if (exercise.secondaryMuscle) {
          muscles.add(exercise.secondaryMuscle);
        }
      }
    });
    
    this.musclesCovered = Array.from(muscles);
  }

  // Get exercise count by type
  getExerciseCountByType(exercisesList) {
    const counts = { Warmup: 0, Stretching: 0, Main: 0 };
    
    this.exercises.forEach(exerciseId => {
      const exercise = exercisesList.find(ex => ex.id === exerciseId);
      if (exercise && counts.hasOwnProperty(exercise.type)) {
        counts[exercise.type]++;
      }
    });
    
    return counts;
  }

  // Validate workout data
  static validate(workoutData) {
    const errors = [];
    
    if (!workoutData.name || workoutData.name.trim() === '') {
      errors.push('Workout name is required');
    }
    
    if (!workoutData.exercises || workoutData.exercises.length === 0) {
      errors.push('At least one exercise is required');
    }
    
    return errors;
  }
}