# Frontend Muscle ID Update Summary

## Changes Made

Updated the frontend to use correct muscle group IDs that match the backend `muscle_groups.json`.

### Before (Incorrect):
Frontend was using display names as IDs:
- "Back", "Chest", "Traps", "Triceps", "Biceps", "Legs", "Core", "Calves", "Shoulders"

### After (Correct):
Frontend now uses proper muscle group IDs:
- `chest` → "Chest"
- `back` → "Back" 
- `shoulders` → "Shoulders"
- `biceps` → "Biceps & Forearms"
- `triceps` → "Triceps"
- `legs` → "Legs"
- `core` → "Core & Abs"

### Removed Items:
- **"Traps"** - Now part of "back" muscle group (backend has back_traps_upper, back_traps_middle, back_traps_lower as sub-muscles)
- **"Calves"** - Now part of "legs" muscle group (backend has legs_calves as a sub-muscle)

## Files Modified

### 1. `MuscleSelectionGrid.jsx`
- ✅ Updated muscle list to use `id` and `name` properties
- ✅ Changed from 9 muscles to 7 muscle groups matching backend
- ✅ Updated `getMuscleRating()` to match by `muscle_id` field
- ✅ Updated selection display to show muscle names correctly
- ✅ Updated ratings display to use `rating.muscle_id` for selection check

### 2. `SuggestWorkoutSection.jsx`
- ✅ Updated `getMuscleRatings()` to use correct muscle IDs: `['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core']`
- ✅ Updated fallback data to include `muscle_id` field
- ✅ Updated `suggestNewWorkout()` to pass muscle IDs (not names) to backend
- ✅ Changed muscle parameter from `join(', ')` to `join(',')` for cleaner API calls

## Backend Muscle Groups Reference

From `yea-buddy-be/muscle_groups.json`:

```json
{
  "muscleGroups": [
    { "id": "chest", "name": "Chest", ... },
    { "id": "back", "name": "Back", ... },
    { "id": "shoulders", "name": "Shoulders", ... },
    { "id": "biceps", "name": "Biceps & Forearms", ... },
    { "id": "triceps", "name": "Triceps", ... },
    { "id": "legs", "name": "Legs", ... },
    { "id": "core", "name": "Core & Abs", ... }
  ]
}
```

## API Calls Updated

### `/muscle-ratings` API Call:
**Before:**
```javascript
?muscles=Back, Chest, Traps, Triceps, Biceps, Legs, Core, Calves, Shoulders
```

**After:**
```javascript
?muscles=chest,back,shoulders,biceps,triceps,legs,core
```

### `/suggest-workout` API Call:
**Before:**
```javascript
?specific_muscles=Back, Chest
```

**After:**
```javascript
?specific_muscles=back,chest
```

## Expected Backend Response Format

```json
[
  {
    "muscle": "Chest",
    "muscle_id": "chest",
    "score": 81,
    "explanation": "Indirectly worked: 1d ago: 270 pts (27%)",
    "sub_muscles": [...]
  },
  ...
]
```

## Testing Checklist

- [ ] Muscle selection grid displays 7 muscle groups correctly
- [ ] Clicking muscles toggles selection state
- [ ] Recovery Analysis button fetches muscle ratings with correct IDs
- [ ] Muscle ratings display correctly with scores and explanations
- [ ] Selected muscles highlight properly in the ratings section
- [ ] Generate Protocol button sends correct muscle IDs to backend
- [ ] Workout suggestion respects selected muscle groups
- [ ] No console errors related to muscle ID mismatches

## Notes

- The frontend now properly maps between user-friendly display names ("Chest") and backend IDs ("chest")
- Traps and Calves training can still be accessed through Back and Legs selections respectively
- All muscle ratings now use the `muscle_id` field for proper matching between frontend and backend
