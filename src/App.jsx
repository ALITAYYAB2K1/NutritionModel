import React, { useEffect, useState } from "react";
import projectData from "./obesity_project_data.json";

function App() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    state: "Texas",
    category: "Age (years)",
    group: "18 - 24",
    fruitScore: 50,
    exerciseScore: 50,
  });

  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // --- LOGIC: Get Dropdown Options ---
  const states = Object.keys(projectData.demographics).sort();
  const categories = ["Age (years)", "Income", "Gender", "Education"];

  const getGroups = (currentCategory) => {
    try {
      // We use "Alabama" just to grab the structure of groups, as it's the same for all states
      return Object.keys(projectData.demographics["Alabama"][currentCategory]);
    } catch {
      return [];
    }
  };

  // --- HANDLER: Fixes the Gender Bug ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      // 🚨 FIX: When Category changes, immediately reset "Group" to the first valid option.
      // Otherwise, you might be stuck with "18-24" while looking at "Gender" -> Crash/Empty.
      const newGroups = getGroups(value);
      setFormData({
        ...formData,
        category: value,
        group: newGroups[0] || "", // Auto-select the first item (e.g., "Male")
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateRisk = () => {
    const { demographics, model_weights } = projectData;

    // 1. Get Base Rate
    let baseRate = 30;
    try {
      baseRate =
        demographics[formData.state][formData.category][formData.group];
    } catch {
      // Fallback
    }

    // 2. Apply Lifestyle Impact
    const fruitImpact =
      (formData.fruitScore - 50) * (model_weights.low_fruit / 50);
    const exerciseImpact =
      (formData.exerciseScore - 50) * (model_weights.no_exercise / 50);

    // Simple weighted calculation
    // If scores are > 50 (Unhealthy), risk goes UP.
    // If scores are < 50 (Healthy), risk goes DOWN.
    let totalRisk = baseRate + fruitImpact + exerciseImpact;

    setResult(totalRisk.toFixed(1));
  };

  // Helper for Result Color
  const getRiskColor = (score) => {
    if (score > 35) return "risk-high";
    if (score > 28) return "risk-med";
    return "risk-low";
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="w-full max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>🥑</span> <span>LifeStyle &amp; Risk AI</span>
          </h1>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT COLUMN: INPUTS */}
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/80 shadow-xl p-6 md:p-7 border border-slate-100 dark:border-slate-700 backdrop-blur">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              1. Demographic Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Group
                </label>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {getGroups(formData.category).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIFESTYLE & RESULT */}
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/80 shadow-xl p-6 md:p-7 border border-slate-100 dark:border-slate-700 backdrop-blur flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              2. Lifestyle Habits
            </h3>

            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Daily Fruit Intake
                </label>
                <div className="flex justify-between text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <span>🍎 High Intake</span>
                  <span>Zero Intake 🚫</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  name="fruitScore"
                  value={formData.fruitScore}
                  onChange={handleChange}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Physical Activity
                </label>
                <div className="flex justify-between text-xs md:text-sm font-semibold text-sky-600 dark:text-sky-400 mb-1.5">
                  <span>🏃‍♂️ Very Active</span>
                  <span>Sedentary 🛋️</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  name="exerciseScore"
                  value={formData.exerciseScore}
                  onChange={handleChange}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              className="mt-6 inline-flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base md:text-lg py-3 shadow-md shadow-emerald-500/30 transition w-full"
              onClick={calculateRisk}
            >
              Analyze Risk
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 shadow-xl p-6 md:p-7 border border-slate-100 dark:border-slate-700 backdrop-blur">
            <span className="text-xs tracking-wide uppercase text-slate-500 dark:text-slate-400 font-semibold">
              Estimated Obesity Risk Probability
            </span>
            <div
              className={`mt-2 text-4xl md:text-5xl font-extrabold leading-tight ${getRiskColor(
                Number(result)
              )}`}
            >
              {result}%
            </div>
            <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300">
              Based on historical data for{" "}
              <strong>
                {formData.group} ({formData.category})
              </strong>{" "}
              in <strong>{formData.state}</strong> <br />
              adjusted by your personal lifestyle choices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
