import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// REPLACE THESE 2 VALUES WITH YOUR REAL SUPABASE DETAILS
const SUPABASE_URL = "https://wanjnhmmxcbysljwkdqc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmpuaG1teGNieXNsandrZHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODA1ODMsImV4cCI6MjA4Njk1NjU4M30.qdFCOWdHZgbTdSvd27g6gkcp25bovLW9loT04LXQfs4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

let showDashboardBtn;
let showCreateRoutineBtn;
let showRoutinesBtn;
let refreshRoutinesBtn;

let todayLabel;
let todayRoutineSuggestion;
let routineCountEl;
let exerciseCountEl;

let routineNameInput;
let dayButtons;
let addExerciseRowBtn;
let routineExercisesContainer;
let saveRoutineBtn;
let routineMessage;
let routinesList;

let selectedDays = [];
let exerciseRowCounter = 0;
let currentUser = null;

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

  showDashboardBtn = document.getElementById("show-dashboard-btn");
  showCreateRoutineBtn = document.getElementById("show-create-routine-btn");
  showRoutinesBtn = document.getElementById("show-routines-btn");
  refreshRoutinesBtn = document.getElementById("refresh-routines-btn");

  todayLabel = document.getElementById("today-label");
  todayRoutineSuggestion = document.getElementById("today-routine-suggestion");
  routineCountEl = document.getElementById("routine-count");
  exerciseCountEl = document.getElementById("exercise-count");

  routineNameInput = document.getElementById("routine-name");
  dayButtons = Array.from(document.querySelectorAll(".day-btn"));
  addExerciseRowBtn = document.getElementById("add-exercise-row-btn");
  routineExercisesContainer = document.getElementById(
    "routine-exercises-container"
  );
  saveRoutineBtn = document.getElementById("save-routine-btn");
  routineMessage = document.getElementById("routine-message");
  routinesList = document.getElementById("routines-list");

  signUpBtn.addEventListener("click", signUp);
  signInBtn.addEventListener("click", signIn);
  signOutBtn.addEventListener("click", signOut);

  showDashboardBtn.addEventListener("click", () => showView("dashboard"));
  showCreateRoutineBtn.addEventListener("click", () =>
    showView("create-routine")
  );
  showRoutinesBtn.addEventListener("click", () => showView("routines"));
  refreshRoutinesBtn.addEventListener("click", () => refreshAppData());

  addExerciseRowBtn.addEventListener("click", () => addExerciseRow());
  saveRoutineBtn.addEventListener("click", saveRoutine);

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
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
  authMessage.textContent = "";
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
  showView("dashboard");
  await refreshAppData();
}

async function refreshAppData() {
  if (!currentUser) return;
  await Promise.all([
    loadRoutineSummary(currentUser.id),
    loadTodaySuggestion(currentUser.id),
    loadRoutines(currentUser.id),
  ]);
}

function showView(viewName) {
  dashboardView.classList.add("hidden");
  createRoutineView.classList.add("hidden");
  routinesView.classList.add("hidden");

  showDashboardBtn.classList.remove("primary");
  showCreateRoutineBtn.classList.remove("primary");
  showRoutinesBtn.classList.remove("primary");

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
}

async function createProfileIfNeeded(userId) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id" });

  if (error) {
    console.error("Profile upsert failed:", error.message);
  }
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
  const rowId = `exercise-row-${exerciseRowCounter}`;

  const wrapper = document.createElement("div");
  wrapper.className = "exercise-row";
  wrapper.id = rowId;

  wrapper.innerHTML = `
    <div class="exercise-row-title">Exercise ${exerciseRowCounter}</div>

    <input
      type="text"
      class="exercise-name-input"
      placeholder="Exercise name"
    />

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
      <input
        type="number"
        class="exercise-group-number-input"
        placeholder="Superset Group No. (optional)"
      />
      <input
        type="number"
        class="exercise-sort-order-input"
        placeholder="Sort Order"
        value="${exerciseRowCounter}"
      />
    </div>

    <div class="exercise-subfields"></div>

    <div class="exercise-actions">
      <button type="button" class="danger remove-exercise-btn">Remove</button>
    </div>
  `;

  routineExercisesContainer.appendChild(wrapper);

  const categorySelect = wrapper.querySelector(".exercise-category-select");
  const subfieldsContainer = wrapper.querySelector(".exercise-subfields");
  const removeBtn = wrapper.querySelector(".remove-exercise-btn");

  renderExerciseSubfields(categorySelect.value, subfieldsContainer);

  categorySelect.addEventListener("change", () => {
    renderExerciseSubfields(categorySelect.value, subfieldsContainer);
  });

  removeBtn.addEventListener("click", () => {
    wrapper.remove();
  });
}

function renderExerciseSubfields(category, container) {
  if (category === "strength") {
    container.innerHTML = `
      <div class="exercise-grid">
        <input
          type="number"
          class="target-sets-input"
          placeholder="Target Sets"
        />
        <input
          type="number"
          class="target-reps-input"
          placeholder="Target Reps"
        />
      </div>
    `;
    return;
  }

  if (category === "cardio") {
    container.innerHTML = `
      <div class="exercise-grid">
        <input
          type="number"
          class="target-distance-input"
          placeholder="Target Distance"
        />
        <input
          type="number"
          class="target-time-minutes-input"
          placeholder="Target Time (minutes)"
        />
      </div>
    `;
    return;
  }

  if (category === "carry") {
    container.innerHTML = `
      <div class="exercise-grid">
        <input
          type="number"
          class="target-distance-input"
          placeholder="Target Distance"
        />
        <input
          type="number"
          class="target-weight-input"
          placeholder="Target Weight"
        />
      </div>
    `;
  }
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
    const groupNumberValue = row
      .querySelector(".exercise-group-number-input")
      .value.trim();
    const sortOrderValue = row
      .querySelector(".exercise-sort-order-input")
      .value.trim();

    if (!exerciseName) {
      routineMessage.textContent = "Every exercise must have a name.";
      return;
    }

    const basePayload = {
      exercise_name: exerciseName,
      category,
      exercise_type: exerciseType,
      group_number: groupNumberValue ? Number(groupNumberValue) : null,
      sort_order: sortOrderValue ? Number(sortOrderValue) : 1,
      target_sets: null,
      target_reps: null,
      target_distance: null,
      target_time_seconds: null,
      target_weight: null,
    };

    if (category === "strength") {
      const sets = row.querySelector(".target-sets-input")?.value.trim();
      const reps = row.querySelector(".target-reps-input")?.value.trim();

      if (!sets || !reps) {
        routineMessage.textContent =
          "Strength exercises need target sets and target reps.";
        return;
      }

      basePayload.target_sets = Number(sets);
      basePayload.target_reps = Number(reps);
    }

    if (category === "cardio") {
      const distance = row
        .querySelector(".target-distance-input")
        ?.value.trim();
      const minutes = row
        .querySelector(".target-time-minutes-input")
        ?.value.trim();

      if (!distance || !minutes) {
        routineMessage.textContent =
          "Cardio exercises need target distance and target time.";
        return;
      }

      basePayload.target_distance = Number(distance);
      basePayload.target_time_seconds = Number(minutes) * 60;
    }

    if (category === "carry") {
      const distance = row
        .querySelector(".target-distance-input")
        ?.value.trim();
      const weight = row.querySelector(".target-weight-input")?.value.trim();

      if (!distance || !weight) {
        routineMessage.textContent =
          "Carry exercises need target distance and target weight.";
        return;
      }

      basePayload.target_distance = Number(distance);
      basePayload.target_weight = Number(weight);
    }

    exercisesPayload.push(basePayload);
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

  const daysPayload = selectedDays.map((day) => ({
    routine_id: routineId,
    day_name: day,
  }));

  const { error: daysError } = await supabase
    .from("routine_days")
    .insert(daysPayload);

  if (daysError) {
    routineMessage.textContent = daysError.message;
    return;
  }

  const finalExercisesPayload = exercisesPayload.map((exercise) => ({
    routine_id: routineId,
    ...exercise,
  }));

  const { error: exercisesError } = await supabase
    .from("routine_exercises")
    .insert(finalExercisesPayload);

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
  const { data: routines, error: routineError } = await supabase
    .from("routines")
    .select("id")
    .eq("user_id", userId);

  if (routineError) {
    console.error(routineError.message);
    routineCountEl.textContent = "0";
    exerciseCountEl.textContent = "0";
    return;
  }

  const routineCount = routines?.length || 0;
  routineCountEl.textContent = String(routineCount);

  if (routineCount === 0) {
    exerciseCountEl.textContent = "0";
    return;
  }

  const routineIds = routines.map((r) => r.id);

  const { data: routineExercises, error: exerciseError } = await supabase
    .from("routine_exercises")
    .select("id")
    .in("routine_id", routineIds);

  if (exerciseError) {
    console.error(exerciseError.message);
    exerciseCountEl.textContent = "0";
    return;
  }

  exerciseCountEl.textContent = String(routineExercises?.length || 0);
}

async function loadTodaySuggestion(userId) {
  const today = getTodayName();

  const { data: routines, error } = await supabase
    .from("routines")
    .select(
      `
      id,
      name,
      routine_days (
        day_name
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    todayRoutineSuggestion.textContent = error.message;
    return;
  }

  const matched = (routines || []).filter((routine) =>
    (routine.routine_days || []).some((day) => day.day_name === today)
  );

  if (matched.length === 0) {
    todayRoutineSuggestion.textContent =
      "No routine assigned for today yet. You can create one in Create Routine.";
    return;
  }

  todayRoutineSuggestion.innerHTML = matched
    .map((routine) => `<div><strong>${escapeHtml(routine.name)}</strong></div>`)
    .join("");
}

async function loadRoutines(userId) {
  routinesList.innerHTML = `<p class="empty-state">Loading...</p>`;

  const { data: routines, error } = await supabase
    .from("routines")
    .select(
      `
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
    `
    )
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    routinesList.innerHTML = `<p class="empty-state">${escapeHtml(
      error.message
    )}</p>`;
    return;
  }

  if (!routines || routines.length === 0) {
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
        .map((exercise) => {
          const targetText = buildTargetText(exercise);
          const typeText = buildExerciseTypeText(exercise);

          return `
            <div class="exercise-item">
              <div class="exercise-name">${escapeHtml(
                exercise.exercise_name
              )}</div>
              <div class="exercise-meta">
                ${escapeHtml(targetText)}<br/>
                ${escapeHtml(typeText)}
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="routine-card">
          <div class="top-row">
            <h3>${escapeHtml(routine.name)}</h3>
            <button class="danger delete-routine-btn" data-routine-id="${
              routine.id
            }">
              Delete
            </button>
          </div>

          <div class="day-chip-wrap">${
            days || '<span class="muted">No days</span>'
          }</div>

          <div>${exercises || '<p class="empty-state">No exercises</p>'}</div>
        </div>
      `;
    })
    .join("");

  const deleteButtons = Array.from(
    routinesList.querySelectorAll(".delete-routine-btn")
  );

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const routineId = btn.dataset.routineId;
      await deleteRoutine(routineId);
    });
  });
}

async function deleteRoutine(routineId) {
  if (!confirm("Delete this routine?")) return;

  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", Number(routineId));

  if (error) {
    alert(error.message);
    return;
  }

  await refreshAppData();
}

function buildTargetText(exercise) {
  if (exercise.category === "strength") {
    return `Strength • ${exercise.target_sets || 0} sets × ${
      exercise.target_reps || 0
    } reps`;
  }

  if (exercise.category === "cardio") {
    const minutes = exercise.target_time_seconds
      ? Math.round(exercise.target_time_seconds / 60)
      : 0;
    return `Cardio • ${
      exercise.target_distance || 0
    } distance • ${minutes} min`;
  }

  if (exercise.category === "carry") {
    return `Carry • ${exercise.target_distance || 0} distance • ${
      exercise.target_weight || 0
    } weight`;
  }

  return "No target";
}

function buildExerciseTypeText(exercise) {
  if (exercise.exercise_type === "superset") {
    return `Superset${
      exercise.group_number ? ` • Group ${exercise.group_number}` : ""
    }`;
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
