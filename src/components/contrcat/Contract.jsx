import { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Shield,
  Copy,
  CheckCircle,
  Cpu,
  HardDrive,
  Wifi,
  Palette,
  Eye,
  Languages,
  User,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
const Contract = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        // Import FingerprintJS dynamically
        const FingerprintJS = await import("@fingerprintjs/fingerprintjs");

        // Initialize the agent
        const fp = await FingerprintJS.load();

        // Get the visitor identifier
        const result = await fp.get();

        // Set the unique device ID
        setDeviceId(result.visitorId);

        // Extract additional device information
        const components = result.components;
        if (!components) {
          console.log("");
        }

        setDeviceInfo({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenResolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth,
          touchSupport: "ontouchstart" in window,
          deviceMemory: navigator.deviceMemory || "Unknown",
          hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
          connectionType: navigator.connection?.effectiveType || "Unknown",
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    generateFingerprint();
  }, []);

  const getDeviceIcon = () => {
    if (deviceInfo.touchSupport && deviceInfo.screenResolution) {
      const [width] = deviceInfo.screenResolution.split("x").map(Number);
      if (width < 768)
        return <Smartphone className="w-8 h-8 text-emerald-500" />;
      if (width < 1024) return <Tablet className="w-8 h-8 text-blue-500" />;
    }
    return <Monitor className="w-8 h-8 text-purple-500" />;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        deviceId: deviceId,
      };

      const response = await fetch(
        `${import.meta.env.VITE_COMMON_URL}/contract/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );
      const data = await response.json();

      if (!data?.data?.status) {
        toast.error(data?.data?.message);
        setSubmitSuccess(data?.data?.status);
      }

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          address: "",
        });
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-300 border-t-purple-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border-4 border-purple-400 opacity-20"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Analyzing Device</h3>
              <p className="text-purple-200">
                Generating unique fingerprint...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md border border-red-300/20">
          <div className="flex items-center space-x-4 text-red-300">
            <Shield className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-white">Error Detected</h3>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-400/20">
            <p className="text-red-200 text-sm">
              Make sure you've installed @fingerprintjs/fingerprintjs package.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const deviceInfoItems = [
    {
      icon: Globe,
      label: "Platform",
      value: deviceInfo.platform,
      color: "text-blue-400",
    },
    {
      icon: Clock,
      label: "Timezone",
      value: deviceInfo.timezone,
      color: "text-green-400",
    },
    {
      icon: Monitor,
      label: "Screen Resolution",
      value: deviceInfo.screenResolution,
      color: "text-purple-400",
    },
    {
      icon: Palette,
      label: "Color Depth",
      value: `${deviceInfo.colorDepth}-bit`,
      color: "text-pink-400",
    },
    {
      icon: Eye,
      label: "Touch Support",
      value: deviceInfo.touchSupport ? "Yes" : "No",
      color: "text-cyan-400",
    },
    {
      icon: Languages,
      label: "Language",
      value: deviceInfo.language,
      color: "text-orange-400",
    },
    {
      icon: Cpu,
      label: "CPU Cores",
      value: deviceInfo.hardwareConcurrency,
      color: "text-red-400",
    },
    {
      icon: HardDrive,
      label: "Memory",
      value: `${deviceInfo.deviceMemory}GB`,
      color: "text-yellow-400",
    },
    {
      icon: Wifi,
      label: "Connection",
      value: deviceInfo.connectionType,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {getDeviceIcon()}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Device Fingerprint
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your unique digital signature in the vast landscape of the internet
          </p>
        </div>

        {/* Device ID Card */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            {/* Left side */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Unique Device ID
                </h2>
                <p className="text-slate-300 text-sm sm:text-base">
                  Your device's digital fingerprint
                </p>
                <p className="text-slate-300 text-sm sm:text-base mt-1">
                  This is a one-time critical contract. If you share your valid
                  information, we would like to access and share your current
                  location details.
                </p>
              </div>
            </div>

            {/* Copy Button */}
            <div className="w-full sm:w-auto">
              <button
                onClick={copyToClipboard}
                className="group w-full sm:w-auto px-4 py-2 mt-4 sm:mt-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                <div className="flex items-center justify-center gap-2">
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span className="text-sm sm:text-base">Copy ID</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Device ID Display */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-700/50 overflow-x-auto">
            <code className="text-base sm:text-lg font-mono text-emerald-400 break-all leading-relaxed">
              {deviceId}
            </code>
          </div>
        </div>

        {/* User Information Form */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                User Information
              </h2>
              <p className="text-slate-300">
                Complete your profile to link with device fingerprint
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                <div className="flex items-center space-x-3">
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-lg font-semibold">
                        Submitting...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span className="text-lg font-semibold">
                        Submit Information
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {submitSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Information submitted successfully!
                  </span>
                </div>
              </div>
            )}

            {error && submitSuccess === false && (
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-red-400">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Error: {error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Information Grid */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Device Analytics
              </h2>
              <p className="text-slate-300">
                Detailed information about your device
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deviceInfoItems.map((item, index) => (
              <div
                key={index}
                className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 bg-slate-700/50 rounded-xl group-hover:bg-slate-600/50 transition-colors`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">
                      {item.label}
                    </p>
                    <p className="text-white font-semibold truncate">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-lg rounded-2xl p-6 border border-amber-400/20">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-2">
                Privacy & Security
              </h3>
              <p className="text-amber-100 leading-relaxed">
                This fingerprint is generated entirely on your device using
                browser characteristics. No personal data is collected or
                transmitted. Please use this technology responsibly and in
                compliance with applicable privacy regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;
