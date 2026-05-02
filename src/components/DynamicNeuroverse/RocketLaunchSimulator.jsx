import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";

export default function RocketLaunchSimulator() {
  const [rocketLaunch, setRocketLaunch] = useState({});
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(300000); // 5 minutes default
  const [countdown, setCountdown] = useState(0);
  const [hasNewData, setHasNewData] = useState(false);

  // Dynamic date states
  const [startDate, setStartDate] = useState("2025-07-15");
  const [endDate, setEndDate] = useState("2025-07-20");
  const [displayDate, setDisplayDate] = useState("2025-07-19");

  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const lastDataRef = useRef(null);

  const fetchAsteroidData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${
            import.meta.env.VITE_NASA_APIKEY
          }`
        );

        if (!response.ok) {
          throw new Error("API ERROR");
        }

        const data = await response.json();

        // Check if data has changed
        const currentDataString = JSON.stringify(data);
        const hasChanged = lastDataRef.current !== currentDataString;

        if (hasChanged) {
          setRocketLaunch(data);
          lastDataRef.current = currentDataString;
          setHasNewData(true);

          // Extract asteroids from the selected display date
          if (data?.near_earth_objects?.[displayDate]) {
            setAsteroids(data.near_earth_objects[displayDate]);
          } else {
            setAsteroids([]);
            if (showLoading) {
              setError(`No asteroid data available for ${displayDate}`);
            }
          }

          setLastUpdated(new Date());

          // Clear new data indicator after 3 seconds
          setTimeout(() => setHasNewData(false), 3000);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch asteroid data");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [startDate, endDate, displayDate]
  );

  // Countdown timer
  useEffect(() => {
    if (autoUpdate && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1000);
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, autoUpdate]);

  // Auto-update functionality
  useEffect(() => {
    if (autoUpdate) {
      setCountdown(updateInterval);

      intervalRef.current = setInterval(() => {
        fetchAsteroidData(false); // Silent update
        setCountdown(updateInterval);
      }, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoUpdate, updateInterval, fetchAsteroidData]);

  // Initial fetch
  useEffect(() => {
    fetchAsteroidData();
  }, [fetchAsteroidData]);

  const handleFetchData = () => {
    fetchAsteroidData(true);
    if (autoUpdate) {
      setCountdown(updateInterval);
    }
  };

  const formatCountdown = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleIntervalChange = (newInterval) => {
    setUpdateInterval(newInterval);
    if (autoUpdate) {
      setCountdown(newInterval);
    }
  };

  // Chart data preparation
  const prepareChartData = () => {
    const diameterData = asteroids.map((asteroid, index) => ({
      name: asteroid.name.substring(0, 10) + "...",
      index: index + 1,
      minKm:
        asteroid?.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
      maxKm:
        asteroid?.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
      avgKm:
        ((asteroid?.estimated_diameter?.kilometers?.estimated_diameter_min ||
          0) +
          (asteroid?.estimated_diameter?.kilometers?.estimated_diameter_max ||
            0)) /
        2,
      velocity:
        parseFloat(
          asteroid.close_approach_data?.[0]?.relative_velocity
            ?.kilometers_per_hour
        ) || 0,
      missDistance:
        parseFloat(
          asteroid.close_approach_data?.[0]?.miss_distance?.kilometers
        ) || 0,
      magnitude: asteroid?.absolute_magnitude_h || 0,
      hazardous: asteroid?.is_potentially_hazardous_asteroid ? 1 : 0,
    }));

    const hazardousData = [
      {
        name: "Safe",
        value: asteroids.filter((a) => !a.is_potentially_hazardous_asteroid)
          .length,
        color: "#10b981",
      },
      {
        name: "Hazardous",
        value: asteroids.filter((a) => a.is_potentially_hazardous_asteroid)
          .length,
        color: "#ef4444",
      },
    ];

    return { diameterData, hazardousData };
  };

  const { diameterData, hazardousData } = prepareChartData();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {/* Compact Background Stars */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-5 left-5 w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-pulse"></div>
          <div
            className="absolute top-10 right-10 w-0.5 h-0.5 bg-blue-300 rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "0.5s" }}></div>
          <div
            className="absolute top-20 left-1/4 w-0.5 h-0.5 bg-purple-300 rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "1s" }}></div>
          <div
            className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-pulse"
            style={{ animationDelay: "1.5s" }}></div>
          <div
            className="absolute bottom-10 left-1/2 w-0.5 h-0.5 bg-blue-400 rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 p-3 max-w-7xl mx-auto">
          {/* Compact Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              🚀 NASA ASTEROID TRACKER
            </h1>
            <p className="text-sm text-gray-300">
              Exploring Near Earth Objects
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Compact New Data Alert */}
          {hasNewData && (
            <div className="mb-3 bg-gradient-to-r from-green-900/50 to-emerald-800/50 backdrop-blur-sm border border-green-500/30 p-2 rounded-lg text-center">
              <span className="text-green-300 text-sm">
                ✨ New data available!
              </span>
            </div>
          )}

          {/* Compact Status Bar */}
          <div className="mb-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm p-3 rounded-lg border border-slate-600/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-1 ${
                      autoUpdate ? "bg-green-500 animate-pulse" : "bg-gray-500"
                    }`}></div>
                  <span>Auto: {autoUpdate ? "ON" : "OFF"}</span>
                </div>
                {autoUpdate && (
                  <span className="text-blue-300">
                    Next: {formatCountdown(countdown)}
                  </span>
                )}
              </div>
              {lastUpdated && (
                <span className="text-gray-400">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Compact Control Panel */}
          <div className="mb-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm p-4 rounded-lg border border-slate-600/30">
            <h2 className="text-lg font-bold text-white mb-3">
              Mission Control
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-700/50 border border-slate-500 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1">
                  End Date:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-700/50 border border-slate-500 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-300 mb-1">
                  Display Date:
                </label>
                <input
                  type="date"
                  value={displayDate}
                  onChange={(e) => setDisplayDate(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-700/50 border border-slate-500 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-yellow-300 mb-1">
                  Update Interval:
                </label>
                <select
                  value={updateInterval}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  disabled={!autoUpdate}
                  className="w-full p-2 text-xs bg-slate-700/50 border border-slate-500 rounded text-white disabled:opacity-50">
                  <option value={60000}>1 min</option>
                  <option value={300000}>5 min</option>
                  <option value={600000}>10 min</option>
                  <option value={1800000}>30 min</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoUpdate"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="w-3 h-3 text-blue-600 bg-slate-700 border-slate-500 rounded"
                />
                <label htmlFor="autoUpdate" className="text-xs text-gray-300">
                  Auto-update
                </label>
              </div>

              <button
                onClick={handleFetchData}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-50">
                {loading ? "Scanning..." : "🛰️ Scan"}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/30 p-2 rounded text-center">
                <p className="text-blue-300">
                  Objects:{" "}
                  <span className="text-white font-bold">
                    {rocketLaunch?.element_count || 0}
                  </span>
                </p>
              </div>
              <div className="bg-slate-800/30 p-2 rounded text-center">
                <p className="text-green-400">Status: Connected</p>
              </div>
              <div className="bg-slate-800/30 p-2 rounded text-center">
                <p className={autoUpdate ? "text-green-400" : "text-gray-400"}>
                  Mode: {autoUpdate ? "Auto" : "Manual"}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {asteroids.length > 0 && (
            <div className="mb-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm p-4 rounded-lg border border-slate-600/30">
              <h2 className="text-lg font-bold text-yellow-400 mb-3">
                📊 Data Visualization
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Diameter Chart */}
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600/20">
                  <h3 className="text-sm font-bold text-blue-400 mb-2">
                    Estimated Diameter (km)
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={diameterData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="index"
                        tick={{ fontSize: 10 }}
                        stroke="#9ca3af"
                      />
                      <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "#f3f4f6" }}
                      />
                      <Bar dataKey="avgKm" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Hazardous vs Safe */}
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600/20">
                  <h3 className="text-sm font-bold text-red-400 mb-2">
                    Hazard Classification
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={hazardousData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelStyle={{ fontSize: "10px", fill: "#f3f4f6" }}>
                        {hazardousData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Velocity vs Distance */}
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600/20">
                  <h3 className="text-sm font-bold text-purple-400 mb-2">
                    Velocity vs Miss Distance
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <ScatterChart data={diameterData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="velocity"
                        name="Velocity"
                        unit=" km/h"
                        tick={{ fontSize: 10 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        dataKey="missDistance"
                        name="Distance"
                        unit=" km"
                        tick={{ fontSize: 10 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Scatter dataKey="velocity" fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Magnitude Distribution */}
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600/20">
                  <h3 className="text-sm font-bold text-green-400 mb-2">
                    Magnitude Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={diameterData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="index"
                        tick={{ fontSize: 10 }}
                        stroke="#9ca3af"
                      />
                      <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="magnitude"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-3 bg-gradient-to-r from-red-900/50 to-red-800/50 backdrop-blur-sm border border-red-500/30 p-2 rounded-lg">
              <p className="text-red-300 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Compact Asteroid List Header */}
          <div className="mb-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              🌌 Asteroids on {displayDate}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-2 animate-spin">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <p className="text-sm text-gray-300">Scanning space...</p>
            </div>
          ) : asteroids.length > 0 ? (
            <div className="space-y-3">
              {asteroids.map((asteroid) => (
                <div
                  key={asteroid.id}
                  className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm p-3 rounded-lg border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        asteroid?.is_potentially_hazardous_asteroid
                          ? "bg-red-500 animate-pulse"
                          : "bg-green-500"
                      }`}></div>
                    <h3 className="text-sm font-bold text-white">
                      {asteroid.name}
                    </h3>
                    {asteroid?.is_potentially_hazardous_asteroid && (
                      <span className="ml-2 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">
                        ⚠️ HAZARDOUS
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-800/50 p-2 rounded text-center">
                      <p className="text-blue-300 text-xs">NASA Link</p>
                      <a
                        href={asteroid?.nasa_jpl_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline">
                        View →
                      </a>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded text-center">
                      <p className="text-purple-300 text-xs">Magnitude</p>
                      <p className="text-white text-xs font-bold">
                        {asteroid?.absolute_magnitude_h}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded text-center">
                      <p className="text-yellow-300 text-xs">Velocity</p>
                      <p className="text-white text-xs font-bold">
                        {
                          asteroid.close_approach_data?.[0]?.relative_velocity
                            ?.kilometers_per_hour
                        }{" "}
                        km/h
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded text-center">
                      <p className="text-green-300 text-xs">Miss Distance</p>
                      <p className="text-white text-xs font-bold">
                        {
                          asteroid.close_approach_data?.[0]?.miss_distance
                            ?.kilometers
                        }{" "}
                        km
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-2 rounded">
                    <h4 className="text-xs font-bold text-orange-400 mb-2">
                      📐 Estimated Diameter
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-slate-800/60 p-2 rounded text-center">
                        <div className="text-blue-400 font-bold text-xs mb-1">
                          KM
                        </div>
                        <p className="text-white text-xs">
                          Min:{" "}
                          {asteroid?.estimated_diameter?.kilometers?.estimated_diameter_min?.toFixed(
                            4
                          )}
                        </p>
                        <p className="text-white text-xs">
                          Max:{" "}
                          {asteroid?.estimated_diameter?.kilometers?.estimated_diameter_max?.toFixed(
                            4
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded text-center">
                        <div className="text-purple-400 font-bold text-xs mb-1">
                          M
                        </div>
                        <p className="text-white text-xs">
                          Min:{" "}
                          {asteroid?.estimated_diameter?.meters?.estimated_diameter_min?.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-white text-xs">
                          Max:{" "}
                          {asteroid?.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(
                            2
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded text-center">
                        <div className="text-pink-400 font-bold text-xs mb-1">
                          MILES
                        </div>
                        <p className="text-white text-xs">
                          Min:{" "}
                          {asteroid?.estimated_diameter?.miles?.estimated_diameter_min?.toFixed(
                            4
                          )}
                        </p>
                        <p className="text-white text-xs">
                          Max:{" "}
                          {asteroid?.estimated_diameter?.miles?.estimated_diameter_max?.toFixed(
                            4
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded text-center">
                        <div className="text-yellow-400 font-bold text-xs mb-1">
                          FEET
                        </div>
                        <p className="text-white text-xs">
                          Min:{" "}
                          {asteroid?.estimated_diameter?.feet?.estimated_diameter_min?.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-white text-xs">
                          Max:{" "}
                          {asteroid?.estimated_diameter?.feet?.estimated_diameter_max?.toFixed(
                            2
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg">
              <div className="text-3xl mb-2">🌌</div>
              <p className="text-sm text-gray-300 mb-1">
                No asteroids detected
              </p>
              <p className="text-xs text-gray-400">
                Try a different date range
              </p>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}
