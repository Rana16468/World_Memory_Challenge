import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Home,
  User,
  Briefcase,
  Mail,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  ScanSearch,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setMobileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileDropdown = () => {
    setMobileDropdownOpen(!mobileDropdownOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Close all menus when clicking on any link
  const handleLinkClick = () => {
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    setIsOpen(false);
  };

  const gameLinks = [
    {
      title: "Memory Game",
      description: "Creative Game",
      path: "/country_memory_game",
    },
    {
      title: "Word Chine",
      description: "Creative Game",
      path: "/advanced_game",
    },
    {
      title: "Game Zone",
      description: "IELTS Game Zone",
      path: "/game_zone",
    },
    {
      title: "Dynamic Neuroverse",
      description: "Creative Game",
      path: "/dynamic_neuroverse",
    },
    {
      title: "Nasa Asteroid",
      description: "Nasa Asteroid Data Set",
      path: "/rocket_launch_simulator",
    },
    {
      title: "PDF To Voice",
      description: "PDF Voice Recorder",
      path: "/pdf_voice_recorder",
    },
    {
      title: "Text To Voice",
      description: "TEXT To Voice Recorder",
      path: "/text_voice_recorder",
    },
    {
      title: "Studio",
      description: "Recording Studio",
      path: "/video_recording_system",
    },
    {
      title: "English To Bangla",
      description: "Translator",
      path: "/convater",
    },
    {
      title: "English To Bangla (PDF)",
      description: "Translator",
      path: "/pdf_convater",
    },
    {
      title: "Dictionary",
      description: "Expert Guidance",
      path: "/dictionary_app",
    },
  ];

  return (
    <>
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <nav
        className={`bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-2xl sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-opacity-90 shadow-purple-500/25" : ""
        }`}>
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-2 mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-white font-bold text-2xl tracking-wide hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-200 hover:to-purple-200 transition-all duration-300 cursor-pointer">
                Eleegon
              </div>
              <div className="ml-2 px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-xs font-semibold text-white animate-bounce">
                PRO
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <Link
                  onClick={handleLinkClick}
                  to="/"
                  className="group relative text-white hover:text-purple-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-2">
                  <Home size={18} className="group-hover:animate-bounce" />
                  <span>Home</span>
                </Link>

                <Link
                  onClick={handleLinkClick}
                  to="/about"
                  className="group relative text-white hover:text-purple-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-2">
                  <User size={18} className="group-hover:animate-bounce" />
                  <span>About</span>
                </Link>

                <Link
                  to="/website_validator"
                  onClick={handleLinkClick}
                  className="group relative text-white hover:text-purple-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-2">
                  <ScanSearch
                    size={18}
                    className="group-hover:animate-bounce"
                  />
                  <span>WebsiteInspector</span>
                </Link>

                {/* Desktop Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="group relative text-white hover:text-purple-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-2">
                    <Briefcase
                      size={18}
                      className="group-hover:animate-bounce"
                    />
                    <span>Services</span>
                    <ChevronDown
                      size={16}
                      className={`transform transition-all duration-300 ${
                        dropdownOpen ? "rotate-180 text-pink-300" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-4 z-50 border border-white/30">
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-white/95 backdrop-blur-xl rotate-45 border-l border-t border-white/30"></div>
                      <div className="px-3 space-y-1 max-h-96 overflow-y-auto">
                        {gameLinks.map((game, idx) => (
                          <Link
                            key={idx}
                            to={game.path}
                            onClick={handleLinkClick}
                            className="w-full flex items-center px-4 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 rounded-xl group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Star className="w-5 h-5 text-blue-600 group-hover:animate-spin" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-semibold block text-sm">
                                {game.title}
                              </span>
                              <span className="text-xs text-gray-500 group-hover:text-blue-500">
                                {game.description}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/contract"
                  onClick={handleLinkClick}
                  className="group relative text-white hover:text-purple-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-2">
                  <Mail size={18} className="group-hover:animate-bounce" />
                  <span>Contact</span>
                </Link>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="relative text-white hover:text-purple-200 p-3 rounded-full transition-all duration-300 hover:bg-white/10 group ml-2">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <Sun
                      size={20}
                      className={`absolute transition-all duration-500 transform ${
                        isDarkMode
                          ? "rotate-180 scale-0 opacity-0"
                          : "rotate-0 scale-100 opacity-100"
                      }`}
                    />
                    <Moon
                      size={20}
                      className={`absolute transition-all duration-500 transform ${
                        isDarkMode
                          ? "rotate-0 scale-100 opacity-100"
                          : "-rotate-180 scale-0 opacity-0"
                      }`}
                    />
                  </div>
                </button>

                {/* CTA Button */}
                <button className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl ml-4 group">
                  <span className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <Sparkles size={16} className="group-hover:animate-spin" />
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="relative text-white hover:text-purple-200 p-3 rounded-xl transition-all duration-300 hover:bg-white/10">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-4 pb-6 space-y-2 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl rounded-2xl mt-4 mb-4 border border-white/20 shadow-2xl">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  className="w-full text-white hover:text-purple-200 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-3">
                  <Home size={20} />
                  <span>Home</span>
                </Link>

                <Link
                  to="/about"
                  onClick={handleLinkClick}
                  className="w-full text-white hover:text-purple-200 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-3">
                  <User size={20} />
                  <span>About</span>
                </Link>

                <Link
                  onClick={handleLinkClick}
                  to="/website_validator"
                  className="w-full text-white hover:text-purple-200 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-3">
                  <ScanSearch size={20} />
                  <span>WebsiteInspector</span>
                </Link>

                {/* Mobile Dropdown Menu */}
                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    onClick={toggleMobileDropdown}
                    className="w-full text-white hover:text-purple-200 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-3">
                    <Briefcase size={20} />
                    <span>Services</span>
                    <ChevronDown
                      size={16}
                      className={`ml-auto transform transition-all duration-300 ${
                        mobileDropdownOpen ? "rotate-180 text-pink-300" : ""
                      }`}
                    />
                  </button>

                  {mobileDropdownOpen && (
                    <div className="mt-2 ml-4 space-y-1 bg-white/10 rounded-xl p-2 backdrop-blur-sm max-h-80 overflow-y-auto">
                      {gameLinks.map((game, idx) => (
                        <Link
                          key={idx}
                          to={game.path}
                          onClick={handleLinkClick}
                          className="w-full flex items-center px-4 py-4 text-white hover:text-purple-200 transition-all duration-300 rounded-xl hover:bg-white/10">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100/20 to-blue-200/20 rounded-xl flex items-center justify-center mr-4">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-semibold block text-sm">
                              {game.title}
                            </span>
                            <span className="text-xs text-gray-300">
                              {game.description}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/contract"
                  onClick={handleLinkClick}
                  className="w-full text-white hover:text-purple-200 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-3">
                  <Mail size={20} />
                  <span>Contact</span>
                </Link>

                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="text-white hover:text-purple-200 w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-white/10 flex items-center space-x-3">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <Sun
                      size={20}
                      className={`absolute transition-all duration-500 transform ${
                        isDarkMode
                          ? "rotate-180 scale-0 opacity-0"
                          : "rotate-0 scale-100 opacity-100"
                      }`}
                    />
                    <Moon
                      size={20}
                      className={`absolute transition-all duration-500 transform ${
                        isDarkMode
                          ? "rotate-0 scale-100 opacity-100"
                          : "-rotate-180 scale-0 opacity-0"
                      }`}
                    />
                  </div>
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg group">
                  <span className="flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <Sparkles size={18} className="group-hover:animate-spin" />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
