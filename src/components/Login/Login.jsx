import React, { useState, useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  Smartphone,
  MapPin,
  Monitor,
  Chrome,
  Globe,
} from "lucide-react";
import DeviceDetector from "device-detector-js";
import { useDeviceFingerprintWithCache } from "../Fingerprint/useDeviceFingerprint";
import { useSocialMediaLoginMutation } from "../redux/api/auth/authApi";

// import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";

const Login = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [ipInfo, setIpInfo] = useState(null);
  const [ipLoading, setIpLoading] = useState(false);
  
  // Add error handling for device fingerprint hook
  const { deviceId, error: fingerprintError } = useDeviceFingerprintWithCache();
  const [socialAuth, { isLoading: authLoading, error }] = useSocialMediaLoginMutation();
  // const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);

    setDeviceInfo({
      device: device.device,
      os: device.os,
      client: device.client,
      bot: device.bot,
    });

    // Get IP address
    getIPAddress();
  }, []);

  const getIPAddress = async () => {
    setIpLoading(true);

    try {
      const response = await fetch("https://api.ipify.org/?format=json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setIpInfo({
        ip: data?.ip,
      });
    } catch (error) {
      console.error("Error getting IP address:", error);
      setIpInfo({ error: error.message });
    } finally {
      setIpLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);

    try {
      // Decode the JWT token to get user info
      const token = credentialResponse.credential;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const userInfo = JSON.parse(jsonPayload);

      console.log(userInfo)
      setUser(userInfo);

      // Prepare login data with fallbacks and validation
      const loginData = {
        name: userInfo?.name || "Unknown",
        email: userInfo?.email || "Unknown",
        picture: userInfo?.picture || "N/A",
        isVerify: userInfo?.email_verified ?? false,
        ipaddress: ipInfo?.ip || ipInfo?.error || "N/A",
        engine: deviceInfo?.client?.engine || "N/A",
        browsername: `${deviceInfo?.client?.name || "Unknown"} ${
          deviceInfo?.client?.type || ""
        } ${deviceInfo?.client?.version || ""}`.trim(),
        device: deviceInfo?.device?.type || deviceInfo?.device?.brand || "N/A",
        os: deviceInfo?.os?.name || "Unknown",
        platform: `${deviceInfo?.os?.platform || deviceInfo?.os?.name || ""} ${
          deviceInfo?.os?.version || ""
        }`.trim(),
        deviceId: deviceId || "N/A"
      };


      console.log(loginData)

      // Log comprehensive session info
      const response = await socialAuth(loginData).unwrap();
      
      // Fixed condition and added proper error handling
      if (response?.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        console.log("Access token stored:", response.data.accessToken);
        
        dispatch(
          setUser({
            user: response.data || {},
            token: response.data.accessToken,
          })
        );
        // navigate("/");
      } else {
        throw new Error("No access token received from server");
      }

    } catch (error) {
      console.error("Error processing login:", error);
    
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Login Failed");
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token"); // Clean up token on logout
  };

  // Handle loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Authentication error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            {error?.data?.message || error?.message || "An error occurred during authentication"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show fingerprint error if exists
  if (fingerprintError) {
    console.warn("Device fingerprint error:", fingerprintError);
  }

  // Success screen after login
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-gray-600">Successfully logged in</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                User Information
              </h2>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 mb-1" />
                  <p className="text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">{user.given_name || "N/A"}</p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600 mb-1" />
                  <p className="text-gray-600">Verified</p>
                  <p className="font-medium text-gray-900">
                    {user.email_verified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Device & IP Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Session Information
              </h2>

              {/* Device Information */}
              {deviceInfo && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Device Info</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-600">Device:</span>{" "}
                      {deviceInfo.device?.type || "Desktop"}
                    </p>
                    <p>
                      <span className="text-gray-600">OS:</span>{" "}
                      {deviceInfo.os?.name} {deviceInfo.os?.version}
                    </p>
                    <p>
                      <span className="text-gray-600">Browser:</span>{" "}
                      {deviceInfo.client?.name} {deviceInfo.client?.version}
                    </p>
                  </div>
                </div>
              )}

              {/* IP Information */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Globe className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="font-medium text-gray-900">IP Information</h3>
                </div>
                <div className="text-sm">
                  {ipLoading ? (
                    <p className="text-gray-600">Getting IP address...</p>
                  ) : ipInfo?.error ? (
                    <p className="text-red-600">
                      IP unavailable: {ipInfo.error}
                    </p>
                  ) : ipInfo ? (
                    <div className="space-y-1">
                      <p>
                        <span className="text-gray-600">IP Address:</span>{" "}
                        {ipInfo.ip}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">IP address not available</p>
                  )}
                </div>
              </div>

              {/* Login Time */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Login Time</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Check for Google Client ID
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h1>
          <p className="text-gray-600">Google Client ID is not configured. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-purple-600 flex items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          {/* Floating Background Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>

          {/* Card */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Shield className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Welcome to Eleegon
              </h1>
              <p className="text-gray-600">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Device Preview */}
            {deviceInfo && (
              <div className="mb-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2 text-sm text-indigo-700 shadow-sm">
                <Monitor className="w-4 h-4" />
                <span>
                  {deviceInfo.os?.name} • {deviceInfo.client?.name}
                </span>
              </div>
            )}

            {/* IP Preview */}
            {ipInfo && !ipInfo.error && (
              <div className="mb-6 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-2 text-sm text-purple-700 shadow-sm">
                <Globe className="w-4 h-4" />
                <span>IP: {ipInfo.ip}</span>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/90 text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signin_with"
                shape="pill"
                theme="filled_blue"
                width="100%"
              />
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
                Sign up for Eleegon
              </a>
            </div>
          </div>
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
              <p className="text-gray-700 font-medium">Signing you in...</p>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;