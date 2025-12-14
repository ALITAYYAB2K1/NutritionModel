import React, { useState, useEffect } from "react";
import modelData from "./obesity_model_v2.json";
import "./App.css";

function App() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    gender: "0", // Male=0, Female=1
    age: 25,
    weight: 70, // Kg
    familyHistory: "1", // Yes=1, No=0
    fcvc: 2, // Veggies (1-3)
    faf: 1, // Physical Activity (0-3)
    tue: 1, // Tech Usage (0-2)
    mtrans: "0", // Transport (Public=0, Car=1, Walk=2, etc.)
  });

  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(7);

  const [prediction, setPrediction] = useState(null);
  const [theme, setTheme] = useState("light");

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    if (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  // --- HANDLER ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- AI ENGINE (The Math Part) ---
  const predictObesity = () => {
    const { scaler, model, classes } = modelData;

    // Calculate height in meters from feet and inches
    const heightInMeters = heightFeet * 0.3048 + heightInches * 0.0254;

    // 1. Prepare Input Vector (Order matches Python training EXACTLY)
    const rawFeatures = [
      parseFloat(formData.gender),
      parseFloat(formData.age),
      parseFloat(heightInMeters),
      parseFloat(formData.weight),
      parseFloat(formData.familyHistory),
      1, // FAVC (Default: Yes)
      parseFloat(formData.fcvc),
      3, // NCP (Default: 3 meals)
      1, // CAEC (Default: Sometimes)
      0, // SMOKE (Default: No)
      2, // CH2O (Default: 2L)
      0, // SCC (Default: No)
      parseFloat(formData.faf),
      parseFloat(formData.tue),
      1, // CALC (Default: Sometimes)
      parseFloat(formData.mtrans),
    ];

    // 2. Scale the features
    const scaledFeatures = rawFeatures.map((val, i) => {
      return (val - scaler.mean[i]) / scaler.scale[i];
    });

    // 3. Matrix Multiplication
    const scores = model.coefficients.map((classCoefs, classIdx) => {
      const dotProduct = classCoefs.reduce(
        (sum, coef, i) => sum + coef * scaledFeatures[i],
        0
      );
      return dotProduct + model.intercepts[classIdx];
    });

    // 4. Find the Class with the Highest Score
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const resultClass = classes[maxScoreIndex];

    // 5. Set Result
    setPrediction(resultClass.replace(/_/g, " "));
  };

  // Helper for Colors
  const getResultColorClass = (result) => {
    if (!result) return "text-slate-500 dark:text-slate-400";
    if (result.includes("Normal") || result.includes("Insufficient"))
      return "text-emerald-500 dark:text-emerald-400";
    if (result.includes("Overweight"))
      return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  const getResultBorderColor = (result) => {
    if (!result) return "border-slate-200 dark:border-slate-700";
    if (result.includes("Normal") || result.includes("Insufficient"))
      return "border-emerald-500 dark:border-emerald-500 ring-4 ring-emerald-500/10";
    if (result.includes("Overweight"))
      return "border-amber-500 dark:border-amber-500 ring-4 ring-amber-500/10";
    return "border-rose-500 dark:border-rose-500 ring-4 ring-rose-500/10";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-10 px-4 font-sans text-slate-800 dark:text-slate-100 selection:bg-emerald-100 dark:selection:bg-emerald-900">
      {/* HEADER & TOGGLE */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🩺</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            Obesity Classifier AI
          </h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform active:scale-95 text-xl"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT CARD: PHYSICAL STATS */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <span className="text-2xl bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
              👤
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Physical Profile
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Age
                </label>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-0.5 rounded-full text-sm">
                  {formData.age} years
                </span>
              </div>
              <input
                type="range"
                name="age"
                min="10"
                max="80"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Height
                </label>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-0.5 rounded-full text-sm">
                  {heightFeet}' {heightInches}"
                </span>
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full p-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    value={heightFeet}
                    onChange={(e) =>
                      setHeightFeet(parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ft
                  </span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    className="w-full p-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    value={heightInches}
                    onChange={(e) =>
                      setHeightInches(parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    in
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Weight
                </label>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-0.5 rounded-full text-sm">
                  {formData.weight} kg
                </span>
              </div>
              <input
                type="number"
                name="weight"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Family History of Obesity?
              </label>
              <div className="relative">
                <select
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleChange}
                  className="w-full p-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: LIFESTYLE */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 transition-all duration-300 flex-1">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-2xl bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                🏃‍♂️
              </span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Lifestyle Habits
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Vegetable Intake
                </label>
                <input
                  type="range"
                  name="fcvc"
                  min="1"
                  max="3"
                  step="0.5"
                  value={formData.fcvc}
                  onChange={handleChange}
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">🥬 Rare</span>
                  <span className="flex items-center gap-1">Daily 🥗</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Physical Activity
                </label>
                <input
                  type="range"
                  name="faf"
                  min="0"
                  max="3"
                  step="0.5"
                  value={formData.faf}
                  onChange={handleChange}
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">🛋️ Sedentary</span>
                  <span className="flex items-center gap-1">Athlete 🏃</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Tech Usage (Hours/Day)
                </label>
                <input
                  type="range"
                  name="tue"
                  min="0"
                  max="2"
                  step="0.5"
                  value={formData.tue}
                  onChange={handleChange}
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">📵 Low</span>
                  <span className="flex items-center gap-1">High 📱</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Transportation
                </label>
                <div className="relative">
                  <select
                    name="mtrans"
                    value={formData.mtrans}
                    onChange={handleChange}
                    className="w-full p-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
                  >
                    <option value="0">Public Transport</option>
                    <option value="1">Automobile</option>
                    <option value="2">Walking</option>
                    <option value="3">Motorbike</option>
                    <option value="4">Bike</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              <button
                className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-1 transition-all active:scale-95 text-lg"
                onClick={predictObesity}
              >
                Analyze Health Level
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT SECTION */}
      {prediction && (
        <div className="max-w-xl mx-auto mt-10">
          <div
            className={`bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-500 border ${getResultBorderColor(
              prediction
            )} text-center transform animate-fade-in-up`}
          >
            <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2 block">
              Predicted Classification
            </span>
            <h2
              className={`text-4xl md:text-5xl font-extrabold ${getResultColorClass(
                prediction
              )} mb-4 drop-shadow-sm`}
            >
              {prediction}
            </h2>
            <div className="w-16 h-1 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Based on your provided biometrics and lifestyle analysis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
