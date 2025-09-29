/**
 * Exercise model for the Workout Tracker app
 * Represents a single exercise with its properties
 */
export class Exercise {
  constructor(id, name, type, targetMuscle, secondaryMuscle, levels = []) {
    this.id = id;
    this.name = name;
    this.type = type; // 'Warmup', 'Stretching', 'Main'
    this.targetMuscle = targetMuscle;
    this.secondaryMuscle = secondaryMuscle;
    this.levels = levels; // Array of exercise levels for progression
    this.createdAt = new Date().toISOString();
  }

  // Static method to create exercise from object
  static fromObject(obj) {
    const exercise = new Exercise(
      obj.id,
      obj.name,
      obj.type,
      obj.targetMuscle,
      obj.secondaryMuscle,
      obj.levels || []
    );
    exercise.createdAt = obj.createdAt;
    return exercise;
  }

  // Get all available exercise types
  static getTypes() {
    return ['Warmup', 'Stretching', 'Main'];
  }

  // Get all available muscle groups
  static getMuscleGroups() {
    return [
      'Chest',
      'Back',
      'Shoulders',
      'Arms',
      'Core',
      'Legs',
      'Glutes',
      'Full Body',
      'Cardio'
    ];
  }

  // Add a level to the exercise
  addLevel(levelName) {
    if (levelName && levelName.trim() !== '') {
      this.levels.push(levelName.trim());
    }
  }

  // Remove a level from the exercise
  removeLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < this.levels.length) {
      this.levels.splice(levelIndex, 1);
    }
  }

  // Update a level name
  updateLevel(levelIndex, newName) {
    if (levelIndex >= 0 && levelIndex < this.levels.length && newName && newName.trim() !== '') {
      this.levels[levelIndex] = newName.trim();
    }
  }

  // Get level by index
  getLevel(levelIndex) {
    return this.levels[levelIndex] || null;
  }

  // Check if exercise has levels
  hasLevels() {
    return this.levels && this.levels.length > 0;
  }

  // Validate exercise data
  static validate(exerciseData) {
    const errors = [];
    
    if (!exerciseData.name || exerciseData.name.trim() === '') {
      errors.push('Exercise name is required');
    }
    
    if (!exerciseData.type || !Exercise.getTypes().includes(exerciseData.type)) {
      errors.push('Valid exercise type is required');
    }
    
    if (!exerciseData.targetMuscle || exerciseData.targetMuscle.trim() === '') {
      errors.push('Target muscle is required');
    }
    
    // Validate that at least one level is provided
    if (!exerciseData.levels || exerciseData.levels.length === 0) {
      errors.push('At least one exercise level is required');
    } else {
      // Validate that all levels have non-empty names
      const emptyLevels = exerciseData.levels.filter(level => !level || level.trim() === '');
      if (emptyLevels.length > 0) {
        errors.push('All exercise levels must have names');
      }
    }
    
    return errors;
  }
}