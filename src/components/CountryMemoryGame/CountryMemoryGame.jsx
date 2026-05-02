//  CountryMemoryGame

import React, { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Trophy,
  Timer,
  Star,
  Zap,
  Target,
  Crown,
  Sparkles,
  Heart,
  Shield,
  Eye,
  Shuffle,
  Flame,
  Gift,
  Volume2,
  VolumeX,
  Settings,
  Medal,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  Lightbulb,
  BookOpen,
  Globe,
  Clock,
  Users,
  Calendar,
  Home,
  X,
} from "lucide-react";

const CountryMemoryGame = () => {
  const [countries, setCountries] = useState([]);
  const [gameCards, setGameCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [particles, setParticles] = useState([]);
  const [perfectMatch, setPerfectMatch] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    bestTime: null,
    totalScore: 0,
    perfectGames: 0,
  });

  // New enhanced features
  const [powerUps, setPowerUps] = useState({
    peek: 3,
    shuffle: 2,
    freeze: 1,
    doubleScore: 2,
    extraLife: 1,
  });
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [lives, setLives] = useState(3);
  const [theme, setTheme] = useState("ocean");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentView, setCurrentView] = useState("game");
  const [leaderboard, setLeaderboard] = useState([]);
  const [hintCards, setHintCards] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState("classic");
  const [progressAnimation, setProgressAnimation] = useState(0);

  const difficultySettings = {
    easy: { pairs: 6, gridCols: 4, timeBonus: 50, maxTime: 300 },
    medium: { pairs: 8, gridCols: 4, timeBonus: 75, maxTime: 240 },
    hard: { pairs: 12, gridCols: 6, timeBonus: 100, maxTime: 180 },
    expert: { pairs: 16, gridCols: 6, timeBonus: 150, maxTime: 120 },
  };

  const themes = {
    ocean: {
      name: "Ocean Blue",
      gradient: "from-blue-400 via-blue-600 to-blue-800",
      cardGradient: "from-blue-500 to-cyan-600",
      accent: "blue-500",
      background: "from-blue-50 to-cyan-100",
    },
    sunset: {
      name: "Sunset Glow",
      gradient: "from-orange-400 via-pink-500 to-purple-600",
      cardGradient: "from-orange-500 to-pink-600",
      accent: "orange-500",
      background: "from-orange-50 to-pink-100",
    },
    forest: {
      name: "Forest Green",
      gradient: "from-green-400 via-emerald-500 to-green-700",
      cardGradient: "from-green-500 to-emerald-600",
      accent: "green-500",
      background: "from-green-50 to-emerald-100",
    },
    cosmic: {
      name: "Cosmic Purple",
      gradient: "from-purple-400 via-indigo-500 to-purple-700",
      cardGradient: "from-purple-500 to-indigo-600",
      accent: "purple-500",
      background: "from-purple-50 to-indigo-100",
    },
    royal: {
      name: "Royal Gold",
      gradient: "from-yellow-400 via-amber-500 to-yellow-600",
      cardGradient: "from-yellow-500 to-amber-600",
      accent: "yellow-500",
      background: "from-yellow-50 to-amber-100",
    },
  };

  const achievementsList = [
    {
      id: "first_win",
      name: "First Victory",
      description: "Complete your first game",
      icon: "🏆",
      points: 50,
      rarity: "common",
    },
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Win in under 60 seconds",
      icon: "⚡",
      points: 100,
      rarity: "rare",
    },
    {
      id: "perfect_memory",
      name: "Perfect Memory",
      description: "Win with no wrong moves",
      icon: "🧠",
      points: 150,
      rarity: "epic",
    },
    {
      id: "streak_master",
      name: "Streak Master",
      description: "Get a 10-match streak",
      icon: "🔥",
      points: 200,
      rarity: "legendary",
    },
    {
      id: "score_hunter",
      name: "Score Hunter",
      description: "Reach 2000 points",
      icon: "💎",
      points: 100,
      rarity: "rare",
    },
    {
      id: "expert_mode",
      name: "Expert Challenger",
      description: "Complete expert mode",
      icon: "👑",
      points: 250,
      rarity: "legendary",
    },
    {
      id: "power_user",
      name: "Power User",
      description: "Use 10 power-ups",
      icon: "⚡",
      points: 75,
      rarity: "uncommon",
    },
    {
      id: "survivor",
      name: "Survivor",
      description: "Win with only 1 life remaining",
      icon: "💀",
      points: 125,
      rarity: "epic",
    },
    {
      id: "globe_trotter",
      name: "Globe Trotter",
      description: "Match 100 countries",
      icon: "🌍",
      points: 200,
      rarity: "legendary",
    },
    {
      id: "daily_warrior",
      name: "Daily Warrior",
      description: "Complete 7 daily challenges",
      icon: "📅",
      points: 150,
      rarity: "epic",
    },
  ];

  const gameModes = {
    classic: { name: "Classic", description: "Standard memory game" },
    timed: { name: "Time Attack", description: "Race against the clock" },
    survival: { name: "Survival", description: "Limited lives challenge" },
    zen: { name: "Zen Mode", description: "Relaxed, no time pressure" },
  };

  // Enhanced timer with pause functionality
  useEffect(() => {
    let interval;
    if (gameStarted && !gameWon && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (
            gameMode === "timed" &&
            prev >= difficultySettings[difficulty].maxTime
          ) {
            handleGameOver();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [
    gameStarted,
    gameWon,
    isPaused,
    gameMode,
    difficulty,
    difficultySettings,
  ]);

  // Progress animation
  useEffect(() => {
    if (gameStarted) {
      const progress =
        (matchedPairs.length / difficultySettings[difficulty].pairs) * 100;
      setProgressAnimation(progress);
    }
  }, [matchedPairs, difficulty, gameStarted]);

  // Enhanced game completion
  useEffect(() => {
    if (
      matchedPairs.length === difficultySettings[difficulty].pairs &&
      gameStarted
    ) {
      completeGame();
    }
  }, [matchedPairs, difficulty, gameStarted]);

  // Particle cleanup
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setParticles([]);
    }, 3000);
    return () => clearTimeout(cleanup);
  }, [particles]);

  // Load data from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("countryMemoryStats");
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }

    const savedAchievements = localStorage.getItem("countryMemoryAchievements");
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    const savedLeaderboard = localStorage.getItem("countryMemoryLeaderboard");
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }

    const savedTheme = localStorage.getItem("countryMemoryTheme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleGameOver = () => {
    setGameWon(false);
    setGameStarted(false);
    setLives((prev) => Math.max(0, prev - 1));

    if (lives <= 1) {
      // Game over completely
      setLives(3);
      initializeGame();
    } else {
      // Continue with reduced lives
      setTimer(0);
      setFlippedCards([]);
    }
  };

  const completeGame = () => {
    setGameWon(true);
    setGameStarted(false);
    setIsPaused(false);

    // Enhanced scoring system
    const timeBonus =
      Math.max(0, difficultySettings[difficulty].maxTime - timer) *
      difficultySettings[difficulty].timeBonus;
    const streakBonus = maxStreak * 100;
    const lifeBonus = lives * 200;
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2, expert: 3 }[
      difficulty
    ];
    const finalScore = Math.floor(
      (score + timeBonus + streakBonus + lifeBonus) * difficultyMultiplier
    );

    setScore(finalScore);

    // Check for perfect game
    const isPerfect = moves === difficultySettings[difficulty].pairs;
    setPerfectMatch(isPerfect);

    // Update enhanced stats
    const newStats = {
      ...gameStats,
      gamesPlayed: gameStats.gamesPlayed + 1,
      bestTime: gameStats.bestTime
        ? Math.min(gameStats.bestTime, timer)
        : timer,
      totalScore: gameStats.totalScore + finalScore,
      perfectGames: gameStats.perfectGames + (isPerfect ? 1 : 0),
    };
    setGameStats(newStats);
    localStorage.setItem("countryMemoryStats", JSON.stringify(newStats));

    // Update leaderboard
    const newEntry = {
      id: Date.now(),
      score: finalScore,
      time: timer,
      moves,
      difficulty,
      date: new Date().toISOString(),
      perfect: isPerfect,
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem(
      "countryMemoryLeaderboard",
      JSON.stringify(updatedLeaderboard)
    );

    // Check achievements
    checkAchievements(finalScore, timer, isPerfect);

    // Create enhanced celebration
    createCelebrationParticles();

    // Play sound effect (simulated)
    if (soundEnabled) {
      playSound("victory");
    }
  };

  const playSound = (type) => {
    // Simulated sound effects - in a real app, you'd use Web Audio API
    if (!soundEnabled) return;

    const sounds = {
      flip: "🔊",
      match: "✨",
      victory: "🎉",
      powerup: "⚡",
      error: "❌",
    };

    console.log(`Playing sound: ${sounds[type] || "🔊"}`);
  };

  const checkAchievements = (finalScore, gameTime, isPerfect) => {
    const newAchievements = [];

    if (gameStats.gamesPlayed === 0) {
      newAchievements.push("first_win");
    }
    if (gameTime < 60) {
      newAchievements.push("speed_demon");
    }
    if (isPerfect) {
      newAchievements.push("perfect_memory");
    }
    if (maxStreak >= 10) {
      newAchievements.push("streak_master");
    }
    if (finalScore >= 2000) {
      newAchievements.push("score_hunter");
    }
    if (difficulty === "expert") {
      newAchievements.push("expert_mode");
    }
    if (lives === 1) {
      newAchievements.push("survivor");
    }

    if (newAchievements.length > 0) {
      const updatedAchievements = [
        ...new Set([...achievements, ...newAchievements]),
      ];
      setAchievements(updatedAchievements);
      localStorage.setItem(
        "countryMemoryAchievements",
        JSON.stringify(updatedAchievements)
      );
    }
  };

  const createCelebrationParticles = () => {
    const colors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#F7DC6F",
      "#BB8FCE",
    ];
    const newParticles = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6,
        delay: Math.random() * 2000,
        duration: Math.random() * 3000 + 2000,
        type: Math.random() > 0.5 ? "circle" : "star",
      });
    }
    setParticles(newParticles);
  };

  const createMatchParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: "#FFD700",
        size: Math.random() * 8 + 4,
        delay: Math.random() * 500,
        duration: 1500,
        type: "sparkle",
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Enhanced fetch with more country data
  const fetchCountries = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,capital,flag,region,population,flags,area,languages,currencies,timezones"
      );

      if (response.ok) {
        const data = await response.json();
        const validCountries = data
          .filter(
            (country) =>
              country.name?.common &&
              country.capital &&
              country.capital.length > 0 &&
              country.region &&
              country.flags?.png
          )
          .map((country) => ({
            name: country.name.common,
            capital: Array.isArray(country.capital)
              ? country.capital[0]
              : country.capital,
            flag: country.flag || "🏳️",
            flagImage: country.flags?.png,
            region: country.region,
            population: country.population || 0,
            area: country.area || 0,
            languages: country.languages
              ? Object.values(country.languages).join(", ")
              : "",
            currencies: country.currencies
              ? Object.values(country.currencies)
                  .map((c) => c.name)
                  .join(", ")
              : "",
            timezone: country.timezones ? country.timezones[0] : "",
          }));

        if (validCountries.length > 0) {
          setCountries(validCountries);
        } else {
          throw new Error("No valid countries found");
        }
      } else {
        throw new Error("API request failed");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      // Enhanced fallback with more countries
      const fallbackCountries = [];
      setCountries(fallbackCountries);
    }
    setLoading(false);
  };

  // Enhanced game initialization
  const initializeGame = useCallback(() => {
    if (countries.length === 0) return;

    const pairCount = difficultySettings[difficulty].pairs;
    const selectedCountries = countries
      .sort(() => Math.random() - 0.5)
      .slice(0, pairCount);

    const cards = [];
    selectedCountries.forEach((country, index) => {
      cards.push({
        id: `flag-${index}`,
        type: "flag",
        content: {
          flag: country.flag,
          flagImage: country.flagImage,
          name: country.name,
        },
        country: country.name,
        matchId: index,
        isFlipped: false,
        isMatched: false,
        glowing: false,
      });

      cards.push({
        id: `info-${index}`,
        type: "info",
        content: {
          name: country.name,
          capital: country.capital,
          region: country.region,
          population: country.population,
          area: country.area,
          languages: country.languages,
          currencies: country.currencies,
          timezone: country.timezone,
        },
        country: country.name,
        matchId: index,
        isFlipped: false,
        isMatched: false,
        glowing: false,
      });
    });

    setGameCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameWon(false);
    setIsPaused(false);
    setStreak(0);
    setMaxStreak(0);
    setMultiplier(1);
    setCombo(0);
    setShowCombo(false);
    setParticles([]);
    setPerfectMatch(false);
    setActivePowerUp(null);
    setLives(gameMode === "survival" ? 3 : 999);
    setHintCards([]);
    setShowHint(false);
    setProgressAnimation(0);
  }, [countries, difficulty, gameMode]);

  // Enhanced power-up system
  const usePowerUp = (powerUpType) => {
    if (powerUps[powerUpType] <= 0) return;

    setPowerUps((prev) => ({
      ...prev,
      [powerUpType]: prev[powerUpType] - 1,
    }));

    switch (powerUpType) {
      case "peek":
        // Reveal all cards for 3 seconds
        setActivePowerUp("peek");
        setTimeout(() => setActivePowerUp(null), 3000);
        break;

      case "shuffle":
        // Shuffle all unmatched cards
        setGameCards((prev) => {
          const matched = prev.filter((card) =>
            matchedPairs.includes(card.matchId)
          );
          const unmatched = prev.filter(
            (card) => !matchedPairs.includes(card.matchId)
          );
          return [...matched, ...unmatched.sort(() => Math.random() - 0.5)];
        });
        break;

      case "freeze":
        // Freeze timer for 30 seconds
        setActivePowerUp("freeze");
        setTimeout(() => setActivePowerUp(null), 30000);
        break;

      case "doubleScore":
        // Double score for next 5 matches
        setActivePowerUp("doubleScore");
        // This will be handled in the scoring logic
        break;

      case "extraLife":
        // Add one life
        setLives((prev) => prev + 1);
        break;
    }

    playSound("powerup");
  };

  // Enhanced hint system
  const showHints = () => {
    if (hintCards.length === 0) {
      const unmatchedCards = gameCards.filter(
        (card) => !matchedPairs.includes(card.matchId)
      );
      const randomPair = unmatchedCards.reduce((acc, card) => {
        if (!acc[card.matchId]) acc[card.matchId] = [];
        acc[card.matchId].push(card);
        return acc;
      }, {});

      const pairArray = Object.values(randomPair).find(
        (pair) => pair.length === 2
      );
      if (pairArray) {
        setHintCards(pairArray.map((card) => card.id));
        setShowHint(true);
        setTimeout(() => {
          setShowHint(false);
          setHintCards([]);
        }, 2000);
      }
    }
  };

  // Enhanced card click handler
  const handleCardClick = (cardId) => {
    if (!gameStarted) setGameStarted(true);
    if (isPaused) return;

    const card = gameCards.find((c) => c.id === cardId);
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    playSound("flip");
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = gameCards.find((c) => c.id === firstId);
      const secondCard = gameCards.find((c) => c.id === secondId);

      if (
        firstCard.matchId === secondCard.matchId &&
        firstCard.type !== secondCard.type
      ) {
        // Match found!
        playSound("match");

        setTimeout(() => {
          setMatchedPairs((prev) => [...prev, firstCard.matchId]);

          // Enhanced scoring with power-up bonuses
          const newStreak = streak + 1;
          setStreak(newStreak);
          setMaxStreak((prev) => Math.max(prev, newStreak));

          if (newStreak >= 3) {
            setMultiplier(Math.min(10, Math.floor(newStreak / 2) + 1));
          }

          const baseScore = 100;
          const streakBonus = newStreak * 25;
          const powerUpMultiplier = activePowerUp === "doubleScore" ? 2 : 1;
          const bonusScore =
            (baseScore + streakBonus) * multiplier * powerUpMultiplier;

          setScore((prev) => prev + bonusScore);

          // Enhanced combo effects
          if (newStreak > 1) {
            setCombo(newStreak);
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 2000);
          }

          setFlippedCards([]);
          createMatchParticles();
        }, 1000);
      } else {
        // No match
        playSound("error");

        if (gameMode === "survival") {
          setLives((prev) => Math.max(0, prev - 1));
        }

        setTimeout(() => {
          setStreak(0);
          setMultiplier(1);
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  // Enhanced game control functions
  const startNewGame = () => {
    if (countries.length === 0) {
      fetchCountries();
    } else {
      initializeGame();
    }
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  //   const resetGame = () => {
  //     initializeGame();
  //   };

  // Initialize on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (countries.length > 0) {
      initializeGame();
    }
  }, [countries, difficulty, gameMode, initializeGame]);

  // Helper functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const isCardFlipped = (cardId) => {
    const card = gameCards.find((c) => c.id === cardId);
    return (
      flippedCards.includes(cardId) ||
      matchedPairs.includes(card?.matchId) ||
      activePowerUp === "peek" ||
      (showHint && hintCards.includes(cardId))
    );
  };

  const isCardMatched = (cardId) => {
    const card = gameCards.find((c) => c.id === cardId);
    return matchedPairs.includes(card?.matchId);
  };

  const getRankByScore = (score) => {
    if (score >= 5000)
      return {
        rank: "Legendary",
        color: "text-purple-600",
        icon: "👑",
        gradient: "from-purple-500 to-pink-500",
      };
    if (score >= 3000)
      return {
        rank: "Master",
        color: "text-yellow-600",
        icon: "🥇",
        gradient: "from-yellow-500 to-orange-500",
      };
    if (score >= 2000)
      return {
        rank: "Expert",
        color: "text-blue-600",
        icon: "🥈",
        gradient: "from-blue-500 to-cyan-500",
      };
    if (score >= 1000)
      return {
        rank: "Advanced",
        color: "text-green-600",
        icon: "🥉",
        gradient: "from-green-500 to-emerald-500",
      };
    if (score >= 500)
      return {
        rank: "Intermediate",
        color: "text-orange-600",
        icon: "🌟",
        gradient: "from-orange-500 to-red-500",
      };
    return {
      rank: "Beginner",
      color: "text-gray-600",
      icon: "🌱",
      gradient: "from-gray-500 to-gray-600",
    };
  };

  const currentTheme = themes[theme];

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${currentTheme.background} flex items-center justify-center`}>
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-16 w-16 border-4 border-${currentTheme.accent} border-t-transparent mx-auto mb-6`}></div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-700">
              Loading Countries...
            </p>
            <p className="text-sm text-gray-500">
              Preparing your geography challenge
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentTheme.background} p-4 relative overflow-hidden transition-all duration-500`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTheme.cardGradient} rounded-full opacity-10 animate-pulse`}></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br ${currentTheme.cardGradient} rounded-full opacity-10 animate-pulse`}
          style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Enhanced Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute pointer-events-none z-10 ${
            particle.type === "star" ? "animate-spin" : "animate-bounce"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: particle.type === "star" ? "0%" : "50%",
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
            clipPath:
              particle.type === "star"
                ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                : "none",
          }}
        />
      ))}

      {/* Enhanced Combo Display */}
      {showCombo && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div
            className={`bg-gradient-to-r ${currentTheme.cardGradient} text-white px-12 py-6 rounded-2xl text-3xl font-bold animate-pulse shadow-2xl border-4 border-white`}>
            <div className="flex items-center justify-center space-x-3">
              <Zap className="animate-spin" size={32} />
              <span>{combo}x COMBO!</span>
              <Flame className="animate-bounce" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <Pause size={48} className="mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <button
              onClick={pauseGame}
              className={`bg-gradient-to-r ${currentTheme.cardGradient} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all`}>
              Resume Game
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-8 max-w-xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
            <div
              className={`p-2 rounded-full bg-gradient-to-r ${currentTheme.cardGradient} text-white shadow-md`}>
              <Globe className="animate-spin" size={28} />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              World Memory Challenge
            </span>
          </h1>
          <p className="text-base text-gray-600 mx-auto">
            Test your geographic knowledge by matching countries with their
            flags, capitals, and facts!
          </p>
        </div>

        {/* Enhanced Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-w-md mx-auto mb-6">
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {["game", "leaderboard", "achievements", "settings"].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentView === view
                    ? `bg-gradient-to-r ${currentTheme.cardGradient} text-white shadow-md transform scale-105`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {currentView === "settings" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-4 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings size={20} />
              Game Settings
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-base font-semibold mb-3">Game Options</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="easy">Easy (6 pairs)</option>
                      <option value="medium">Medium (8 pairs)</option>
                      <option value="hard">Hard (12 pairs)</option>
                      <option value="expert">Expert (16 pairs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Game Mode
                    </label>
                    <select
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      {Object.entries(gameModes).map(([key, mode]) => (
                        <option key={key} value={key}>
                          {mode.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold mb-3">Preferences</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Theme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(themes).map(([key, themeData]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setTheme(key);
                            localStorage.setItem("countryMemoryTheme", key);
                          }}
                          className={`p-2 rounded-md border-2 text-sm transition-all ${
                            theme === key
                              ? `border-${themeData.accent} bg-gradient-to-r ${themeData.cardGradient} text-white`
                              : "border-gray-200 hover:border-gray-300"
                          }`}>
                          {themeData.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sound Effects</span>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-2 rounded-md ${
                        soundEnabled
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {soundEnabled ? (
                        <Volume2 size={18} />
                      ) : (
                        <VolumeX size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "leaderboard" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-4 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} />
              Leaderboard
            </h3>

            {leaderboard.length === 0 ? (
              <div className="text-center py-10">
                <Medal size={36} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  No games played yet. Start playing to see your scores!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-md border-2 text-sm ${
                      index === 0
                        ? "border-yellow-400 bg-yellow-50"
                        : index === 1
                        ? "border-silver-400 bg-gray-50"
                        : index === 2
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 bg-white"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-500"
                              : index === 2
                              ? "bg-orange-500"
                              : "bg-gray-400"
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">
                            {formatNumber(entry.score)} pts
                          </div>
                          <div className="text-xs text-gray-600">
                            {entry.difficulty} • {formatTime(entry.time)} •{" "}
                            {entry.moves} moves
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        {entry.perfect && (
                          <div className="text-xs text-green-600 font-medium">
                            Perfect!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "achievements" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-4 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award size={20} />
              Achievements
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              {achievementsList.map((achievement) => {
                const isUnlocked = achievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-md border-2 text-sm transition-all ${
                      isUnlocked
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-xl ${
                          isUnlocked ? "grayscale-0" : "grayscale"
                        }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            isUnlocked ? "text-green-800" : "text-gray-600"
                          }`}>
                          {achievement.name}
                        </h4>
                        <p
                          className={`text-xs ${
                            isUnlocked ? "text-green-600" : "text-gray-500"
                          }`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              achievement.rarity === "legendary"
                                ? "bg-purple-100 text-purple-700"
                                : achievement.rarity === "epic"
                                ? "bg-orange-100 text-orange-700"
                                : achievement.rarity === "rare"
                                ? "bg-blue-100 text-blue-700"
                                : achievement.rarity === "uncommon"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                            {achievement.rarity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {achievement.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game View */}
        {currentView === "game" && (
          <div className="max-w-4xl mx-auto text-xs">
            {/* Enhanced Game Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={gameStarted}>
                    <option value="easy">Easy (6 pairs)</option>
                    <option value="medium">Medium (8 pairs)</option>
                    <option value="hard">Hard (12 pairs)</option>
                    <option value="expert">Expert (16 pairs)</option>
                  </select>

                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={gameStarted}>
                    {Object.entries(gameModes).map(([key, mode]) => (
                      <option key={key} value={key}>
                        {mode.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1">
                    <button
                      onClick={startNewGame}
                      className={`bg-gradient-to-r ${currentTheme.cardGradient} hover:shadow-md text-white px-3 py-1 text-xs rounded transition-all flex items-center gap-1 hover:scale-105`}>
                      <RotateCcw size={14} />
                      New
                    </button>

                    {gameStarted && (
                      <button
                        onClick={pauseGame}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-xs rounded transition-all flex items-center gap-1">
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1">
                    <Timer size={14} className="text-gray-500" />
                    <span className="font-semibold">{formatTime(timer)}</span>
                    {gameMode === "timed" && (
                      <span className="text-red-500">
                        /{formatTime(difficultySettings[difficulty].maxTime)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Target size={14} className="text-gray-500" />
                    <span className="font-semibold">{moves}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    <span className="font-semibold">{formatNumber(score)}</span>
                  </div>

                  {streak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" />
                      <span className="font-semibold text-orange-600">
                        {streak}x
                      </span>
                    </div>
                  )}

                  {gameMode === "survival" && (
                    <div className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500" />
                      <span className="font-semibold text-red-600">
                        {lives}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {matchedPairs.length}/{difficultySettings[difficulty].pairs}{" "}
                    pairs
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${currentTheme.cardGradient} transition-all duration-500`}
                    style={{ width: `${progressAnimation}%` }}></div>
                </div>
              </div>
            </div>

            {/* Power-ups Panel */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-1">
                  <Zap size={16} />
                  Power-ups
                </h3>
                <button
                  onClick={showHints}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors text-xs flex items-center gap-1">
                  <Lightbulb size={14} />
                  Hint
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {Object.entries(powerUps).map(([key, count]) => (
                  <button
                    key={key}
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    onClick={() => usePowerUp(key)}
                    disabled={count <= 0 || !gameStarted}
                    className={`p-2 rounded border text-center text-[10px] transition-all ${
                      count > 0 && gameStarted
                        ? `border-${currentTheme.accent} hover:shadow hover:scale-105`
                        : "border-gray-200 opacity-50 cursor-not-allowed"
                    }`}>
                    <div>
                      <div className="text-base mb-1">
                        {key === "peek" && <Eye />}
                        {key === "shuffle" && <Shuffle />}
                        {key === "freeze" && <Clock />}
                        {key === "doubleScore" && <Star />}
                        {key === "extraLife" && <Heart />}
                      </div>
                      <div className="capitalize">{key}</div>
                      <div className="text-gray-500">{count}x</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Board */}
            <div
              className={`grid gap-px mb-3 ${
                difficulty === "expert" || difficulty === "hard"
                  ? "grid-cols-6"
                  : "grid-cols-4"
              }`}>
              {gameCards?.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`relative aspect-square cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:ring-1 hover:ring-indigo-300 rounded-md ${
                    isCardMatched(card.id) ? "opacity-75 scale-90" : ""
                  } ${isCardFlipped(card.id) ? "z-10" : ""} ${
                    showHint && hintCards.includes(card.id)
                      ? "ring-2 ring-yellow-400 ring-opacity-60"
                      : ""
                  }`}
                  style={{ maxWidth: "85px", maxHeight: "85px" }}>
                  <div
                    className={`absolute inset-0 transition-transform duration-500 ${
                      isCardFlipped(card.id)
                        ? "[transform:rotateY(180deg)]"
                        : ""
                    }`}
                    style={{ transformStyle: "preserve-3d" }}>
                    {/* Card Back */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${currentTheme.cardGradient} rounded-md shadow-sm border border-white/10 flex items-center justify-center`}
                      style={{ backfaceVisibility: "hidden" }}>
                      <div className="text-white text-base">
                        {card.type === "flag" ? (
                          <Globe size={16} />
                        ) : (
                          <BookOpen size={16} />
                        )}
                      </div>
                    </div>

                    {/* Card Front */}
                    <div
                      className={`absolute inset-0 rounded-md shadow-sm p-[2px] flex flex-col items-center justify-center text-center text-[9px] ${
                        isCardMatched(card.id)
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300"
                          : "bg-white border border-gray-200"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}>
                      {card.type === "flag" ? (
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src={card.content.flagImage}
                            alt={`Flag of ${card.country}`}
                            className="max-w-full max-h-[50%] object-contain rounded shadow-sm mb-0.5"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                          <div className="text-xs hidden">
                            {card.content.flag}
                          </div>
                          <div className="font-medium text-gray-700 mt-0.5 truncate max-w-full text-[10px]">
                            {card.content.name}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5 text-[9px] leading-tight">
                          <div className="font-bold text-gray-800 border-b pb-0.5 text-[10px] truncate">
                            {card.content.name}
                          </div>
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Home size={9} />
                            <span className="truncate">
                              {card.content.capital}
                            </span>
                          </div>
                          <div className="text-gray-600 truncate">
                            {card.content.region}
                          </div>
                          <div className="text-gray-500 truncate">
                            {formatNumber(card.content.population)} people
                          </div>
                          {card.content.languages && (
                            <div className="text-gray-400 truncate text-[8px]">
                              {card.content.languages
                                .split(", ")
                                .slice(0, 2)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {isCardMatched(card.id) && (
                        <div className="absolute top-0.5 right-0.5">
                          <Sparkles
                            className="text-green-500 animate-pulse"
                            size={12}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Game Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <TrendingUp size={16} />
                Game Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">
                    {gameStats.gamesPlayed}
                  </div>
                  <div className="text-gray-600">Games Played</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">
                    {gameStats.bestTime ? formatTime(gameStats.bestTime) : "-"}
                  </div>
                  <div className="text-gray-600">Best Time</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-600">
                    {formatNumber(gameStats.totalScore)}
                  </div>
                  <div className="text-gray-600">Total Score</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">
                    {gameStats.perfectGames}
                  </div>
                  <div className="text-gray-600">Perfect Games</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Game Won Modal */}
        {gameWon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-2 text-center relative overflow-hidden shadow-2xl text-xs">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentTheme.background} opacity-40`}></div>

              <div className="relative z-10">
                <div className="text-5xl mb-4 animate-bounce">
                  {perfectMatch ? "🏆" : "🎉"}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {perfectMatch ? "Perfect Game!" : "Victory!"}
                </h2>

                {perfectMatch && (
                  <div className="text-sm text-yellow-600 mb-4 flex items-center justify-center gap-1">
                    <Crown size={18} />
                    <span className="font-semibold">Flawless Victory!</span>
                  </div>
                )}

                <div className="space-y-3 mb-6 text-[11px]">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-1">
                      <Timer size={14} className="text-gray-500" />
                      <span className="text-gray-600">Time:</span>
                    </div>
                    <span className="font-semibold">{formatTime(timer)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-1">
                      <Target size={14} className="text-gray-500" />
                      <span className="text-gray-600">Moves:</span>
                    </div>
                    <span className="font-semibold">{moves}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-gray-600">Best Streak:</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      {maxStreak}x
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-md border border-blue-200">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-blue-500" />
                      <span className="font-semibold text-gray-800">
                        Final Score:
                      </span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {formatNumber(score)}
                    </span>
                  </div>
                </div>

                {/* Rank */}
                <div className="mb-4">
                  {(() => {
                    const rankInfo = getRankByScore(score);
                    return (
                      <div
                        className={`text-sm font-bold ${rankInfo.color} flex items-center justify-center gap-2 p-3 rounded-md bg-gradient-to-r ${rankInfo.gradient} text-white`}>
                        <span className="text-xl">{rankInfo.icon}</span>
                        <span>{rankInfo.rank}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* New Achievements */}
                {achievements?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      New Achievements:
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {achievements.slice(-3).map((achievementId) => {
                        const achievement = achievementsList.find(
                          (a) => a.id === achievementId
                        );
                        return achievement ? (
                          <div
                            key={achievementId}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow">
                            <span>{achievement.icon}</span>
                            <span>{achievement.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={startNewGame}
                    className={`flex-1 bg-gradient-to-r ${currentTheme.cardGradient} hover:shadow-md text-white px-4 py-2 rounded-md transition-all text-xs font-semibold flex items-center justify-center gap-1`}>
                    <Play size={14} />
                    Play Again
                  </button>

                  <button
                    onClick={() => setCurrentView("leaderboard")}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-all font-semibold text-xs flex items-center gap-1">
                    <Trophy size={14} />
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryMemoryGame;
