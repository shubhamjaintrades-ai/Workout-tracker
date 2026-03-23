import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// REPLACE THESE 2 VALUES WITH YOUR REAL SUPABASE DETAILS
const SUPABASE_URL = "https://wanjnhmmxcbysljwkdqc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmpuaG1teGNieXNsandrZHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODA1ODMsImV4cCI6MjA4Njk1NjU4M30.qdFCOWdHZgbTdSvd27g6gkcp25bovLW9loT04LXQfs4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DRAFT_KEY = "workout_tracker_active_draft_v1";

let authSection;
let appSection;
let emailInput;
let passwordInput;
let authMessage;
let userEmail;

let signUpBtn;
let signInBtn;
let signOutBtn;

let dashboardView;
let createRoutineView;
let routinesView;
let startWorkoutView;
let activeWorkoutView;
let historyView;

let showDashboardBtn;
let showCreateRoutineBtn;
let showRoutinesBtn;
let showStartWorkoutBtn;
let showHistoryBtn;
let refreshRoutinesBtn;
let refreshHistoryBtn;

let todayLabel;
let todayRoutineSuggestion;
let routineCountEl;
let exerciseCountEl;
let historyCountEl;
let prCountEl;

let routineNameInput;
let dayButtons;
let addExerciseRowBtn;
let routineExercisesContainer;
let saveRoutineBtn;
let routineMessage;
let routinesList;

let workoutRoutineSelect;
let loadWorkoutBtn;
let workoutStartMessage;

let activeWorkoutTitle;
let activeWorkoutSubtitle;
let activeWorkoutContainer;
let workoutNotes;
let finishWorkoutBtn;
let workoutSaveMessage;
let discardDraftBtn;

let historyList;

let selectedDays = [];
let exerciseRowCounter = 0;
let currentUser = null;
let allRoutinesCache = [];
let activeDraft = null;

document.addEventListener("DOMContentLoaded", () => {
  authSection = document.getElementById("auth-section");
  appSection = document.getElementById("app-section");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  authMessage = document.getElementById("auth-message");
  userEmail = document.getElementById("user-email");

  signUpBtn = document.getElementById("signup-btn");
  signInBtn = document.getElementById("signin-btn");
  signOutBtn = document.getElementById("signout-btn");

  dashboardView = document.getElementById("dashboard-view");
  createRoutineView = document.getElementById("create-routine-view");
  routinesView = document.getElementById("routines-view");
  startWorkoutView = document.getElementById("start-workout-view");
  activeWorkoutView = document.getElementById("active-workout-view");
  historyView = document.getElementById("history-view");

  showDashboardBtn = document.getElementById("show-dashboard-btn");
  showCreateRoutineBtn = document.getElementById("show-create-routine-btn");
  showRoutinesBtn = document.getElementById("show-routines-btn");
  showStartWorkoutBtn = document.getElementById("show-start-workout-btn");
  showHistoryBtn = document.getElementById("show-history-btn");
  refreshRoutinesBtn = document.getElementById("refresh-routines-btn");
  refreshHistoryBtn = document.getElementById("refresh-history-btn");

  todayLabel = document.getElementById("today-label");
  todayRoutineSuggestion = document.getElementById("today-routine-suggestion");
  routineCountEl = document.getElementById("routine-count");
  exerciseCountEl = document.getElementById("exercise-count");
  historyCountEl = document.getElementById("history-count");
  prCountEl = document.getElementById("pr-count");

  routineNameInput = document.getElementById("routine-name");
  dayButtons = Array.from(document.querySelectorAll(".day-btn"));
  addExerciseRowBtn = document.getElementById("add-exercise-row-btn");
  routineExercisesContainer = document.getElementById("routine-exercises-container");
  saveRoutineBtn = document.getElementById("save-routine-btn");
  routineMessage = document.getElementById("routine-message");
  routinesList = document.getElementById("routines-list");

  workoutRoutineSelect = document.getElementById("workout-routine-select");
  loadWorkoutBtn = document.getElementById("load-workout-btn");
  workoutStartMessage = document.getElementById("workout-start-message");

  activeWorkoutTitle = document.getElementById("active-workout-title");
  activeWorkoutSubtitle = document.getElementById("active-workout-subtitle");
  activeWorkoutContainer = document.getElementById("active-workout-container");
  workoutNotes = document.getElementById("workout-notes");
  finishWorkoutBtn = document.getElementById("finish-workout-btn");
  workoutSaveMessage = document.getElementById("workout-save-message");
  discardDraftBtn = document.getElementById("discard-draft-btn");

  historyList = document.getElementById("history-list");

  signUpBtn.addEventListener("click", signUp);
  signInBtn.addEventListener("click", signIn);
  signOutBtn.addEventListener("click", signOut);

  showDashboardBtn.addEventListener("click", () => showView("dashboard"));
  showCreateRoutineBtn.addEventListener("click", () => showView("create-routine"));
  showRoutinesBtn.addEventListener("click", () => showView("routines"));
  showStartWorkoutBtn.addEventListener("click", () => showView("start-workout"));
  showHistoryBtn.addEventListener("click", () => showView("history"));

  refreshRoutinesBtn.addEventListener("click", refreshAppData);
  refreshHistoryBtn.addEventListener("click", () => loadHistory(currentUser?.id));

  addExerciseRowBtn.addEventListener("click", addExerciseRow);
  saveRoutineBtn.addEventListener("click", saveRoutine);

  loadWorkoutBtn.addEventListener("click", handleLoadWorkout);
  finishWorkoutBtn.addEventListener("click", finishWorkout);
  discardDraftBtn.addEventListener("click", discardDraft);

  workoutNotes.addEventListener("input", () => {
    if (!activeDraft) return;
    activeDraft.notes = workoutNotes.value;
    saveDraftToLocal();
  });

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => toggleDay(btn.dataset.day, btn));
  });

  todayLabel.textContent = `Today is ${getTodayName()}`;
  loadApp();
});

async function signUp() {
  authMessage.textContent = "";
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authMessage.textContent = "Enter email and password.";
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    authMessage.textContent = error.message;
  } else {
    authMessage.textContent =
      "Account created. Check email if confirmation is required, then sign in.";
  }
}

async function signIn() {
  authMessage.textContent = "";
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authMessage.textContent = "Enter email and password.";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    authMessage.textContent = error.message;
  } else {
    await loadApp();
  }
}

async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
  activeDraft = null;
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
}

async function loadApp() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    return;
  }

  currentUser = user;

  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  userEmail.textContent = `Logged in as: ${user.email}`;

  await createProfileIfNeeded(user.id);
  resetRoutineForm();
  await refreshAppData();
  await tryRestoreDraft();
  showView(activeDraft ? "active-workout" : "dashboard");
}

async function refreshAppData() {
  if (!currentUser) return;

  await Promise.all([
    loadRoutineSummary(currentUser.id),
    loadTodaySuggestion(currentUser.id),
    loadRoutines(currentUser.id),
    loadRoutineOptions(currentUser.id),
    loadHistory(currentUser.id),
    loadDashboardPRCount(currentUser.id),
  ]);
}

function showView(viewName) {
  dashboardView.classList.add("hidden");
  createRoutineView.classList.add("hidden");
  routinesView.classList.add("hidden");
  startWorkoutView.classList.add("hidden");
  activeWorkoutView.classList.add("hidden");
  historyView.classList.add("hidden");

  [
    showDashboardBtn,
    showCreateRoutineBtn,
    showRoutinesBtn,
    showStartWorkoutBtn,
    showHistoryBtn,
  ].forEach((btn) => btn.classList.remove("primary"));

  if (viewName === "dashboard") {
    dashboardView.classList.remove("hidden");
    showDashboardBtn.classList.add("primary");
  }

  if (viewName === "create-routine") {
    createRoutineView.classList.remove("hidden");
    showCreateRoutineBtn.classList.add("primary");
  }

  if (viewName === "routines") {
    routinesView.classList.remove("hidden");
    showRoutinesBtn.classList.add("primary");
  }

  if (viewName === "start-workout") {
    startWorkoutView.classList.remove("hidden");
    showStartWorkoutBtn.classList.add("primary");
  }

  if (viewName === "active-workout") {
    activeWorkoutView.classList.remove("hidden");
    showStartWorkoutBtn.classList.add("primary");
  }

  if (viewName === "history") {
    historyView.classList.remove("hidden");
    showHistoryBtn.classList.add("primary");
  }
}

async function createProfileIfNeeded(userId) {
  await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });
}

function toggleDay(dayName, button) {
  const exists = selectedDays.includes(dayName);

  if (exists) {
    selectedDays = selectedDays.filter((day) => day !== dayName);
    button.classList.remove("active");
  } else {
    selectedDays.push(dayName);
    button.classList.add("active");
  }
}

function resetRoutineForm() {
  routineNameInput.value = "";
  routineMessage.textContent = "";
  selectedDays = [];
  exerciseRowCounter = 0;
  routineExercisesContainer.innerHTML = "";
  dayButtons.forEach((btn) => btn.classList.remove("active"));
  addExerciseRow();
}

function addExerciseRow() {
  exerciseRowCounter += 1;
  const wrapper = document.createElement("div");
  wrapper.className = "exercise-row";

  wrapper.innerHTML = `
    <div class="exercise-row-title">Exercise ${exerciseRowCounter}</div>

    <input type="text" class="exercise-name-input" placeholder="Exercise name" />

    <div class="exercise-grid">
      <select class="exercise-category-select">
        <option value="strength">Strength</option>
        <option value="cardio">Cardio</option>
        <option value="carry">Carry</option>
      </select>

      <select class="exercise-type-select">
        <option value="normal">Normal</option>
        <option value="superset">Superset</option>
        <option value="dropset">Dropset</option>
      </select>
    </div>

    <div class="exercise-type-row">
      <input type="number" class="exercise-group-number-input" placeholder="Superset Group No. (optional)" />
      <input type="number" class="exercise-sort-order-input" placeholder="Sort Order" value="${exerciseRowCounter}" />
    </div>

    <div class="exercise-subfields"></div>

    <div class="exercise-actions">
      <button type="button" class="danger remove-exercise-btn">Remove</button>
    </div>
  `;

  routineExercisesContainer.appendChild(wrapper);

  const categorySelect = wrapper.querySelector(".exercise-category-select");
  const subfieldsContainer = wrapper.querySelector(".exercise-subfields");

  renderExerciseSubfields(categorySelect.value, subfieldsContainer);

  categorySelect.addEventListener("change", () => {
    renderExerciseSubfields(categorySelect.value, subfieldsContainer);
  });

  wrapper.querySelector(".remove-exercise-btn").addEventListener("click", () => {
    wrapper.remove();
  });
}

function renderExerciseSubfields(category, container) {
  if (category === "strength") {
    container.innerHTML = `
      <div class="exercise-grid">
        <input type="number" class="target-sets-input" placeholder="Target Sets" />
        <input type="number" class="target-reps-input" placeholder="Target Reps" />
      </div>
    `;
    return;
  }

  if (category === "cardio") {
    container.innerHTML = `
      <div class="exercise-grid">
        <input type="number" class="target-sets-input" placeholder="Target Sets" />
        <input type="number" class="target-distance-input" placeholder="Target Distance" />
        <input type="number" class="target-time-minutes-input" placeholder="Target Time (minutes)" />
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="exercise-grid">
      <input type="number" class="target-sets-input" placeholder="Target Sets" />
      <input type="number" class="target-distance-input" placeholder="Target Distance" />
      <input type="number" class="target-weight-input" placeholder="Target Weight" />
    </div>
  `;
}

async function saveRoutine() {
  routineMessage.textContent = "";

  if (!currentUser) {
    routineMessage.textContent = "You are not logged in.";
    return;
  }

  const routineName = routineNameInput.value.trim();
  if (!routineName) {
    routineMessage.textContent = "Enter routine name.";
    return;
  }

  if (selectedDays.length === 0) {
    routineMessage.textContent = "Select at least one day.";
    return;
  }

  const exerciseRows = Array.from(
    routineExercisesContainer.querySelectorAll(".exercise-row")
  );

  if (exerciseRows.length === 0) {
    routineMessage.textContent = "Add at least one exercise.";
    return;
  }

  const exercisesPayload = [];

  for (const row of exerciseRows) {
    const exerciseName = row.querySelector(".exercise-name-input").value.trim();
    const category = row.querySelector(".exercise-category-select").value;
    const exerciseType = row.querySelector(".exercise-type-select").value;
    const groupNumberValue = row.querySelector(".exercise-group-number-input").value.trim();
    const sortOrderValue = row.querySelector(".exercise-sort-order-input").value.trim();
    const targetSets = row.querySelector(".target-sets-input")?.value.trim();

    if (!exerciseName) {
      routineMessage.textContent = "Every exercise must have a name.";
      return;
    }

    if (!targetSets) {
      routineMessage.textContent = "Every exercise must have target sets.";
      return;
    }

    const payload = {
      exercise_name: exerciseName,
      category,
      exercise_type: exerciseType,
      group_number: groupNumberValue ? Number(groupNumberValue) : null,
      sort_order: sortOrderValue ? Number(sortOrderValue) : 1,
      target_sets: Number(targetSets),
      target_reps: null,
      target_distance: null,
      target_time_seconds: null,
      target_weight: null,
    };

    if (category === "strength") {
      const reps = row.querySelector(".target-reps-input")?.value.trim();
      if (!reps) {
        routineMessage.textContent = "Strength exercises need target reps.";
        return;
      }
      payload.target_reps = Number(reps);
    }

    if (category === "cardio") {
      const distance = row.querySelector(".target-distance-input")?.value.trim();
      const minutes = row.querySelector(".target-time-minutes-input")?.value.trim();

      if (!distance || !minutes) {
        routineMessage.textContent = "Cardio exercises need distance and time.";
        return;
      }

      payload.target_distance = Number(distance);
      payload.target_time_seconds = Number(minutes) * 60;
    }

    if (category === "carry") {
      const distance = row.querySelector(".target-distance-input")?.value.trim();
      const weight = row.querySelector(".target-weight-input")?.value.trim();

      if (!distance || !weight) {
        routineMessage.textContent = "Carry exercises need distance and weight.";
        return;
      }

      payload.target_distance = Number(distance);
      payload.target_weight = Number(weight);
    }

    exercisesPayload.push(payload);
  }

  const { data: routineData, error: routineError } = await supabase
    .from("routines")
    .insert({
      user_id: currentUser.id,
      name: routineName,
    })
    .select("id")
    .single();

  if (routineError) {
    routineMessage.textContent = routineError.message;
    return;
  }

  const routineId = routineData.id;

  const { error: daysError } = await supabase
    .from("routine_days")
    .insert(selectedDays.map((day) => ({ routine_id: routineId, day_name: day })));

  if (daysError) {
    routineMessage.textContent = daysError.message;
    return;
  }

  const { error: exercisesError } = await supabase
    .from("routine_exercises")
    .insert(exercisesPayload.map((x) => ({ routine_id: routineId, ...x })));

  if (exercisesError) {
    routineMessage.textContent = exercisesError.message;
    return;
  }

  routineMessage.textContent = "Routine saved successfully.";
  resetRoutineForm();
  await refreshAppData();
  showView("routines");
}

async function loadRoutineSummary(userId) {
  const { data: routines } = await supabase
    .from("routines")
    .select("id")
    .eq("user_id", userId);

  const routineCount = routines?.length || 0;
  routineCountEl.textContent = String(routineCount);

  if (!routineCount) {
    exerciseCountEl.textContent = "0";
    return;
  }

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("id")
    .in("routine_id", routines.map((r) => r.id));

  exerciseCountEl.textContent = String(routineExercises?.length || 0);
}

async function loadDashboardPRCount(userId) {
  const { data } = await supabase
    .from("personal_records")
    .select("id")
    .eq("user_id", userId);

  prCountEl.textContent = String(data?.length || 0);
}

async function loadTodaySuggestion(userId) {
  const today = getTodayName();

  const { data: routines } = await supabase
    .from("routines")
    .select(`
      id,
      name,
      routine_days (
        day_name
      )
    `)
    .eq("user_id", userId);

  const matched = (routines || []).filter((routine) =>
    (routine.routine_days || []).some((day) => day.day_name === today)
  );

  if (matched.length === 0) {
    todayRoutineSuggestion.textContent =
      "No routine assigned for today yet. You can still choose another routine in Start Workout.";
    return;
  }

  todayRoutineSuggestion.innerHTML = matched
    .map((routine) => `<div><strong>${escapeHtml(routine.name)}</strong></div>`)
    .join("");
}

async function loadRoutineOptions(userId) {
  const { data, error } = await supabase
    .from("routines")
    .select(`
      id,
      name,
      routine_days (
        day_name
      ),
      routine_exercises (
        id,
        exercise_name,
        category,
        target_sets,
        target_reps,
        target_distance,
        target_time_seconds,
        target_weight,
        exercise_type,
        group_number,
        sort_order
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    workoutStartMessage.textContent = error.message;
    return;
  }

  allRoutinesCache = data || [];
  workoutRoutineSelect.innerHTML = `<option value="">Select a routine</option>`;

  const today = getTodayName();

  allRoutinesCache.forEach((routine) => {
    const option = document.createElement("option");
    option.value = String(routine.id);
    option.textContent = routine.name;
    workoutRoutineSelect.appendChild(option);
  });

  const suggested = allRoutinesCache.find((routine) =>
    (routine.routine_days || []).some((d) => d.day_name === today)
  );

  if (suggested) {
    workoutRoutineSelect.value = String(suggested.id);
  }
}

async function loadRoutines(userId) {
  routinesList.innerHTML = `<p class="empty-state">Loading...</p>`;

  const { data: routines, error } = await supabase
    .from("routines")
    .select(`
      id,
      name,
      routine_days (
        id,
        day_name
      ),
      routine_exercises (
        id,
        exercise_name,
        category,
        target_sets,
        target_reps,
        target_distance,
        target_time_seconds,
        target_weight,
        exercise_type,
        group_number,
        sort_order
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    routinesList.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!routines?.length) {
    routinesList.innerHTML = `<p class="empty-state">No routines yet.</p>`;
    return;
  }

  routinesList.innerHTML = routines
    .map((routine) => {
      const days = (routine.routine_days || [])
        .map((d) => `<span class="day-chip">${escapeHtml(d.day_name)}</span>`)
        .join("");

      const exercises = [...(routine.routine_exercises || [])]
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(
          (exercise) => `
          <div class="exercise-item">
            <div class="exercise-name">${escapeHtml(exercise.exercise_name)}</div>
            <div class="exercise-meta">
              ${escapeHtml(buildTargetText(exercise))}<br />
              ${escapeHtml(buildExerciseTypeText(exercise))}
            </div>
          </div>
        `
        )
        .join("");

      return `
        <div class="routine-card">
          <div class="top-row">
            <h3>${escapeHtml(routine.name)}</h3>
            <button class="danger delete-routine-btn" data-routine-id="${routine.id}">
              Delete
            </button>
          </div>
          <div class="day-chip-wrap">${days}</div>
          <div>${exercises}</div>
        </div>
      `;
    })
    .join("");

  Array.from(routinesList.querySelectorAll(".delete-routine-btn")).forEach((btn) => {
    btn.addEventListener("click", async () => {
      await deleteRoutine(Number(btn.dataset.routineId));
    });
  });
}

async function deleteRoutine(routineId) {
  if (!confirm("Delete this routine?")) return;

  const { error } = await supabase.from("routines").delete().eq("id", routineId);

  if (error) {
    alert(error.message);
    return;
  }

  await refreshAppData();
}

async function handleLoadWorkout() {
  workoutStartMessage.textContent = "";

  if (!currentUser) {
    workoutStartMessage.textContent = "You are not logged in.";
    return;
  }

  const routineId = Number(workoutRoutineSelect.value);
  if (!routineId) {
    workoutStartMessage.textContent = "Select a routine.";
    return;
  }

  const routine = allRoutinesCache.find((r) => r.id === routineId);
  if (!routine) {
    workoutStartMessage.textContent = "Routine not found.";
    return;
  }

  const exercises = [...(routine.routine_exercises || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  activeDraft = {
    userId: currentUser.id,
    routineId: routine.id,
    routineName: routine.name,
    date: new Date().toISOString(),
    dayName: getTodayName(),
    notes: "",
    exercises: exercises.map((exercise) => ({
      routineExerciseId: exercise.id,
      exerciseName: exercise.exercise_name,
      category: exercise.category,
      targetSets: exercise.target_sets || 0,
      targetReps: exercise.target_reps || null,
      targetDistance: exercise.target_distance || null,
      targetTimeSeconds: exercise.target_time_seconds || null,
      targetWeight: exercise.target_weight || null,
      exerciseType: exercise.exercise_type || "normal",
      groupNumber: exercise.group_number || null,
      sortOrder: exercise.sort_order || 0,
      sets: buildInitialSetsForExercise(exercise),
    })),
  };

  saveDraftToLocal();
  renderActiveWorkout();
  showView("active-workout");
}

function buildInitialSetsForExercise(exercise) {
  const count = Number(exercise.target_sets || 0);
  const items = [];

  for (let i = 1; i <= count; i += 1) {
    items.push({
      setNumber: i,
      reps: "",
      weight: "",
      distance: "",
      timeSeconds: "",
    });
  }

  return items;
}

function renderActiveWorkout() {
  if (!activeDraft) return;

  activeWorkoutTitle.textContent = activeDraft.routineName;
  activeWorkoutSubtitle.textContent = `${activeDraft.dayName} workout`;
  workoutNotes.value = activeDraft.notes || "";

  activeWorkoutContainer.innerHTML = activeDraft.exercises
    .map((exercise, exerciseIndex) => {
      const setRows = exercise.sets
        .map((set, setIndex) => renderSetRow(exercise, exerciseIndex, set, setIndex))
        .join("");

      return `
        <div class="card workout-exercise-card">
          <div class="top-row">
            <div>
              <h3>${escapeHtml(exercise.exerciseName)}</h3>
              <div class="inline-chip-row">
                <span class="type-chip">${escapeHtml(exercise.category)}</span>
                ${
                  exercise.exerciseType === "superset"
                    ? `<span class="superset-chip">Superset${
                        exercise.groupNumber ? ` Group ${exercise.groupNumber}` : ""
                      }</span>`
                    : ""
                }
                ${
                  exercise.exerciseType === "dropset"
                    ? `<span class="superset-chip">Dropset</span>`
                    : ""
                }
              </div>
              <div class="workout-target">${escapeHtml(buildDraftTargetText(exercise))}</div>
            </div>
            <button
              type="button"
              class="add-set-btn"
              data-exercise-index="${exerciseIndex}"
            >
              + Add Set
            </button>
          </div>

          ${setRows}
        </div>
      `;
    })
    .join("");

  bindWorkoutInputs();
}

function renderSetRow(exercise, exerciseIndex, set, setIndex) {
  const commonStart = `
    <div class="set-row">
      <div class="top-row">
        <div class="set-row-title">Set ${set.setNumber}</div>
        <button
          type="button"
          class="danger remove-set-btn"
          data-exercise-index="${exerciseIndex}"
          data-set-index="${setIndex}"
        >
          Remove
        </button>
      </div>
  `;

  if (exercise.category === "strength") {
    return `
      ${commonStart}
      <div class="exercise-grid">
        <input
          type="number"
          placeholder="Weight"
          value="${escapeAttribute(set.weight)}"
          class="set-input"
          data-exercise-index="${exerciseIndex}"
          data-set-index="${setIndex}"
          data-field="weight"
        />
        <input
          type="number"
          placeholder="Reps"
          value="${escapeAttribute(set.reps)}"
          class="set-input"
          data-exercise-index="${exerciseIndex}"
          data-set-index="${setIndex}"
          data-field="reps"
        />
      </div>
    </div>`;
  }

  if (exercise.category === "cardio") {
    return `
      ${commonStart}
      <div class="exercise-grid">
        <input
          type="number"
          placeholder="Distance"
          value="${escapeAttribute(set.distance)}"
          class="set-input"
          data-exercise-index="${exerciseIndex}"
          data-set-index="${setIndex}"
          data-field="distance"
        />
        <input
          type="number"
          placeholder="Time (seconds)"
          value="${escapeAttribute(set.timeSeconds)}"
          class="set-input"
          data-exercise-index="${exerciseIndex}"
          data-set-index="${setIndex}"
          data-field="timeSeconds"
        />
      </div>
    </div>`;
  }

  return `
    ${commonStart}
    <div class="exercise-grid">
      <input
        type="number"
        placeholder="Weight"
        value="${escapeAttribute(set.weight)}"
        class="set-input"
        data-exercise-index="${exerciseIndex}"
        data-set-index="${setIndex}"
        data-field="weight"
      />
      <input
        type="number"
        placeholder="Distance"
        value="${escapeAttribute(set.distance)}"
        class="set-input"
        data-exercise-index="${exerciseIndex}"
        data-set-index="${setIndex}"
        data-field="distance"
      />
    </div>
  </div>`;
}

function bindWorkoutInputs() {
  Array.from(document.querySelectorAll(".set-input")).forEach((input) => {
    input.addEventListener("input", (event) => {
      const exerciseIndex = Number(event.target.dataset.exerciseIndex);
      const setIndex = Number(event.target.dataset.setIndex);
      const field = event.target.dataset.field;
      activeDraft.exercises[exerciseIndex].sets[setIndex][field] = event.target.value;
      saveDraftToLocal();
    });
  });

  Array.from(document.querySelectorAll(".add-set-btn")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const exerciseIndex = Number(btn.dataset.exerciseIndex);
      addSetToExercise(exerciseIndex);
    });
  });

  Array.from(document.querySelectorAll(".remove-set-btn")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const exerciseIndex = Number(btn.dataset.exerciseIndex);
      const setIndex = Number(btn.dataset.setIndex);
      removeSetFromExercise(exerciseIndex, setIndex);
    });
  });
}

function addSetToExercise(exerciseIndex) {
  const exercise = activeDraft.exercises[exerciseIndex];
  exercise.sets.push({
    setNumber: exercise.sets.length + 1,
    reps: "",
    weight: "",
    distance: "",
    timeSeconds: "",
  });
  saveDraftToLocal();
  renderActiveWorkout();
}

function removeSetFromExercise(exerciseIndex, setIndex) {
  const exercise = activeDraft.exercises[exerciseIndex];
  if (exercise.sets.length <= 1) return;

  exercise.sets.splice(setIndex, 1);
  exercise.sets.forEach((set, index) => {
    set.setNumber = index + 1;
  });

  saveDraftToLocal();
  renderActiveWorkout();
}

async function finishWorkout() {
  workoutSaveMessage.textContent = "";

  if (!currentUser || !activeDraft) {
    workoutSaveMessage.textContent = "No active workout.";
    return;
  }

  const validExercisePayloads = [];

  for (const exercise of activeDraft.exercises) {
    const validSets = exercise.sets.filter((set) => isSetFilled(exercise.category, set));

    if (!validSets.length) continue;

    validExercisePayloads.push({
      ...exercise,
      sets: validSets,
    });
  }

  if (!validExercisePayloads.length) {
    workoutSaveMessage.textContent = "Enter at least one completed set.";
    return;
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: currentUser.id,
      routine_id: activeDraft.routineId,
      workout_date: new Date().toISOString().slice(0, 10),
      workout_day: activeDraft.dayName,
      notes: workoutNotes.value.trim() || null,
    })
    .select("id")
    .single();

  if (sessionError) {
    workoutSaveMessage.textContent = sessionError.message;
    return;
  }

  const sessionId = sessionData.id;
  let totalPRsThisWorkout = 0;

  for (const exercise of validExercisePayloads) {
    const { data: sessionExerciseData, error: sessionExerciseError } = await supabase
      .from("workout_session_exercises")
      .insert({
        session_id: sessionId,
        routine_exercise_id: exercise.routineExerciseId,
        exercise_name: exercise.exerciseName,
        category: exercise.category,
        target_sets: exercise.targetSets,
        target_reps: exercise.targetReps,
        target_distance: exercise.targetDistance,
        target_time_seconds: exercise.targetTimeSeconds,
        target_weight: exercise.targetWeight,
        exercise_type: exercise.exerciseType,
        group_number: exercise.groupNumber,
        sort_order: exercise.sortOrder,
      })
      .select("id")
      .single();

    if (sessionExerciseError) {
      workoutSaveMessage.textContent = sessionExerciseError.message;
      return;
    }

    const sessionExerciseId = sessionExerciseData.id;

    for (const set of exercise.sets) {
      const prInfo = await evaluatePR(currentUser.id, exercise.exerciseName, exercise.category, set);

      if (prInfo.isPR) totalPRsThisWorkout += 1;

      const { error: setError } = await supabase.from("workout_sets").insert({
        session_exercise_id: sessionExerciseId,
        set_number: set.setNumber,
        reps: set.reps ? Number(set.reps) : null,
        weight: set.weight ? Number(set.weight) : null,
        distance: set.distance ? Number(set.distance) : null,
        time_seconds: set.timeSeconds ? Number(set.timeSeconds) : null,
        is_pr: prInfo.isPR,
      });

      if (setError) {
        workoutSaveMessage.textContent = setError.message;
        return;
      }

      if (prInfo.shouldUpsert) {
        await upsertPersonalRecord(currentUser.id, exercise.exerciseName, prInfo.bestWeight);
      }
    }
  }

  clearLocalDraft();
  activeDraft = null;
  activeWorkoutContainer.innerHTML = "";
  workoutNotes.value = "";
  workoutSaveMessage.textContent = `Workout saved successfully.${totalPRsThisWorkout ? ` ${totalPRsThisWorkout} PR(s)!` : ""}`;

  await refreshAppData();
  showView("history");
}

function isSetFilled(category, set) {
  if (category === "strength") return set.weight !== "" || set.reps !== "";
  if (category === "cardio") return set.distance !== "" || set.timeSeconds !== "";
  return set.weight !== "" || set.distance !== "";
}

async function evaluatePR(userId, exerciseName, category, set) {
  if (category === "cardio") {
    return { isPR: false, shouldUpsert: false, bestWeight: 0 };
  }

  const candidate = set.weight ? Number(set.weight) : 0;
  if (!candidate) {
    return { isPR: false, shouldUpsert: false, bestWeight: 0 };
  }

  const { data } = await supabase
    .from("personal_records")
    .select("id, best_weight")
    .eq("user_id", userId)
    .eq("exercise_name", exerciseName)
    .maybeSingle();

  const previous = data?.best_weight ? Number(data.best_weight) : 0;

  if (candidate > previous) {
    return { isPR: true, shouldUpsert: true, bestWeight: candidate };
  }

  return { isPR: false, shouldUpsert: false, bestWeight: previous };
}

async function upsertPersonalRecord(userId, exerciseName, bestWeight) {
  await supabase.from("personal_records").upsert(
    {
      user_id: userId,
      exercise_name: exerciseName,
      best_weight: bestWeight,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,exercise_name" }
  );
}

async function loadHistory(userId) {
  if (!userId) return;

  historyList.innerHTML = `<p class="empty-state">Loading...</p>`;

  const { data: sessions, error } = await supabase
    .from("workout_sessions")
    .select(`
      id,
      workout_date,
      workout_day,
      notes,
      routines (
        name
      ),
      workout_session_exercises (
        id,
        exercise_name,
        category,
        workout_sets (
          id,
          set_number,
          reps,
          weight,
          distance,
          time_seconds,
          is_pr
        )
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    historyList.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
    return;
  }

  historyCountEl.textContent = String(sessions?.length || 0);

  if (!sessions?.length) {
    historyList.innerHTML = `<p class="empty-state">No workouts yet.</p>`;
    return;
  }

  historyList.innerHTML = sessions
    .map((session) => {
      const routineName = session.routines?.name || "Manual Workout";

      const exerciseHtml = (session.workout_session_exercises || [])
        .map((exercise) => {
          const sets = [...(exercise.workout_sets || [])]
            .sort((a, b) => a.set_number - b.set_number)
            .map((set) => {
              const line = buildHistorySetText(exercise.category, set);
              return `
                <div class="exercise-meta">
                  Set ${set.set_number}: ${escapeHtml(line)}
                  ${set.is_pr ? `<span class="pr-chip">PR</span>` : ""}
                </div>
              `;
            })
            .join("");

          return `
            <div class="exercise-item">
              <div class="exercise-name">${escapeHtml(exercise.exercise_name)}</div>
              ${sets}
            </div>
          `;
        })
        .join("");

      return `
        <div class="history-card">
          <h3>${escapeHtml(routineName)}</h3>
          <div class="exercise-meta">${escapeHtml(session.workout_date)} • ${escapeHtml(session.workout_day || "")}</div>
          ${session.notes ? `<div class="exercise-meta">Notes: ${escapeHtml(session.notes)}</div>` : ""}
          <div style="margin-top:10px;">${exerciseHtml}</div>
        </div>
      `;
    })
    .join("");
}

function buildHistorySetText(category, set) {
  if (category === "strength") {
    return `${set.weight || 0} weight × ${set.reps || 0} reps`;
  }
  if (category === "cardio") {
    return `${set.distance || 0} distance • ${set.time_seconds || 0} sec`;
  }
  return `${set.weight || 0} weight • ${set.distance || 0} distance`;
}

async function tryRestoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.userId !== currentUser.id) return;

    activeDraft = parsed;
    renderActiveWorkout();
  } catch {
    clearLocalDraft();
  }
}

function saveDraftToLocal() {
  if (!activeDraft) return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(activeDraft));
}

function clearLocalDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function discardDraft() {
  if (!confirm("Discard the active workout draft?")) return;

  activeDraft = null;
  clearLocalDraft();
  activeWorkoutContainer.innerHTML = "";
  workoutNotes.value = "";
  workoutSaveMessage.textContent = "";
  showView("start-workout");
}

function buildTargetText(exercise) {
  if (exercise.category === "strength") {
    return `Strength • ${exercise.target_sets || 0} sets × ${exercise.target_reps || 0} reps`;
  }
  if (exercise.category === "cardio") {
    return `Cardio • ${exercise.target_sets || 0} sets • ${exercise.target_distance || 0} distance • ${Math.round((exercise.target_time_seconds || 0) / 60)} min`;
  }
  return `Carry • ${exercise.target_sets || 0} sets • ${exercise.target_distance || 0} distance • ${exercise.target_weight || 0} weight`;
}

function buildDraftTargetText(exercise) {
  if (exercise.category === "strength") {
    return `Target: ${exercise.targetSets} sets × ${exercise.targetReps || 0} reps`;
  }
  if (exercise.category === "cardio") {
    return `Target: ${exercise.targetSets} sets • ${exercise.targetDistance || 0} distance • ${Math.round((exercise.targetTimeSeconds || 0) / 60)} min`;
  }
  return `Target: ${exercise.targetSets} sets • ${exercise.targetDistance || 0} distance • ${exercise.targetWeight || 0} weight`;
}

function buildExerciseTypeText(exercise) {
  if (exercise.exercise_type === "superset") {
    return `Superset${exercise.group_number ? ` • Group ${exercise.group_number}` : ""}`;
  }
  if (exercise.exercise_type === "dropset") {
    return "Dropset";
  }
  return "Normal";
}

function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
}
