import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, FileText, Mic, Search, Play, Users, Globe, BookOpen, Award, Sparkles, Zap } from 'lucide-react';

const About = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // Simulate geolocation detection
  useEffect(() => {
    const simulateGeolocation = () => {
      setTimeout(() => {
        setUserLocation({
          city: "Dhaka",
          country: "Bangladesh",
          lat: 23.8103,
          lon: 90.4125
        });
        setWeatherData({
          temp: 28,
          condition: "Partly Cloudy",
          humidity: 75
        });
      }, 1500);
    };
    simulateGeolocation();
  }, []);

  const services = [
    {
      title: "Smart Location",
      description: "Auto-detect location for personalized content",
      icon: <MapPin className="w-5 h-5" />,
      color: "from-emerald-400 to-teal-500",
      bgColor: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "IELTS Games",
      description: "Interactive vocabulary building games",
      icon: <Play className="w-5 h-5" />,
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "PDF Converter",
      description: "Convert PDFs with voice features",
      icon: <FileText className="w-5 h-5" />,
      color: "from-blue-400 to-cyan-500",
      bgColor: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Word Search",
      description: "Discover detailed word information",
      icon: <Search className="w-5 h-5" />,
      color: "from-orange-400 to-red-500",
      bgColor: "from-orange-500/20 to-red-500/20"
    }
  ];

  const stats = [
    { label: "Users", value: "50K+", icon: <Users className="w-4 h-4" /> },
    { label: "Games", value: "2M+", icon: <Play className="w-4 h-4" /> },
    { label: "Words", value: "500K+", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Success", value: "94%", icon: <Award className="w-4 h-4" /> }
  ];

  const gameModes = [
    {
      name: 'IELTS Vocabulary',
      icon: '📚',
      color: 'from-emerald-400 to-teal-500',
      time: '45s'
    },
    {
      name: 'Academic Shiritori',
      icon: '🎓',
      color: 'from-purple-400 to-pink-500',
      time: '35s'
    },
    {
      name: 'Topic Master',
      icon: '🌟',
      color: 'from-blue-400 to-cyan-500',
      time: '40s'
    },
    {
      name: 'Synonym Challenge',
      icon: '🔄',
      color: 'from-orange-400 to-red-500',
      time: '30s'
    }
  ];

  console.log(activeFeature);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About Us
            </h1>
            <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Revolutionizing language learning with intelligent automation
          </p>
          
          {/* Compact Location Widget */}
          <div className="mt-6 inline-flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">
                {userLocation ? `${userLocation.city}` : "Detecting..."}
              </span>
            </div>
            {weatherData && (
              <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">
                  {weatherData.temp}°C
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group">
              <div className="text-purple-400 mb-1 flex justify-center group-hover:text-cyan-400 transition-colors">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Compact Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 cursor-pointer"
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 text-sm">{service.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Zap className="w-3 h-3" />
                  <span>Smart & Automated</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Games Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🎮 IELTS Gaming Hub
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gameModes.map((game, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-br ${game.color} rounded-xl p-4 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl group`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                  <h3 className="text-sm font-bold mb-1">{game.name}</h3>
                  <div className="bg-white/20 rounded-full px-2 py-1 text-xs font-semibold">
                    {game.time}
                  </div>
                </div>
                
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center group hover:border-white/40 transition-all duration-300">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Voice Recording</h3>
            <p className="text-gray-400 text-sm">Record & playback with PDF conversion</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center group hover:border-white/40 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Global Access</h3>
            <p className="text-gray-400 text-sm">Automatic location-based content</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center group hover:border-white/40 transition-all duration-300">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Dictionary</h3>
            <p className="text-gray-400 text-sm">Comprehensive word definitions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;