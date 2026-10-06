import { Program, Workout, createWorkout, getPrograms, getWorkouts } from '@/api';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import ProgramForm from '@/components/workout/ProgramForm';
import StartWorkoutPanel from '@/components/workout/StartWorkoutPanel';
import WorkoutCard from '@/components/workout/WorkoutCard';
import { sharedStyles } from '@/constants/styles';
import { useStopwatch } from '@/hooks/useStopwatch';
import { draftToExercises, useWorkoutDraft } from '@/hooks/useWorkoutDraft';
import { getErrorMessage } from '@/utils/errors';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';

type Mode = 'idle' | 'creatingProgram' | 'active';

export default function WorkoutTab() {
  const [mode, setMode] = useState<Mode>('idle');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [saving, setSaving] = useState(false);

  const draft = useWorkoutDraft();
  const stopwatch = useStopwatch();

  const loadWorkouts = useCallback(async () => {
    try {
      setWorkouts(await getWorkouts());
    } catch (err) {
      console.error('Failed to load workouts', err);
    }
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      setPrograms(await getPrograms());
    } catch (err) {
      console.error('Failed to load programs', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
      loadPrograms();
    }, [loadWorkouts, loadPrograms])
  );

  function startWorkout(exerciseNames?: string[]) {
    draft.reset(exerciseNames);
    stopwatch.reset();
    stopwatch.start();
    setMode('active');
  }

  function endWorkout() {
    stopwatch.reset();
    draft.reset();
    setMode('idle');
  }

  async function saveWorkout() {
    const durationSeconds = stopwatch.pause();
    setSaving(true);
    try {
      await createWorkout({
        notes: draft.notes,
        duration_seconds: durationSeconds,
        exercises: draftToExercises(draft.exercises),
      });
      endWorkout();
      await loadWorkouts();
    } catch (err) {
      Alert.alert('Save failed', getErrorMessage(err, 'Something went wrong saving the workout.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleProgramSaved() {
    setMode('idle');
    await loadPrograms();
  }

  const header = (
    <>
      <Text style={sharedStyles.title}>Workouts</Text>

      {mode === 'idle' && (
        <StartWorkoutPanel
          programs={programs}
          onStartEmpty={() => startWorkout()}
          onStartProgram={(p) => startWorkout(p.exercises.map((e) => e.exercise_name))}
          onNewProgram={() => setMode('creatingProgram')}
        />
      )}

      {mode === 'creatingProgram' && (
        <ProgramForm onClose={() => setMode('idle')} onSaved={handleProgramSaved} />
      )}

      {mode === 'active' && (
        <ActiveWorkout
          draft={draft}
          elapsedSeconds={stopwatch.elapsedSeconds}
          isTimerRunning={stopwatch.isRunning}
          saving={saving}
          onPauseTimer={stopwatch.pause}
          onResumeTimer={stopwatch.start}
          onDiscard={endWorkout}
          onSave={saveWorkout}
        />
      )}

      <Text style={sharedStyles.sectionTitle}>History</Text>
    </>
  );

  return (
    <FlatList
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.screenContent}
      ListHeaderComponent={header}
      data={workouts}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={sharedStyles.emptyText}>No workouts logged yet.</Text>}
      renderItem={({ item }) => <WorkoutCard workout={item} />}
    />
  );
}
