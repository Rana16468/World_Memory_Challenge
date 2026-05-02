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
} from "lucide-react";
import Loading from "../coomon/Loading";
import ErrorPage from "../coomon/ErrorPage";
import PatchAction from "../coomon/commonAction/PatchAction";

const DeviceFingerprint = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        // Import FingerprintJS dynamically
        const FingerprintJS = await import("@fingerprintjs/fingerprintjs");

        // Initialize the agent
        const fp = await FingerprintJS.load();

        // Get the visitor identifier
        const result = await fp.get();
        localStorage?.setItem("visitorId", result?.visitorId);
        

        // Set the unique device ID
        setDeviceId(result.visitorId);

        // Extract additional device information
        const components = result.components;
        if(!components){return <ErrorPage error={`issues by the components section`}/>}
        console.log("..................deviceInfoItems .......");

        const payload={
          visitorId:result.visitorId,
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
        }

         navigator?.onLine && PatchAction(`${import.meta.env.VITE_COMMON_URL}/device_info_items/recorded_device_info_items`,payload);

        

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

  if (loading) {
    return <Loading/>
      
    
  }

  if (error) {
    return <ErrorPage error={error}/>
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
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Unique Device ID
                </h2>
                <p className="text-slate-300">
                  Your device's digital fingerprint
                </p>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
              <div className="flex items-center space-x-2">
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy ID</span>
                  </>
                )}
              </div>
            </button>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <code className="text-lg font-mono text-emerald-400 break-all leading-relaxed">
              {deviceId}
            </code>
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

export default DeviceFingerprint;
