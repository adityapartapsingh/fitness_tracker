require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');
const { connectMongoDB } = require('../config/database');

const exercises = [
    // === STRENGTH ===
    { name: 'Push-ups', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 7, instructions: 'Start in plank position, lower chest to floor, push back up. Keep core tight.' },
    { name: 'Pull-ups', category: 'strength', muscleGroups: ['back', 'biceps'], difficulty: 'intermediate', equipment: 'pull-up bar', caloriesPerMinute: 8, instructions: 'Hang from bar with palms facing away, pull chin above bar, lower slowly.' },
    { name: 'Squats', category: 'strength', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 8, instructions: 'Stand with feet shoulder-width apart, lower hips back and down, keep chest up.' },
    { name: 'Deadlifts', category: 'strength', muscleGroups: ['back', 'hamstrings', 'glutes'], difficulty: 'advanced', equipment: 'barbell', caloriesPerMinute: 9, instructions: 'Stand over barbell, hinge at hips, grip bar, drive through heels to stand.' },
    { name: 'Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], difficulty: 'intermediate', equipment: 'barbell', caloriesPerMinute: 7, instructions: 'Lie on bench, grip bar shoulder width, lower to chest, press up.' },
    { name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], difficulty: 'intermediate', equipment: 'barbell', caloriesPerMinute: 6, instructions: 'Stand with bar at shoulders, press overhead, lock out arms.' },
    { name: 'Barbell Rows', category: 'strength', muscleGroups: ['back', 'biceps'], difficulty: 'intermediate', equipment: 'barbell', caloriesPerMinute: 7, instructions: 'Hinge forward, pull barbell to lower chest, squeeze shoulder blades.' },
    { name: 'Dumbbell Curls', category: 'strength', muscleGroups: ['biceps'], difficulty: 'beginner', equipment: 'dumbbells', caloriesPerMinute: 5, instructions: 'Stand with dumbbells at sides, curl up to shoulders, lower slowly.' },
    { name: 'Tricep Dips', category: 'strength', muscleGroups: ['triceps', 'chest'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 6, instructions: 'Grip parallel bars, lower body by bending elbows, push back up.' },
    { name: 'Lunges', category: 'strength', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 7, instructions: 'Step forward, lower back knee toward floor, push back to standing.' },
    { name: 'Plank', category: 'strength', muscleGroups: ['core', 'shoulders'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 4, instructions: 'Hold push-up position on forearms, keep body straight, engage core.' },
    { name: 'Russian Twists', category: 'strength', muscleGroups: ['core', 'obliques'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 5, instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side.' },
    { name: 'Leg Press', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], difficulty: 'beginner', equipment: 'machine', caloriesPerMinute: 6, instructions: 'Sit in machine, push platform away with feet, lower slowly.' },
    { name: 'Lat Pulldown', category: 'strength', muscleGroups: ['back', 'biceps'], difficulty: 'beginner', equipment: 'machine', caloriesPerMinute: 5, instructions: 'Grip wide bar, pull down to upper chest, control return.' },
    { name: 'Cable Flys', category: 'strength', muscleGroups: ['chest'], difficulty: 'intermediate', equipment: 'cable machine', caloriesPerMinute: 5, instructions: 'Stand between cables, bring handles together in front, squeeze chest.' },

    // === CARDIO ===
    { name: 'Running', category: 'cardio', muscleGroups: ['legs', 'core'], difficulty: 'beginner', equipment: 'none', caloriesPerMinute: 11, instructions: 'Maintain steady pace, land midfoot, keep arms relaxed at 90 degrees.' },
    { name: 'Cycling', category: 'cardio', muscleGroups: ['quadriceps', 'hamstrings', 'calves'], difficulty: 'beginner', equipment: 'bicycle', caloriesPerMinute: 9, instructions: 'Maintain steady cadence, adjust resistance for intensity.' },
    { name: 'Jump Rope', category: 'cardio', muscleGroups: ['calves', 'shoulders', 'core'], difficulty: 'beginner', equipment: 'jump rope', caloriesPerMinute: 12, instructions: 'Jump with both feet, use wrists to turn rope, land softly.' },
    { name: 'Burpees', category: 'cardio', muscleGroups: ['full body'], difficulty: 'intermediate', equipment: 'bodyweight', caloriesPerMinute: 10, instructions: 'Squat down, jump feet back to plank, do a push-up, jump feet forward, jump up.' },
    { name: 'Mountain Climbers', category: 'cardio', muscleGroups: ['core', 'shoulders', 'legs'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 9, instructions: 'Start in plank, drive knees to chest alternately at a quick pace.' },
    { name: 'High Knees', category: 'cardio', muscleGroups: ['legs', 'core'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 8, instructions: 'Run in place bringing knees above hip level, pump arms.' },
    { name: 'Swimming', category: 'cardio', muscleGroups: ['full body'], difficulty: 'intermediate', equipment: 'pool', caloriesPerMinute: 10, instructions: 'Use proper stroke technique, breathe rhythmically, maintain steady pace.' },
    { name: 'Rowing', category: 'cardio', muscleGroups: ['back', 'legs', 'core'], difficulty: 'intermediate', equipment: 'rowing machine', caloriesPerMinute: 9, instructions: 'Drive with legs first, lean back slightly, pull handle to chest.' },
    { name: 'Stair Climbing', category: 'cardio', muscleGroups: ['quadriceps', 'glutes', 'calves'], difficulty: 'beginner', equipment: 'stairs', caloriesPerMinute: 9, instructions: 'Step up stairs at steady pace, use handrail for balance if needed.' },
    { name: 'Boxing', category: 'cardio', muscleGroups: ['shoulders', 'arms', 'core'], difficulty: 'intermediate', equipment: 'punching bag', caloriesPerMinute: 10, instructions: 'Maintain guard position, throw combinations, move feet.' },
    { name: 'Jumping Jacks', category: 'cardio', muscleGroups: ['full body'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 7, instructions: 'Jump feet apart while raising arms overhead, return to start.' },
    { name: 'Elliptical', category: 'cardio', muscleGroups: ['legs', 'arms'], difficulty: 'beginner', equipment: 'elliptical machine', caloriesPerMinute: 8, instructions: 'Stand on pedals, move in smooth elliptical motion, use arm handles.' },
    { name: 'Sprints', category: 'cardio', muscleGroups: ['legs', 'core'], difficulty: 'advanced', equipment: 'none', caloriesPerMinute: 14, instructions: 'Run at maximum effort for short distances, rest between sets.' },

    // === FLEXIBILITY ===
    { name: 'Hamstring Stretch', category: 'flexibility', muscleGroups: ['hamstrings'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 2, instructions: 'Sit with one leg extended, reach toward toes, hold 30 seconds.' },
    { name: 'Quad Stretch', category: 'flexibility', muscleGroups: ['quadriceps'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 2, instructions: 'Stand on one leg, pull heel to glutes, hold 30 seconds each side.' },
    { name: 'Child\'s Pose', category: 'flexibility', muscleGroups: ['back', 'shoulders'], difficulty: 'beginner', equipment: 'yoga mat', caloriesPerMinute: 2, instructions: 'Kneel on floor, sit back on heels, extend arms forward on ground.' },
    { name: 'Downward Dog', category: 'flexibility', muscleGroups: ['hamstrings', 'calves', 'shoulders'], difficulty: 'beginner', equipment: 'yoga mat', caloriesPerMinute: 3, instructions: 'Form inverted V shape with body, push hips up and back, press heels down.' },
    { name: 'Pigeon Pose', category: 'flexibility', muscleGroups: ['hips', 'glutes'], difficulty: 'intermediate', equipment: 'yoga mat', caloriesPerMinute: 2, instructions: 'From downward dog, bring knee forward, extend back leg, fold forward.' },
    { name: 'Cat-Cow Stretch', category: 'flexibility', muscleGroups: ['back', 'core'], difficulty: 'beginner', equipment: 'yoga mat', caloriesPerMinute: 2, instructions: 'On hands and knees, alternate between arching and rounding spine.' },
    { name: 'Shoulder Stretch', category: 'flexibility', muscleGroups: ['shoulders'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 2, instructions: 'Pull one arm across chest with opposite hand, hold 30 seconds.' },
    { name: 'Hip Flexor Stretch', category: 'flexibility', muscleGroups: ['hip flexors'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 2, instructions: 'Kneel on one knee, push hips forward, hold 30 seconds each side.' },
    { name: 'Cobra Stretch', category: 'flexibility', muscleGroups: ['core', 'back'], difficulty: 'beginner', equipment: 'yoga mat', caloriesPerMinute: 2, instructions: 'Lie face down, place hands under shoulders, press up extending spine.' },
    { name: 'Seated Forward Fold', category: 'flexibility', muscleGroups: ['hamstrings', 'back'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 2, instructions: 'Sit with legs extended, reach for toes, fold forward from hips.' },

    // === BALANCE ===
    { name: 'Single Leg Stand', category: 'balance', muscleGroups: ['legs', 'core'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 3, instructions: 'Stand on one leg for 30-60 seconds, switch sides. Close eyes for challenge.' },
    { name: 'Tree Pose', category: 'balance', muscleGroups: ['legs', 'core'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 3, instructions: 'Stand on one leg, place other foot on inner thigh, hands at heart or overhead.' },
    { name: 'Warrior III', category: 'balance', muscleGroups: ['legs', 'core', 'back'], difficulty: 'intermediate', equipment: 'bodyweight', caloriesPerMinute: 4, instructions: 'Stand on one leg, extend other leg and torso parallel to floor, arms forward.' },
    { name: 'Bosu Ball Squats', category: 'balance', muscleGroups: ['legs', 'core'], difficulty: 'intermediate', equipment: 'bosu ball', caloriesPerMinute: 6, instructions: 'Stand on bosu ball flat side up, perform squats while maintaining balance.' },
    { name: 'Balance Board', category: 'balance', muscleGroups: ['legs', 'core'], difficulty: 'intermediate', equipment: 'balance board', caloriesPerMinute: 4, instructions: 'Stand on balance board, maintain level position, add movements as stability improves.' },
    { name: 'Heel-to-Toe Walk', category: 'balance', muscleGroups: ['legs', 'core'], difficulty: 'beginner', equipment: 'bodyweight', caloriesPerMinute: 3, instructions: 'Walk in straight line placing heel directly in front of opposite toe.' },
];

async function seed() {
    try {
        await connectMongoDB();
        const count = await Exercise.countDocuments();
        if (count > 0) {
            console.log(`✅ Exercise library already seeded (${count} exercises). Skipping.`);
            process.exit(0);
        }
        await Exercise.insertMany(exercises);
        console.log(`✅ Seeded ${exercises.length} exercises successfully!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
