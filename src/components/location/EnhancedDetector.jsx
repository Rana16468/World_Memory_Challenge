import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Cloud,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  Sun,
  Moon,
} from "lucide-react";
import Loading from "../coomon/Loading";
import ErrorPage from "../coomon/ErrorPage";
import PatchAction from "../coomon/commonAction/PatchAction";
import { useLocation, Link } from "react-router-dom";

const EnhancedDetector = () => {
  const [browserInfo, setBrowserInfo] = useState({});
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
  { name: "Crypto Analysis", path: "/mind_mirror" },
  { name: "Portfolio", path: "" },
  { name: "Analytics", path: "" },
  { name: "Modeling", path: "" },
  { name: "Forecasting", path: "" },
  { name: "Risk", path: "" },
];
const location = useLocation(); // current path
  

  // Enhanced timezone coordinates with more locations - moved to useMemo to prevent recreation
  const timezoneCoordinates = useMemo(
    () => ({
      "Asia/Dhaka": [23.8103, 90.4125, "Dhaka, Bangladesh", "🇧🇩"],
      "Asia/Kolkata": [28.6139, 77.209, "New Delhi, India", "🇮🇳"],
      "Asia/Karachi": [24.8607, 67.0011, "Karachi, Pakistan", "🇵🇰"],
      "America/New_York": [40.7128, -74.006, "New York, USA", "🇺🇸"],
      "America/Los_Angeles": [34.0522, -118.2437, "Los Angeles, USA", "🇺🇸"],
      "America/Chicago": [41.8781, -87.6298, "Chicago, USA", "🇺🇸"],
      "Europe/London": [51.5074, -0.1278, "London, UK", "🇬🇧"],
      "Europe/Paris": [48.8566, 2.3522, "Paris, France", "🇫🇷"],
      "Europe/Berlin": [52.52, 13.405, "Berlin, Germany", "🇩🇪"],
      "Asia/Tokyo": [35.6762, 139.6503, "Tokyo, Japan", "🇯🇵"],
      "Asia/Shanghai": [31.2304, 121.4737, "Shanghai, China", "🇨🇳"],
      "Australia/Sydney": [-33.8688, 151.2093, "Sydney, Australia", "🇦🇺"],
      "Africa/Cairo": [30.0444, 31.2357, "Cairo, Egypt", "🇪🇬"],
      "America/Sao_Paulo": [-23.5505, -46.6333, "São Paulo, Brazil", "🇧🇷"],
      "Asia/Dubai": [25.2048, 55.2708, "Dubai, UAE", "🇦🇪"],
      "Asia/Singapore": [1.3521, 103.8198, "Singapore", "🇸🇬"],
      "Europe/Moscow": [55.7558, 37.6176, "Moscow, Russia", "🇷🇺"],
      "America/Toronto": [43.6532, -79.3832, "Toronto, Canada", "🇨🇦"],
    }),
    []
  );

  // Parse device info from user agent - moved to useCallback to prevent recreation
  const parseDeviceInfo = useCallback((userAgent) => {
    const info = {
      browser: "Unknown",
      version: "Unknown",
      os: "Unknown",
      device: "Desktop",
    };

    // Browser detection
    if (userAgent.includes("Firefox/")) {
      info.browser = "Firefox";
      info.version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Chrome/")) {
      info.browser = userAgent.includes("Edg/") ? "Edge" : "Chrome";
      const match = userAgent.match(
        userAgent.includes("Edg/") ? /Edg\/([0-9.]+)/ : /Chrome\/([0-9.]+)/
      );
      info.version = match?.[1] || "Unknown";
    } else if (userAgent.includes("Safari/")) {
      info.browser = "Safari";
      info.version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
    }

    // OS detection
    if (userAgent.includes("Windows NT")) {
      info.os = "Windows";
    } else if (userAgent.includes("Mac OS X")) {
      info.os = "macOS";
    } else if (userAgent.includes("Linux")) {
      info.os = "Linux";
    } else if (userAgent.includes("Android")) {
      info.os = "Android";
      info.device = "Mobile";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      info.os = userAgent.includes("iPad") ? "iPadOS" : "iOS";
      info.device = userAgent.includes("iPad") ? "Tablet" : "Mobile";
    }

    return info;
  }, []);

  // Calculate distance between two coordinates - moved to useCallback
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const getConfidenceLevel = useCallback((distance) => {
    if (distance < 50)
      return {
        level: "🟢 Excellent",
        text: "Very Close Match",
        color: "text-green-300",
      };
    if (distance < 200)
      return {
        level: "🟡 Good",
        text: "Reasonable Match",
        color: "text-yellow-300",
      };
    if (distance < 500)
      return {
        level: "🟠 Fair",
        text: "Different Areas",
        color: "text-orange-300",
      };
    return { level: "🔴 Poor", text: "Far Apart", color: "text-red-300" };
  }, []);

  // Prepare data for different chart types - moved to useMemo to prevent recreation
  const temperatureData = useMemo(() => {
    if (!weatherData) return [];
    return [
      {
        name: "Current",
        temp_c: weatherData.current.temp_c,
        temp_f: weatherData.current.temp_f,
      },
      {
        name: "Feels Like",
        temp_c: weatherData.current.feelslike_c,
        temp_f: (weatherData.current.feelslike_c * 9) / 5 + 32,
      },
      {
        name: "Dew Point",
        temp_c: weatherData.current.dewpoint_c,
        temp_f: (weatherData.current.dewpoint_c * 9) / 5 + 32,
      },
      {
        name: "Heat Index",
        temp_c: weatherData.current.heatindex_c,
        temp_f: (weatherData.current.heatindex_c * 9) / 5 + 32,
      },
    ];
  }, [weatherData]);

  const atmosphericData = useMemo(() => {
    if (!weatherData) return [];
    return [
      {
        name: "Humidity",
        value: weatherData.current.humidity,
        max: 100,
        color: "#06b6d4",
      },
      {
        name: "Cloud Cover",
        value: weatherData.current.cloud,
        max: 100,
        color: "#8b5cf6",
      },
      {
        name: "UV Index",
        value: weatherData.current.uv,
        max: 12,
        color: "#f59e0b",
      },
    ];
  }, [weatherData]);

  const windData = useMemo(() => {
    if (!weatherData) return [];
    return [
      { name: "Wind Speed", value: weatherData.current.wind_kph },
      { name: "Wind Gust", value: weatherData.current.gust_kph },
    ];
  }, [weatherData]);

  const pressureVisibilityData = useMemo(() => {
    if (!weatherData) return [];
    return [
      { name: "Pressure", value: weatherData.current.pressure_mb, unit: "mb" },
      { name: "Visibility", value: weatherData.current.vis_km, unit: "km" },
      {
        name: "Precipitation",
        value: weatherData.current.precip_mm,
        unit: "mm",
      },
    ];
  }, [weatherData]);

  const weatherMetrics = useMemo(() => {
    if (!weatherData) return [];
    return [
      {
        name: "Temperature",
        value: weatherData.current.temp_c,
        unit: "°C",
        icon: Thermometer,
        color: "#ef4444",
      },
      {
        name: "Humidity",
        value: weatherData.current.humidity,
        unit: "%",
        icon: Droplets,
        color: "#06b6d4",
      },
      {
        name: "Wind Speed",
        value: weatherData.current.wind_kph,
        unit: "km/h",
        icon: Wind,
        color: "#10b981",
      },
      {
        name: "Pressure",
        value: weatherData.current.pressure_mb,
        unit: "mb",
        icon: Gauge,
        color: "#8b5cf6",
      },
      {
        name: "Cloud Cover",
        value: weatherData.current.cloud,
        unit: "%",
        icon: Cloud,
        color: "#6b7280",
      },
      {
        name: "Visibility",
        value: weatherData.current.vis_km,
        unit: "km",
        icon: Eye,
        color: "#f59e0b",
      },
    ];
  }, [weatherData]);

  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/30 shadow-xl">
          <p className="text-cyan-300 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value} {entry.unit || ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneCoords = timezoneCoordinates[userTimeZone];

  const sendTimezoneCoordinates = useCallback(
    async (visitorId, timezoneCoords) => {
      try {
        if (!visitorId || !timezoneCoords) {
          console.log("Missing visitorId or timezoneCoords");
          return;
        }

        // Format the data according to API expectations
        const payload = {
          visitorId,
          timezoneCoord: timezoneCoords,
        };

        //  console.log("Sending timezone coordinates:", payload);
        //  console.log(import.meta.env.VITE_COMMON_URL);

        navigator?.onLine &&
          PatchAction(
            `${
              import.meta.env.VITE_COMMON_URL
            }/timezone_coords/create_timezone_coords`,
            payload
          );
      } catch (error) {
        console.error("Error sending timezone coordinates:", error);
        setErrors((prev) => ({ ...prev, timezoneCoords: error.message }));
      }
    },
    []
  );

  // Helper function to send browser details to API
  const sendBrowserDetails = useCallback(async (browserData) => {
    try {
      const visitorId = localStorage.getItem("visitorId");

      if (!visitorId) {
        console.log("No visitorId found");
        return;
      }

      const payload = {
        language: browserData.language,
        languages: browserData.languages,
        platform: browserData.platform,
        timezone: browserData.timezone,
        utcOffset: browserData.utcOffset,
        visitorId,
      };

      navigator?.onLine &&
        PatchAction(
          `${
            import.meta.env.VITE_COMMON_URL
          }/browser_details/create_browser_details`,
          payload
        );
    } catch (error) {
      console.error("Error sending browser details:", error);
      setErrors((prev) => ({ ...prev, browserDetails: error.message }));
    }
  }, []);

  // Helper function to send device info to API
  const sendDeviceInfo = useCallback(async (deviceInfo) => {
    try {
      const visitorId = localStorage.getItem("visitorId");

      if (!visitorId) {
        setErrors("No visitorId found");
        return;
      }
      if (!deviceInfo) {
        setErrors("Not Founed Device Information");
      }
    } catch (error) {
      console.error("Error sending device info:", error);
      setErrors((prev) => ({ ...prev, deviceInfo: error.message }));
    }
  }, []);

  // Helper function to send IP location to API
  const sendIpLocation = useCallback(async (ipLocation) => {
    try {
      const visitorId = localStorage.getItem("visitorId");

      if (!visitorId) {
        console.log("No visitorId found");
        return;
      }

      const payload = {
        visitorId,
        lat: ipLocation.lat,
        lon: ipLocation.lon,
        city: ipLocation.city,
        country: ipLocation.country,
        region: ipLocation.region,
        service: ipLocation.service,
      };

      navigator?.onLine &&
        PatchAction(
          `${import.meta.env.VITE_COMMON_URL}/iplocation/recordedIpLocation`,
          payload
        );
    } catch (error) {
      console.error("Error sending IP location:", error);
      setErrors((prev) => ({ ...prev, ipLocation: error.message }));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Send timezone coordinates when component mounts
    const visitorId = localStorage.getItem("visitorId");
    if (visitorId && timezoneCoords) {
      sendTimezoneCoordinates(visitorId, timezoneCoords);
    }

    return () => clearInterval(timer);
  }, [timezoneCoords, sendTimezoneCoordinates]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get browser information
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language;
        const languages = navigator.languages || [navigator.language];
        const platform = navigator.platform;
        const offset = new Date().getTimezoneOffset();

        const browserData = {
          timezone,
          language,
          languages: languages.join(", "),
          platform,
          utcOffset: offset,
        };

        setBrowserInfo(browserData);

        // Send browser details to API
        await sendBrowserDetails(browserData);

        // Parse device information
        const deviceInfo = parseDeviceInfo(navigator.userAgent);
        // console.log("Device information:", deviceInfo);
        setDeviceInfo(deviceInfo);
        const visitorId = localStorage.getItem("visitorId");
        const payload = { visitorId, ...deviceInfo };
        navigator?.onLine &&
          PatchAction(
            `${
              import.meta.env.VITE_COMMON_URL
            }/device_Info/recorded_device_Info`,
            payload
          );

        // Send device info to API
        await sendDeviceInfo(deviceInfo);

        // Get IP location with fallback services
        let ipData = null;
        const services = [
          {
            url: import.meta.env.VITE_IPAPI_URL,
            name: import.meta.env.VITE_IPAPI,
          },
          {
            url: import.meta.env.VITE_IP_API_URL,
            name: import.meta.env.VITE_IP_API,
          },
          {
            url: import.meta.env.VITE_IP_INFO_URL,
            name: import.meta.env.VITE_IP_INFO,
          },
        ];

        for (let service of services) {
          try {
            const response = await fetch(service.url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (
              service.name === import.meta.env.VITE_IPAPI &&
              data.latitude &&
              data.longitude
            ) {
              ipData = {
                lat: data.latitude,
                lon: data.longitude,
                city: data.city,
                country: data.country_name,
                region: data.region,
                service: service.name,
              };
              break;
            } else if (
              service.name === import.meta.env.VITE_IPAPI &&
              data.lat &&
              data.lon
            ) {
              ipData = {
                lat: data.lat,
                lon: data.lon,
                city: data.city,
                country: data.country,
                region: data.regionName,
                service: service.name,
              };
              break;
            } else if (
              service.name === import.meta.env.VITE_IP_INFO &&
              data.loc
            ) {
              const [lat, lon] = data.loc.split(",");
              ipData = {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                city: data.city,
                country: data.country,
                region: data.region,
                service: service.name,
              };
              break;
            }
          } catch (error) {
            console.error(`Error with ${service.name}:`, error);
            setErrors((prev) => ({ ...prev, [service.name]: error.message }));
          }
        }

        if (ipData) {
          setIpLocation(ipData);

          // Send IP location to API
          await sendIpLocation(ipData);

          // Get weather data using the successfully retrieved location
          const normalizeCityName = (city) =>
            city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          const rawCity = ipData.city.toLowerCase();
          const normalizedCity = normalizeCityName(rawCity);

          try {
            const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
            if (!weatherApiKey) {
              throw new Error("Weather API key not found");
            }

            const weatherResponse = await fetch(
              `${
                import.meta.env.VITE_WEATHER_API_URL
              }?key=${weatherApiKey}&q=${normalizedCity}`
            );

            if (weatherResponse.ok) {
              const weather = await weatherResponse.json();

              const payload = { visitorId, ...weather };
              navigator?.onLine &&
                PatchAction(
                  `${
                    import.meta.env.VITE_COMMON_URL
                  }/weather_analysis/recorded_weather_info`,
                  payload
                );
              setWeatherData(weather);
            } else {
              throw new Error(`Weather API returned ${weatherResponse.status}`);
            }
          } catch (error) {
            console.error("Error fetching weather:", error);
            setErrors((prev) => ({ ...prev, weather: error.message }));
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            location: "Could not determine IP location",
          }));
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setErrors((prev) => ({ ...prev, general: error.message }));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [parseDeviceInfo, sendBrowserDetails, sendDeviceInfo, sendIpLocation]);

  if (loading) {
    return <Loading />;
  }

  

  if (Object.keys(errors).length > 0 && !weatherData) {
    // Only show error page if there are errors AND no weather data
    console.log("Current errors:", errors);
    // return <ErrorPage />;
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            🔍 Advanced System Detector
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time analysis of your device, location, and environment
          </p>
          <div className="mt-4 inline-block bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
            <span className="text-sm font-mono">
              {currentTime.toLocaleString()}
            </span>
          </div>
        </div>

       <div className="flex justify-center mb-8">
      <div className="flex bg-gradient-to-br from-purple-900 via-blue-700 to-indigo-900 text-white p-4 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto scrollbar-hide max-w-full px-2 sm:px-4 py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path; // check active path
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base font-medium whitespace-nowrap ${
                isActive
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.name}

              {/* Active underline */}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-1 mx-auto w-2/3 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>

        {/* First Row - 4 equal cards (1/4 each) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Device Information Card */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                📱
              </div>
              <h3 className="text-lg font-semibold">Device Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Browser:</span>
                <span className="font-semibold">{deviceInfo?.browser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Version:</span>
                <span className="font-semibold">{deviceInfo?.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">OS:</span>
                <span className="font-semibold">{deviceInfo?.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Type:</span>
                <span className="font-semibold">{deviceInfo?.device}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Screen:</span>
                <span className="font-semibold text-xs">
                  {screen.width}×{screen.height}
                </span>
              </div>
            </div>
          </div>

          {/* Browser Details Card */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                🌐
              </div>
              <h3 className="text-lg font-semibold">Browser Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Language:</span>
                <span className="font-semibold">{browserInfo.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">UTC Offset:</span>
                <span className="font-semibold">
                  {browserInfo.utcOffset} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Color:</span>
                <span className="font-semibold">{screen.colorDepth} bit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Ratio:</span>
                <span className="font-semibold">{window.devicePixelRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span
                  className={`font-semibold ${
                    navigator.onLine ? "text-green-400" : "text-red-400"
                  }`}>
                  {navigator.onLine ? "🟢 Online" : "🔴 Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Timezone Location Card */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                🕒
              </div>
              <h3 className="text-lg font-semibold">Timezone</h3>
            </div>
            {timezoneCoords ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{timezoneCoords[3]}</span>
                  <span className="font-semibold text-xs">
                    {timezoneCoords[2]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Lat:</span>
                  <span className="font-semibold">{timezoneCoords[0]}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Lon:</span>
                  <span className="font-semibold">{timezoneCoords[1]}°</span>
                </div>
                <div className="bg-green-500/20 rounded-lg p-2 text-center mt-3">
                  <span className="text-green-300 font-semibold text-xs">
                    ✅ Identified
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/20 rounded-lg p-3 text-center">
                <span className="text-red-300 text-xs">❌ Not in database</span>
              </div>
            )}
          </div>

          {/* IP Geolocation Card */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                🌍
              </div>
              <h3 className="text-lg font-semibold">IP Location</h3>
            </div>
            {ipLocation ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">City:</span>
                  <span className="font-semibold">{ipLocation.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Region:</span>
                  <span className="font-semibold">{ipLocation.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Country:</span>
                  <span className="font-semibold">{ipLocation.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Coords:</span>
                  <span className="font-semibold text-xs">
                    {ipLocation.lat}°, {ipLocation.lon}°
                  </span>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-1 text-center mt-2">
                  <span className="text-purple-300 text-xs">
                    {ipLocation.service ? (
                      <div className="bg-green-500/20 rounded-lg p-2 text-center mt-3">
                        <span className="text-green-300 font-semibold text-xs">
                          ✅ Identified
                        </span>
                      </div>
                    ) : (
                      <div className="bg-red-500/20 rounded-lg p-3 text-center">
                        <span className="text-red-300 text-xs">
                          ❌ Not in database
                        </span>
                      </div>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/20 rounded-lg p-3 text-center">
                <span className="text-red-300 text-xs">❌ Unavailable</span>
              </div>
            )}
          </div>
        </div>

        {/* Second Row - Weather (3/4) and Location Analysis (1/4) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Weather Card - Takes 3/4 space */}
          {weatherData && (
            <div className="lg:col-span-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500/30 rounded-lg flex items-center justify-center text-xl">
                  🌤️
                </div>
                <h3 className="text-xl font-semibold">
                  Current Weather - {weatherData.location.name},{" "}
                  {weatherData.location.country}
                </h3>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={`https:${weatherData.current.condition.icon}`}
                  alt={weatherData.current.condition.text}
                  className="w-16 h-16"
                />
                <div>
                  <div className="text-3xl font-bold">
                    {weatherData.current.temp_c}°C
                  </div>
                  <div className="text-cyan-200">
                    {weatherData.current.condition.text}
                  </div>
                  <div className="text-sm text-gray-300">
                    {weatherData.location.localtime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-sm">
                {[
                  {
                    label: "Feels Like",
                    value: `${weatherData.current.feelslike_c}°C`,
                  },
                  {
                    label: "Temperature (F)",
                    value: `${weatherData.current.temp_f}°F`,
                  },
                  {
                    label: "Wind",
                    value: `${weatherData.current.wind_kph} km/h`,
                  },
                  {
                    label: "Humidity",
                    value: `${weatherData.current.humidity}%`,
                  },
                  {
                    label: "Pressure",
                    value: `${weatherData.current.pressure_mb} mb`,
                  },
                  { label: "Cloud", value: `${weatherData.current.cloud}%` },
                  { label: "UV Index", value: weatherData.current.uv },
                  {
                    label: "Precipitation",
                    value: `${weatherData.current.precip_mm} mm`,
                  },
                  {
                    label: "Visibility",
                    value: `${weatherData.current.vis_km} km`,
                  },
                  {
                    label: "Is Day",
                    value: weatherData.current.is_day ? "Yes" : "No",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-2">
                    <div className="text-gray-300">{item.label}</div>
                    <div className="font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Analysis Card - Takes 1/4 space */}
          {timezoneCoords && ipLocation && (
            <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-md rounded-xl p-6 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/30 rounded-lg flex items-center justify-center">
                  📏
                </div>
                <h3 className="text-lg font-semibold">Location Analysis</h3>
              </div>
              {(() => {
                const distance = calculateDistance(
                  timezoneCoords[0],
                  timezoneCoords[1],
                  ipLocation.lat,
                  ipLocation.lon
                );
                const confidence = getConfidenceLevel(distance);

                return (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {distance.toFixed(0)} km
                      </div>
                      <div className="text-gray-300 text-sm">
                        Distance between locations
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Accuracy:</span>
                        <span
                          className={`font-semibold text-sm ${confidence.color}`}>
                          {confidence.level}
                        </span>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs text-gray-400">
                          {confidence.text}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 text-center">
                      Comparing timezone location with IP geolocation
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  {weatherData.current.is_day ? (
                    <Sun className="w-8 h-8 text-white" />
                  ) : (
                    <Moon className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-1">
                    Weather Analytics
                  </h1>
                  <p className="text-cyan-300 text-lg">
                    {weatherData.location.name}, {weatherData.location.country}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-white">
                <img
                  src={`https:${weatherData.current.condition.icon}`}
                  alt={weatherData.current.condition.text}
                  className="w-12 h-12"
                />
                <span className="text-3xl font-bold">
                  {weatherData.current.temp_c}°C
                </span>
                <span className="text-xl text-cyan-200">
                  {weatherData.current.condition.text}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-cyan-500/30">
                {["overview", "temperature", "atmospheric", "wind"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full transition-all duration-300 capitalize ${
                        activeTab === tab
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                          : "text-cyan-200 hover:text-white hover:bg-white/10"
                      }`}>
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Chart Sections */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Key Metrics Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {weatherMetrics.map((metric, index) => {
                    const IconComponent = metric.icon;
                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${metric.color}30` }}>
                            <IconComponent
                              className="w-4 h-4"
                              style={{ color: metric.color }}
                            />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-300">
                          {metric.name}
                        </div>
                        <div className="text-xs text-cyan-300">
                          {metric.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Radial Progress Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Atmospheric Conditions
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="80%"
                      data={atmosphericData}>
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#06b6d4"
                      />
                      {atmosphericData.map((entry, index) => (
                        <RadialBar
                          key={index}
                          dataKey="value"
                          cornerRadius={10}
                          fill={entry.color}
                          data={[entry]}
                        />
                      ))}
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Environmental Metrics
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pressureVisibilityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#a5f3fc", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#a5f3fc", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="#06b6d4"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "temperature" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Line Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Temperature Variations (°C)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#a5f3fc", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#a5f3fc", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="temp_c"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Temperature Area Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Temperature Range (°F)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#a5f3fc", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#a5f3fc", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="temp_f"
                        stroke="#f59e0b"
                        fill="url(#tempGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="tempGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "atmospheric" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Humidity and Cloud Cover */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Atmospheric Conditions
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={atmosphericData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#a5f3fc", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#a5f3fc", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        fill="url(#atmosphericGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="atmosphericGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#06b6d4"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart for UV Index */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    UV Index Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Current UV",
                            value: weatherData.current.uv,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Remaining",
                            value: 12 - weatherData.current.uv,
                            fill: "#374151",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value">
                        <Cell fill="#f59e0b" />
                        <Cell fill="#374151" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "wind" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Wind Speed Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Wind Conditions
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={windData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#a5f3fc", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#a5f3fc", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fill="url(#windGradient)"
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient
                          id="windGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Wind Direction Compass */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Wind Direction
                  </h3>
                  <div className="flex items-center justify-center h-72">
                    <div className="relative w-48 h-48 border-4 border-cyan-500/30 rounded-full flex items-center justify-center">
                      <div className="absolute top-2 text-cyan-300 font-bold">
                        N
                      </div>
                      <div className="absolute right-2 text-cyan-300 font-bold">
                        E
                      </div>
                      <div className="absolute bottom-2 text-cyan-300 font-bold">
                        S
                      </div>
                      <div className="absolute left-2 text-cyan-300 font-bold">
                        W
                      </div>
                      <div
                        className="absolute w-1 h-20 bg-gradient-to-t from-green-500 to-green-300 origin-bottom transform transition-transform duration-500"
                        style={{
                          transform: `rotate(${weatherData.current.wind_degree}deg)`,
                        }}></div>
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div className="absolute bottom-4 text-center">
                        <div className="text-white font-bold">
                          {weatherData.current.wind_dir}
                        </div>
                        <div className="text-cyan-300 text-sm">
                          {weatherData.current.wind_degree}°
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>System analysis completed • Real-time data visualization</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDetector;
