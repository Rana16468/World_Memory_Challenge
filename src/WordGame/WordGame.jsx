

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function WordGame() {
  const [gameMode, setGameMode] = useState(null);
  const [players, setPlayers] = useState([
    { name: "Player 1", score: 0, level: "Beginner" },
    { name: "Player 2", score: 0, level: "Beginner" },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [wordHistory, setWordHistory] = useState([]);
  const [allUsedWords, setAllUsedWords] = useState(new Set()); // Track all words used across all games
  const [currentWord, setCurrentWord] = useState("");
  const [message, setMessage] = useState("Choose a game mode to start your IELTS journey!");
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(30);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalWordsLearned, setTotalWordsLearned] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [currentDefinition, setCurrentDefinition] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [gamePhase, setGamePhase] = useState("waiting"); // waiting, playing, paused
  const [apiError, setApiError] = useState("");
  const [wordValidationCache, setWordValidationCache] = useState({});
  const [lastSubmittedWord, setLastSubmittedWord] = useState("");
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const definitionTimeoutRef = useRef(null);

  const gameModes = [
    {
      id: 'ielts_vocabulary',
      name: 'IELTS Vocabulary Builder',
      description: 'Build academic vocabulary with IELTS-focused words',
      icon: '📚',
      color: 'from-emerald-500 to-teal-500',
      timeLimit: 45,
      minLength: 4,
      ieltsSpecific: true
    },
    {
      id: 'academic_shiritori',
      name: 'Academic Shiritori',
      description: 'Traditional shiritori with academic vocabulary focus',
      icon: '🎓',
      color: 'from-purple-500 to-pink-500',
      timeLimit: 35,
      minLength: 5,
      ieltsSpecific: true
    },
    {
      id: 'topic_master',
      name: 'IELTS Topic Master',
      description: 'Master words from common IELTS topics',
      icon: '🌟',
      color: 'from-blue-500 to-cyan-500',
      timeLimit: 40,
      minLength: 4,
      ieltsSpecific: true
    },
    {
      id: 'synonym_challenge',
      name: 'Synonym Challenge',
      description: 'Find synonyms to expand your vocabulary range',
      icon: '🔄',
      color: 'from-orange-500 to-red-500',
      timeLimit: 30,
      minLength: 3,
      ieltsSpecific: true
    }
  ];

  const ieltsTopics = [
    'Environment', 'Technology', 'Education', 'Health', 'Travel', 'Work', 
    'Culture', 'Science', 'Society', 'Media', 'Economy', 'Politics'
  ];
  
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicWords, setTopicWords] = useState([]);

  // Enhanced topic-specific word banks for IELTS
  const topicWordBanks = {
    'Environment': ['pollution', 'sustainability', 'conservation', 'biodiversity', 'ecosystem', 'renewable', 'emissions', 'deforestation', 'climate', 'recycling', 'contamination', 'preservation', 'degradation', 'restoration'],
    'Technology': ['innovation', 'artificial', 'digital', 'automation', 'advancement', 'cybersecurity', 'algorithm', 'interface', 'networking', 'breakthrough', 'programming', 'computing', 'electronics', 'software'],
    'Education': ['curriculum', 'pedagogy', 'assessment', 'academic', 'scholarship', 'methodology', 'literacy', 'competency', 'qualification', 'institution', 'learning', 'teaching', 'knowledge', 'development'],
    'Health': ['wellness', 'prevention', 'treatment', 'diagnosis', 'therapy', 'nutrition', 'fitness', 'immunity', 'healthcare', 'medicine', 'recovery', 'rehabilitation', 'symptoms', 'healing'],
    'Travel': ['destination', 'accommodation', 'itinerary', 'transportation', 'tourism', 'exploration', 'cultural', 'adventure', 'hospitality', 'journey', 'vacation', 'expedition', 'sightseeing', 'wandering'],
    'Work': ['employment', 'productivity', 'collaboration', 'management', 'leadership', 'entrepreneurship', 'efficiency', 'professional', 'career', 'workplace', 'organization', 'responsibility', 'achievement', 'development'],
    'Culture': ['tradition', 'heritage', 'customs', 'diversity', 'celebration', 'identity', 'community', 'values', 'beliefs', 'ceremony', 'festival', 'language', 'art', 'music'],
    'Science': ['research', 'experiment', 'hypothesis', 'discovery', 'analysis', 'observation', 'theory', 'evidence', 'investigation', 'conclusion', 'methodology', 'laboratory', 'scientific', 'physics'],
    'Society': ['community', 'population', 'democracy', 'citizenship', 'equality', 'justice', 'welfare', 'development', 'civilization', 'progress', 'humanity', 'cooperation', 'responsibility', 'freedom'],
    'Media': ['journalism', 'broadcasting', 'communication', 'information', 'entertainment', 'publication', 'advertisement', 'television', 'newspaper', 'magazine', 'digital', 'social', 'network', 'platform'],
    'Economy': ['finance', 'business', 'investment', 'commerce', 'trade', 'market', 'economic', 'industry', 'manufacturing', 'service', 'competition', 'profit', 'revenue', 'growth'],
    'Politics': ['government', 'democracy', 'election', 'policy', 'legislation', 'parliament', 'administration', 'authority', 'leadership', 'governance', 'citizen', 'voting', 'representation', 'constitution']
  };

  const difficultyLevels = {
    'beginner': { timeLimit: 60, minLength: 3, bonusMultiplier: 1 },
    'intermediate': { timeLimit: 45, minLength: 4, bonusMultiplier: 1.5 },
    'advanced': { timeLimit: 30, minLength: 5, bonusMultiplier: 2 }
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setGameStarted(true);
    setGamePhase("playing");
    setApiError("");
    const difficultySettings = difficultyLevels[difficulty];
    setTime(difficultySettings.timeLimit);
    
    if (mode.id === 'topic_master') {
      const randomTopic = ieltsTopics[Math.floor(Math.random() * ieltsTopics.length)];
      setSelectedTopic(randomTopic);
      setTopicWords(topicWordBanks[randomTopic] || []);
      setMessage(`🎯 Topic: ${randomTopic}. ${players[currentPlayerIndex].name}, show your expertise!`);
    } else {
      setMessage(`🚀 ${players[currentPlayerIndex].name}, let's boost your IELTS vocabulary!`);
    }
    
    startTimer(difficultySettings.timeLimit);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const startTimer = (timeLimit = 30) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTime(timeLimit);
    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          handleTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setGamePhase("paused");
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].score = Math.max(0, updatedPlayers[currentPlayerIndex].score - 1);
    setPlayers(updatedPlayers);
    setStreak(0);
    setMessage(`⏰ Time's up! ${players[currentPlayerIndex].name} loses a point. Keep practicing!`);
    setTimeout(() => {
      if (gameStarted) {
        nextTurn();
      }
    }, 2000);
  };

  const validateWord = async (word) => {
    // Check cache first
    if (wordValidationCache[word]) {
      return wordValidationCache[word];
    }

    try {
      setIsLoading(true);
      setApiError("");
      
      const response = await fetch(
        `${import.meta.env.VITE_DICTIONARY_API_URL}/${word}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data[0] && data[0].meanings && data[0].meanings.length > 0) {
        const definition = data[0].meanings[0]?.definitions[0]?.definition || "No definition available";
        const result = { valid: true, definition };
        
        // Cache the result
        setWordValidationCache(prev => ({ ...prev, [word]: result }));
        
        return result;
      } else {
        const result = { valid: false, definition: "" };
        setWordValidationCache(prev => ({ ...prev, [word]: result }));
        return result;
      }
    } catch (error) {
      console.error('API Error:', error);
      setApiError("Dictionary service temporarily unavailable. Word accepted for now.");
      
      // Fallback validation - accept words that are reasonable length and alphabetic
      const fallbackResult = {
        valid: word.length >= 3 && /^[a-zA-Z]+$/.test(word),
        definition: "Definition unavailable (service error)"
      };
      
      return fallbackResult;
    } finally {
      setIsLoading(false);
    }
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % 2);
    setCurrentWord("");
    setLastSubmittedWord("");
    const difficultySettings = difficultyLevels[difficulty];
    setGamePhase("playing");
    startTimer(difficultySettings.timeLimit);
    setShowDefinition(false);
    if (definitionTimeoutRef.current) {
      clearTimeout(definitionTimeoutRef.current);
    }
  };

  const calculateWordScore = (word) => {
    const baseScore = 1;
    const lengthBonus = Math.max(0, word.length - 4) * 0.5;
    const difficultyBonus = difficultyLevels[difficulty].bonusMultiplier;
    const streakBonus = streak > 0 ? streak * 0.2 : 0;
    
    return Math.round((baseScore + lengthBonus + streakBonus) * difficultyBonus);
  };

  const updatePlayerLevel = (player) => {
    if (player.score >= 20) return "Advanced";
    if (player.score >= 10) return "Intermediate";
    return "Beginner";
  };

  // Enhanced duplicate checking function
  const isWordAlreadyUsed = (word) => {
    const normalizedWord = word.toLowerCase().trim();
    
    // Check if word is in current game's word history
    const inCurrentGame = wordHistory.some(w => w.toLowerCase() === normalizedWord);
    
    // Check if word is in the global set of all used words
    const inAllUsedWords = allUsedWords.has(normalizedWord);
    
    // Check if it's the same as the last submitted word
    const sameAsLastSubmitted = lastSubmittedWord.toLowerCase() === normalizedWord;
    
    return {
      isDuplicate: inCurrentGame || inAllUsedWords || sameAsLastSubmitted,
      reason: inCurrentGame ? "This word was already used in the current game" :
              inAllUsedWords ? "This word was used in a previous game session" :
              sameAsLastSubmitted ? "You just submitted this word" :
              ""
    };
  };

  const isValidWord = (word) => {
    if (!word || word.length < difficultyLevels[difficulty].minLength) {
      return { valid: false, reason: `Word must be at least ${difficultyLevels[difficulty].minLength} letters for ${difficulty} level` };
    }

    if (!/^[a-zA-Z]+$/.test(word)) {
      return { valid: false, reason: "Word must contain only letters (no numbers or special characters)" };
    }

    // Enhanced duplicate checking
    const duplicateCheck = isWordAlreadyUsed(word);
    if (duplicateCheck.isDuplicate) {
      return { valid: false, reason: `❌ ${duplicateCheck.reason}. Try a different word!` };
    }

    if (wordHistory.length > 0) {
      const lastWord = wordHistory[wordHistory.length - 1];
      
      switch (gameMode.id) {
        case 'academic_shiritori':
          // eslint-disable-next-line no-case-declarations
          const lastLetter = lastWord.charAt(lastWord.length - 1);
          if (word.charAt(0).toLowerCase() !== lastLetter.toLowerCase()) {
            return {
              valid: false,
              reason: `Word must start with "${lastLetter.toUpperCase()}" for academic shiritori`
            };
          }
          break;
        case 'topic_master':
          // More flexible topic matching
          // eslint-disable-next-line no-case-declarations
          const topicWordsLower = topicWords.map(w => w.toLowerCase());
          if (topicWordsLower.length > 0) {
            const isTopicRelated = topicWordsLower.some(tw => 
              word.toLowerCase().includes(tw) || 
              tw.includes(word.toLowerCase()) ||
              word.toLowerCase().startsWith(tw.substring(0, 3)) ||
              tw.startsWith(word.toLowerCase().substring(0, 3))
            );
            if (!isTopicRelated && word.length > 5) {
              // Give a hint but don't reject completely
              break;
            }
          }
          break;
        case 'synonym_challenge':
          // In a real implementation, you'd check synonyms via API
          break;
      }
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!currentWord.trim() || isLoading || gamePhase !== "playing") return;
    
    const word = currentWord.trim().toLowerCase();
    const validation = isValidWord(word);
    
    if (!validation.valid) {
      setMessage(`❌ ${validation.reason}`);
      setStreak(0);
      setCurrentWord("");
      return;
    }

    setLastSubmittedWord(word);
    const wordValidation = await validateWord(word);
    
    if (wordValidation.valid) {
      // Add word to current game history
      setWordHistory(prev => [...prev, word]);
      
      // Add word to global set of all used words
      setAllUsedWords(prev => new Set([...prev, word]));
      
      const wordScore = calculateWordScore(word);
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].score += wordScore;
      updatedPlayers[currentPlayerIndex].level = updatePlayerLevel(updatedPlayers[currentPlayerIndex]);
      setPlayers(updatedPlayers);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      setTotalWordsLearned(prev => prev + 1);
      
      setMessage(`🎉 Excellent! "${word}" earned ${wordScore} points! Streak: ${newStreak}`);
      setCurrentDefinition(wordValidation.definition);
      setShowDefinition(true);
      
      // Auto-hide definition after 4 seconds
      if (definitionTimeoutRef.current) {
        clearTimeout(definitionTimeoutRef.current);
      }
      definitionTimeoutRef.current = setTimeout(() => {
        setShowDefinition(false);
      }, 4000);
      
      setTimeout(() => {
        if (gameStarted) {
          nextTurn();
        }
      }, 1500);
    } else {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].score = Math.max(0, updatedPlayers[currentPlayerIndex].score - 1);
      setPlayers(updatedPlayers);
      setStreak(0);
      setMessage(`❌ "${word}" is not a valid English word. Keep trying!`);
      setCurrentWord("");
      setTimeout(() => {
        if (gameStarted) {
          nextTurn();
        }
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (definitionTimeoutRef.current) {
        clearTimeout(definitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameStarted && gameMode && gamePhase === "playing") {
      const playerName = players[currentPlayerIndex].name;
      if (gameMode.id === 'topic_master') {
        setMessage(`🎯 Topic: ${selectedTopic}. ${playerName}, your turn to shine!`);
      } else {
        setMessage(`🚀 ${playerName}, boost your IELTS vocabulary!`);
      }
    }
  }, [currentPlayerIndex, gameStarted, players, gameMode, selectedTopic, gamePhase]);

  const getHint = () => {
    if (wordHistory.length === 0) {
      switch (gameMode?.id) {
        case 'academic_shiritori':
          return "Enter any academic word to start";
        case 'topic_master':
          return `Enter a word related to ${selectedTopic}`;
        case 'synonym_challenge':
          return "Enter any word to start";
        case 'ielts_vocabulary':
          return "Enter any IELTS-level word";
        default:
          return "Enter a word";
      }
    }
    
    const lastWord = wordHistory[wordHistory.length - 1];
    switch (gameMode?.id) {
      case 'academic_shiritori':
        // eslint-disable-next-line no-case-declarations
        const lastLetter = lastWord.charAt(lastWord.length - 1).toUpperCase();
        return `Academic word starting with "${lastLetter}"`;
      case 'topic_master':
        return `Another word related to ${selectedTopic}`;
      case 'synonym_challenge':
        return `A synonym or related word to "${lastWord}"`;
      case 'ielts_vocabulary':
        return "Another IELTS-level vocabulary word";
      default:
        return "Enter a word";
    }
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (definitionTimeoutRef.current) {
      clearTimeout(definitionTimeoutRef.current);
    }
    setPlayers([
      { name: "Player 1", score: 0, level: "Beginner" },
      { name: "Player 2", score: 0, level: "Beginner" },
    ]);
    setCurrentPlayerIndex(0);
    setWordHistory([]);
    setCurrentWord("");
    setLastSubmittedWord("");
    setMessage("Choose a game mode to start your IELTS journey!");
    setGameStarted(false);
    setGameMode(null);
    setSelectedTopic('');
    setTopicWords([]);
    setStreak(0);
    setTime(30);
    setShowDefinition(false);
    setCurrentDefinition("");
    setGamePhase("waiting");
    setApiError("");
    setIsLoading(false);
    // Note: We don't reset allUsedWords here to maintain cross-game duplicate prevention
  };

  // New function to clear all used words history
  const clearAllWordHistory = () => {
    setAllUsedWords(new Set());
    setMessage("✨ All word history cleared! You can now reuse previously used words.");
  };



  

  const getTimerColor = () => {
    if (time <= 10) return 'from-red-500 to-pink-500';
    if (time <= 20) return 'from-orange-500 to-yellow-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStreakEmoji = () => {
    if (streak >= 10) return '🔥🔥🔥';
    if (streak >= 5) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '';
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-2">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
              🎓 IELTS Word Master
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-4">
              Boost your IELTS vocabulary with engaging word games!
            </p>
            
            {/* Compact Stats Display */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">{totalWordsLearned}</div>
                <div className="text-xs text-gray-300">Words Learned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-green-400">{bestStreak}</div>
                <div className="text-xs text-gray-300">Best Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-red-400">{allUsedWords.size}</div>
                <div className="text-xs text-gray-300">Total Used</div>
              </div>
            </div>

            {/* Word History Management */}
            {allUsedWords.size > 0 && (
              <div className="mb-6">
                <button
                  onClick={clearAllWordHistory}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  🗑️ Clear All Word History ({allUsedWords.size} words)
                </button>
              </div>
            )}

            {/* Compact Difficulty Selection */}
            <div className="mb-6">
              <h3 className="text-lg text-white mb-3">Select Difficulty Level</h3>
              <div className="flex justify-center gap-3 flex-wrap">
                {Object.keys(difficultyLevels).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm ${
                      difficulty === level
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:rotate-1"
                onClick={() => startGame(mode)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                <div className="relative p-4 text-center">
                  <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {mode.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{mode.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">{mode.description}</p>
                  <div className="flex justify-between text-xs text-gray-400 bg-white/5 rounded-lg p-2">
                    <span>⏱️ {difficultyLevels[difficulty].timeLimit}s</span>
                    <span>📝 {difficultyLevels[difficulty].minLength}+</span>
                    <span>🎯 IELTS</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  IELTS
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">🎯 Choose your challenge and start improving your IELTS vocabulary!</p>
            <p className="text-gray-500 text-xs mt-2">📝 Duplicate words are not allowed across all game sessions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-2">
      <div className="max-w-5xl mx-auto">

        {/* Compact Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 mb-3 overflow-hidden shadow-xl ring-1 ring-white/10">
          <div className={`bg-gradient-to-r ${gameMode.color} p-4 text-center relative`}>
            <div className="absolute top-2 left-3 text-white/70 text-xs">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
            <div className="absolute top-2 right-3 text-white/70 text-xs">
              {gamePhase.charAt(0).toUpperCase() + gamePhase.slice(1)}
            </div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl transform animate-bounce">{gameMode.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-white">{gameMode.name}</h1>
                <p className="text-white/90 text-sm">{gameMode.description}</p>
              </div>
            </div>
            {gameMode.id === 'topic_master' && selectedTopic && (
              <div className="mt-2 inline-block bg-white/20 rounded-full px-4 py-1 animate-pulse shadow">
                <span className="text-white font-semibold text-sm">🎯 {selectedTopic}</span>
              </div>
            )}
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3 mb-3 text-center shadow-lg">
            <p className="text-yellow-300 text-sm">⚠️ {apiError}</p>
          </div>
        )}

        {/* Compact Game Statistics */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center shadow-md hover:shadow-xl transition ring-1 ring-white/10">
            <div className="text-lg font-bold text-yellow-400">{streak} {getStreakEmoji()}</div>
            <div className="text-xs text-gray-300">Streak</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center shadow-md hover:shadow-xl transition ring-1 ring-white/10">
            <div className="text-lg font-bold text-green-400">{bestStreak}</div>
            <div className="text-xs text-gray-300">Best</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center shadow-md hover:shadow-xl transition ring-1 ring-white/10">
            <div className="text-lg font-bold text-blue-400">{totalWordsLearned}</div>
            <div className="text-xs text-gray-300">Learned</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center shadow-md hover:shadow-xl transition ring-1 ring-white/10">
            <div className="text-lg font-bold text-purple-400">{wordHistory.length}</div>
            <div className="text-xs text-gray-300">Round</div>
          </div>
        </div>

        {/* Compact Game Board */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 mb-3 shadow-xl ring-1 ring-white/10">

          {/* Compact Players */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {players.map((player, index) => (
              <div
                key={index}
                className={`relative rounded-xl p-4 transition-all duration-300 ${
                  currentPlayerIndex === index
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400 transform scale-105 shadow-lg'
                    : 'bg-white/5 border border-white/10 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                      {player.level}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">{player.score}</div>
                  {currentPlayerIndex === index && (
                    <div className="space-y-2">
                      <div className="bg-white/10 rounded-full p-0.5">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getTimerColor()} transition-all duration-300`}
                          style={{ width: `${(time / difficultyLevels[difficulty].timeLimit) * 100}%` }}
                        />
                      </div>
                      <div className="text-white font-bold text-sm">{time}s</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Compact Status Message */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-4 text-center border border-blue-400/30 shadow-md">
            <p className="text-white text-lg font-medium">{message}</p>
          </div>

          {/* Compact Definition Display */}
          {showDefinition && currentDefinition && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 mb-4 border border-green-400/30 shadow-md">
              <h4 className="text-green-400 font-semibold mb-2 text-sm">📖 Definition:</h4>
              <p className="text-white text-sm">{currentDefinition}</p>
            </div>
          )}

          {/* Compact Input */}
          <div className="mb-4">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-inner"
                placeholder={getHint()}
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Submit ✨'
                )}
              </button>
            </div>
          </div>

          {/* Compact Word History */}
          <div className="mb-4">
  <h3 className="text-lg font-semibold text-white mb-3">📝 Vocabulary Journey</h3>
  {wordHistory.length === 0 ? (
    <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400 shadow">
      <div className="text-2xl mb-1">🎯</div>
      <p className="text-sm">Ready to start building vocabulary?</p>
    </div>
  ) : (
    <div className="bg-white/5 rounded-xl p-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400/40 shadow-inner ring-1 ring-white/10">
      <div className="flex flex-wrap gap-2">
        {wordHistory.map((word, index) => (
          <span
            key={index}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-white font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer text-sm flex items-center gap-2"
            title={`Word #${index + 1}`}
          >
            {word}
            <Link to={`/dictionary_details/${word}`} className="bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-0.5 rounded-md font-semibold transition duration-200 ring-1 ring-white/10">
              Details
            </Link>
          </span>
        ))}
      </div>
    </div>
  )}
</div>


          {/* Compact Control Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={resetGame}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md ring-1 ring-red-500/10 text-sm"
            >
              🔄 New Game
            </button>
            <button
              onClick={() => setShowDefinition(!showDefinition)}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md ring-1 ring-blue-500/10 text-sm"
            >
              📖 {showDefinition ? 'Hide' : 'Show'} Definition
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}

export default WordGame;