import { Program, Workout, createProgram, createWorkout, getPrograms, getWorkouts } from '@/api/client';
import ExercisePickerModal from '@/components/ExercisePickerModal';
import { colors } from '@/constants/theme';
import { formatDuration, formatStopwatch, timeAgo } from '@/utils/time';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SetInput {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

interface ExerciseBlock {
  id: string;
  exercise_name: string;
  sets: SetInput[];
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
}

function makeEmptySet(): SetInput {
  return { id: nextId(), weight: '', reps: '', completed: false };
}

function makeEmptyExercise(name: string = ''): ExerciseBlock {
  return { id: nextId(), exercise_name: name, sets: [makeEmptySet()] };
}

export default function WorkoutTab() {
  const [notes, setNotes] = useState('');
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([makeEmptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programName, setProgramName] = useState('');
  const [programExerciseNames, setProgramExerciseNames] = useState<string[]>([]);
  const [programPickerOpen, setProgramPickerOpen] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadWorkouts() {
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to load workouts', err);
    }
  }

  async function loadPrograms() {
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to load programs', err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
      loadPrograms();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startTracking(prefillExerciseNames?: string[]) {
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setIsTracking(true);
    if (prefillExerciseNames && prefillExerciseNames.length > 0) {
      setExerciseBlocks(prefillExerciseNames.map((name) => makeEmptyExercise(name)));
    }

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  }

  function stopTracking() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }

  function updateExerciseName(exerciseId: string, name: string) {
    setExerciseBlocks((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, exercise_name: name } : ex))
    );
  }

  function addExerciseBlock() {
    setExerciseBlocks((prev) => [...prev, makeEmptyExercise()]);
  }

  function removeExerciseBlock(exerciseId: string) {
    setExerciseBlocks((prev) => prev.filter((ex) => ex.id !== exerciseId));
  }

  function addSet(exerciseId: string) {
    setExerciseBlocks((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, makeEmptySet()] } : ex
      )
    );
  }

  function removeSet(exerciseId: string, setId: string) {
    setExerciseBlocks((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex
      )
    );
  }

  function updateSet(exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) {
    setExerciseBlocks((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
            }
          : ex
      )
    );
  }

  function toggleSetCompleted(exerciseId: string, setId: string) {
    setExerciseBlocks((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, completed: !s.completed } : s
              ),
            }
          : ex
      )
    );
  }

  function resetForm() {
    setNotes('');
    setExerciseBlocks([makeEmptyExercise()]);
    setElapsedSeconds(0);
    startTimeRef.current = null;
  }

  function handleCancel() {
    stopTracking();
    resetForm();
  }

  async function handleSave() {
    const validExercises = exerciseBlocks
      .filter((ex) => ex.exercise_name.trim() !== '')
      .map((ex) => ({
        exercise_name: ex.exercise_name,
        sets: ex.sets
          .filter((s) => s.weight.trim() !== '' || s.reps.trim() !== '' || s.completed)
          .map((s) => ({
            weight: s.weight ? parseFloat(s.weight) : null,
            reps: s.reps ? parseInt(s.reps, 10) : null,
            completed: s.completed,
          })),
      }));

    const finalDuration = elapsedSeconds;
    stopTracking();
    setSaving(true);
    try {
      await createWorkout({
        notes,
        duration_seconds: finalDuration,
        exercises: validExercises,
      });
      resetForm();
      await loadWorkouts();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Something went wrong saving the workout.';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  }

  function openProgramForm() {
    setProgramName('');
    setProgramExerciseNames([]);
    setShowProgramForm(true);
  }

  function closeProgramForm() {
    setShowProgramForm(false);
    setProgramName('');
    setProgramExerciseNames([]);
  }

  function removeProgramExercise(index: number) {
    setProgramExerciseNames((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveProgram() {
    if (!programName.trim()) {
      Alert.alert('Missing name', 'Give your program a name.');
      return;
    }
    if (programExerciseNames.length === 0) {
      Alert.alert('Missing exercises', 'Add at least one exercise to the program.');
      return;
    }
    setSavingProgram(true);
    try {
      await createProgram({ name: programName.trim(), exercises: programExerciseNames });
      closeProgramForm();
      await loadPrograms();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Something went wrong saving the program.';
      Alert.alert('Save failed', message);
    } finally {
      setSavingProgram(false);
    }
  }

  function startFromProgram(program: Program) {
    startTracking(program.exercises.map((e) => e.exercise_name));
  }

  const showForm = isTracking || elapsedSeconds > 0;

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Workouts</Text>

            {!showForm && !showProgramForm && (
              <>
                <View style={styles.startRow}>
                  <TouchableOpacity style={styles.startButton} onPress={() => startTracking()}>
                    <Text style={styles.startButtonText}>Start Empty Workout</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.startEmptyButton} onPress={openProgramForm}>
                    <Text style={styles.startEmptyButtonText}>New Program</Text>
                  </TouchableOpacity>
                </View>

                {programs.length > 0 && (
                  <View style={styles.programsSection}>
                    <Text style={styles.programsTitle}>Your Programs</Text>
                    {programs.map((program) => (
                      <View key={program.id} style={styles.programCard}>
                        <View style={styles.programCardHeader}>
                          <Text style={styles.programName}>{program.name}</Text>
                          <TouchableOpacity
                            style={styles.programStartButton}
                            onPress={() => startFromProgram(program)}
                          >
                            <Text style={styles.programStartButtonText}>Start</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.programExerciseList}>
                          {program.exercises.map((e) => e.exercise_name).join(', ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {showProgramForm && (
              <View style={styles.form}>
                <View style={styles.programFormHeader}>
                  <Text style={styles.programFormTitle}>New Program</Text>
                  <TouchableOpacity onPress={closeProgramForm}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Program name (e.g. 'Push Day')"
                  placeholderTextColor={colors.subtext}
                  value={programName}
                  onChangeText={setProgramName}
                />

                {programExerciseNames.map((name, index) => (
                  <View key={`${name}-${index}`} style={styles.programExerciseRow}>
                    <Text style={styles.programExerciseRowText}>
                      {index + 1}. {name}
                    </Text>
                    <TouchableOpacity onPress={() => removeProgramExercise(index)}>
                      <Ionicons name="close" size={18} color={colors.subtext} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setProgramPickerOpen(true)}
                >
                  <Text style={styles.addButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProgram}
                  disabled={savingProgram}
                >
                  <Text style={styles.saveButtonText}>
                    {savingProgram ? 'Saving...' : 'Save Program'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {showForm && (
              <View style={styles.form}>
                <View style={styles.timerRow}>
                  <Text style={styles.timerLabel}>
                    {isTracking ? 'Workout in progress' : 'Workout paused'}
                  </Text>
                  <Text style={styles.timerValue}>{formatStopwatch(elapsedSeconds)}</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Notes (optional, e.g. 'evening run')"
                  placeholderTextColor={colors.subtext}
                  value={notes}
                  onChangeText={setNotes}
                />

                {exerciseBlocks.map((ex) => (
                  <View key={ex.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <TouchableOpacity
                        style={styles.exerciseNameButton}
                        onPress={() => setPickerOpenFor(ex.id)}
                      >
                        <Text
                          style={
                            ex.exercise_name
                              ? styles.exerciseNameText
                              : styles.exerciseNamePlaceholder
                          }
                          numberOfLines={1}
                        >
                          {ex.exercise_name || 'Select Exercise'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={colors.subtext} />
                      </TouchableOpacity>
                      {exerciseBlocks.length > 1 && (
                        <TouchableOpacity onPress={() => removeExerciseBlock(ex.id)}>
                          <Ionicons name="trash-outline" size={20} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {ex.sets.length > 0 && (
                      <View style={styles.setHeaderRow}>
                        <Text style={[styles.setHeaderText, styles.setColSmall]}>Set</Text>
                        <Text style={[styles.setHeaderText, styles.setColFlex]}>Weight</Text>
                        <Text style={[styles.setHeaderText, styles.setColFlex]}>Reps</Text>
                        <Text style={[styles.setHeaderText, styles.setColSmall]}>Done</Text>
                      </View>
                    )}

                    {ex.sets.map((set, index) => (
                      <View key={set.id} style={styles.setRow}>
                        <Text style={[styles.setNumber, styles.setColSmall]}>{index + 1}</Text>
                        <TextInput
                          style={[styles.setInput, styles.setColFlex]}
                          placeholder="—"
                          placeholderTextColor={colors.subtext}
                          value={set.weight}
                          onChangeText={(v) => updateSet(ex.id, set.id, 'weight', v)}
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={[styles.setInput, styles.setColFlex]}
                          placeholder="—"
                          placeholderTextColor={colors.subtext}
                          value={set.reps}
                          onChangeText={(v) => updateSet(ex.id, set.id, 'reps', v)}
                          keyboardType="numeric"
                        />
                        <View style={styles.setColSmall}>
                          <TouchableOpacity
                            onPress={() => toggleSetCompleted(ex.id, set.id)}
                            style={styles.checkButton}
                          >
                            <Ionicons
                              name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                              size={26}
                              color={set.completed ? colors.primary : colors.subtext}
                            />
                          </TouchableOpacity>
                        </View>
                        {ex.sets.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeSet(ex.id, set.id)}
                            style={styles.removeSetButton}
                          >
                            <Ionicons name="close" size={16} color={colors.subtext} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(ex.id)}>
                      <Text style={styles.addSetButtonText}>+ Add Set</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={addExerciseBlock}>
                  <Text style={styles.addButtonText}>+ Add Another Exercise</Text>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, styles.saveButtonFlex]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={styles.saveButtonText}>
                      {saving ? 'Saving...' : isTracking ? 'Finish & Save' : 'Save Workout'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isTracking && (
                  <TouchableOpacity style={styles.pauseButton} onPress={stopTracking}>
                    <Text style={styles.pauseButtonText}>Pause Timer</Text>
                  </TouchableOpacity>
                )}
                {!isTracking && elapsedSeconds > 0 && (
                  <TouchableOpacity style={styles.pauseButton} onPress={() => startTracking()}>
                    <Text style={styles.pauseButtonText}>Resume Timer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.sectionTitle}>History</Text>
          </>
        }
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No workouts logged yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTime}>{timeAgo(item.created_at)}</Text>
              {item.duration_seconds ? (
                <Text style={styles.workoutDuration}>
                  {formatDuration(item.duration_seconds)}
                </Text>
              ) : null}
            </View>
            {item.notes ? <Text style={styles.workoutNotes}>{item.notes}</Text> : null}
            {item.exercises.length === 0 ? (
              <Text style={styles.emptyWorkoutLabel}>Empty workout (no exercises logged)</Text>
            ) : (
              item.exercises.map((ex) => (
                <View key={ex.id} style={styles.historyExercise}>
                  <Text style={styles.historyExerciseName}>{ex.exercise_name}</Text>
                  {ex.sets.map((s, i) => (
                    <Text key={s.id} style={styles.historySetLine}>
                      Set {i + 1}: {s.weight ? `${s.weight} lb × ` : ''}
                      {s.reps ?? '—'} reps {s.completed ? '✓' : ''}
                    </Text>
                  ))}
                </View>
              ))
            )}
          </View>
        )}
      />

      <ExercisePickerModal
        visible={pickerOpenFor !== null}
        onClose={() => setPickerOpenFor(null)}
        onSelect={(name) => {
          if (pickerOpenFor) updateExerciseName(pickerOpenFor, name);
        }}
      />

      <ExercisePickerModal
        visible={programPickerOpen}
        onClose={() => setProgramPickerOpen(false)}
        onSelect={(name) => {
          setProgramExerciseNames((prev) => [...prev, name]);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  startRow: { gap: 10, marginBottom: 20 },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: '700' },
  startEmptyButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  startEmptyButtonText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  programsSection: { marginBottom: 20 },
  programsTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  programCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  programCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  programName: { color: colors.text, fontWeight: '600', fontSize: 15 },
  programStartButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  programStartButtonText: { color: colors.primaryText, fontWeight: '600', fontSize: 13 },
  programExerciseList: { color: colors.subtext, fontSize: 13 },
  programFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  programFormTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  programExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  programExerciseRowText: { color: colors.text, fontSize: 14, flex: 1 },
  form: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  timerRow: { alignItems: 'center', marginBottom: 12, paddingVertical: 8 },
  timerLabel: { color: colors.subtext, fontSize: 13, marginBottom: 4 },
  timerValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
  },
  exerciseCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseNameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  exerciseNameText: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  exerciseNamePlaceholder: { color: colors.subtext, fontSize: 15, flex: 1 },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 2 },
  setHeaderText: { color: colors.subtext, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  setColSmall: { width: 36, alignItems: 'center' },
  setColFlex: { flex: 1, marginHorizontal: 4 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  setNumber: { color: colors.subtext, fontSize: 13, textAlign: 'center' },
  setInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    textAlign: 'center',
  },
  checkButton: { padding: 2 },
  removeSetButton: { padding: 4, marginLeft: 2 },
  addSetButton: { alignItems: 'center', paddingVertical: 8 },
  addSetButtonText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  addButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: { color: colors.primary, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8 },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cancelButtonText: { color: colors.danger, fontWeight: '600' },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: 'center' },
  saveButtonFlex: { flex: 1 },
  saveButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  pauseButton: { alignItems: 'center', marginTop: 10 },
  pauseButtonText: { color: colors.subtext, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: colors.text },
  emptyText: { color: colors.subtext, textAlign: 'center', marginTop: 20 },
  workoutCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutTime: { fontWeight: '600', color: colors.text },
  workoutDuration: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  workoutNotes: { color: colors.subtext, fontStyle: 'italic', marginBottom: 4 },
  emptyWorkoutLabel: { color: colors.subtext, fontStyle: 'italic', fontSize: 13 },
  historyExercise: { marginTop: 6 },
  historyExerciseName: { color: colors.text, fontWeight: '600', marginBottom: 2 },
  historySetLine: { color: colors.subtext, fontSize: 13, marginLeft: 8 },
});