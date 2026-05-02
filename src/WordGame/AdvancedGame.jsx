// AdvancedGame

import { useEffect, useRef, useState } from "react";

function AdvancedGame() {
  const [players, setPlayers] = useState([
    { name: "Player 1", score: 0, streak: 0, powerUps: 0, avatar: "🎮" },
    { name: "Player 2", score: 0, streak: 0, powerUps: 0, avatar: "🎯" },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [wordHistory, setWordHistory] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [message, setMessage] = useState("Player 1's turn - Enter a word to start!");
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [time, setTime] = useState(30);
  const [difficulty, setDifficulty] = useState("medium");
  const [gameMode, setGameMode] = useState("classic");
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(10);
  const [gameEnded, setGameEnded] = useState(false);
  const [powerUpActive, setPowerUpActive] = useState(null);
  const [lastWordMeaning, setLastWordMeaning] = useState("");
  const [challengeMode, setChallengeMode] = useState(null);
  const [bannedLetters, setBannedLetters] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [showParticles, setShowParticles] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalWordsPlayed: 0,
    longestWord: "",
    fastestWord: null,
    averageWordLength: 0
  });

  
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);

  const difficultySettings = {
    easy: { time: 45, minLength: 3, scoreMultiplier: 1 },
    medium: { time: 30, minLength: 4, scoreMultiplier: 1.5 },
    hard: { time: 20, minLength: 5, scoreMultiplier: 2 },
    expert: { time: 15, minLength: 6, scoreMultiplier: 3 }
  };



  const challengeModes = [
    "No vowels allowed",
    "Only compound words",
    "Words must be animals",
    "Words must be foods",
    "Words must be places"
  ];

  const powerUps = [
    { name: "Time Freeze", icon: "❄️", description: "Freeze timer for 10 seconds" },
    { name: "Skip Turn", icon: "⏭️", description: "Skip opponent's turn" },
    { name: "Double Points", icon: "⭐", description: "Next word gives double points" },
    { name: "Hint", icon: "💡", description: "Get a word suggestion" },
    { name: "Steal Point", icon: "🎯", description: "Steal a point from opponent" }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setRound(1);
    startTimer();
    startTimeRef.current = Date.now();
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Set challenge mode for hard/expert difficulty
    if (difficulty === "hard" || difficulty === "expert") {
      const randomChallenge = challengeModes[Math.floor(Math.random() * challengeModes.length)];
      setChallengeMode(randomChallenge);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    const timeLimit = difficultySettings[difficulty].time;
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
    clearInterval(timerRef.current);
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].score -= 2;
    updatedPlayers[currentPlayerIndex].streak = 0;
    setPlayers(updatedPlayers);
    setMessage(`⏰ Time's up! ${players[currentPlayerIndex].name} loses 2 points!`);
    triggerParticles();
    nextTurn();
  };

  const validateWord = async (word) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        // Extract word meaning for display
        const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || "No definition available";
        setLastWordMeaning(meaning);
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
        console.log(error);
      setLoading(false);
      return false;
    }
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % 2);
    setCurrentWord("");
    
    // Check if round is complete
    if (currentPlayerIndex === 1) {
      setRound(prev => prev + 1);
      if (round >= maxRounds) {
        endGame();
        return;
      }
    }
    
    startTimer();
    setMessage(`${players[(currentPlayerIndex + 1) % 2].name}'s turn!`);
  };

  const isValidShiritorWord = (word) => {
    const minLength = difficultySettings[difficulty].minLength;
    
    if (word.length < minLength) {
      return { valid: false, reason: `Word must be at least ${minLength} letters` };
    }

    if (wordHistory.includes(word.toLowerCase())) {
      return { valid: false, reason: "This word was already used!" };
    }

    // Check banned letters
    if (bannedLetters.some(letter => word.toLowerCase().includes(letter))) {
      return { valid: false, reason: "Word contains banned letters!" };
    }

    // Challenge mode validations
    if (challengeMode === "No vowels allowed") {
      if (/[aeiou]/i.test(word)) {
        return { valid: false, reason: "No vowels allowed in this challenge!" };
      }
    }

    if (challengeMode === "Only compound words") {
      if (word.length < 8) {
        return { valid: false, reason: "Word must be a compound word (8+ letters)!" };
      }
    }

    if (wordHistory.length > 0) {
      const lastWord = wordHistory[wordHistory.length - 1];
      const lastLetter = lastWord.charAt(lastWord.length - 1);
      const expectedLetter = gameMode === "reverse" ? lastWord.charAt(0) : lastLetter;
      
      if (word.charAt(0).toLowerCase() !== expectedLetter.toLowerCase()) {
        return {
          valid: false,
          reason: `Word must start with "${expectedLetter.toUpperCase()}"`
        };
      }
    }

    return { valid: true };
  };

  const calculateScore = (word) => {
    let baseScore = word.length;
    const multiplierValue = difficultySettings[difficulty].scoreMultiplier;
    
    // Bonus for long words
    if (word.length >= 8) baseScore += 5;
    if (word.length >= 12) baseScore += 10;
    
    // Streak bonus
    const streakBonus = Math.floor(players[currentPlayerIndex].streak / 3);
    
    return Math.floor((baseScore + streakBonus) * multiplierValue * multiplier);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWord.trim()) return;

    const word = currentWord.trim().toLowerCase();
    const validation = isValidShiritorWord(word);
    
    if (!validation.valid) {
      setMessage(`❌ ${validation.reason}`);
      return;
    }

    const isRealWord = await validateWord(word);
    const updatedPlayers = [...players];
    const wordTime = Date.now() - startTimeRef.current;
    
    if (isRealWord) {
      const score = calculateScore(word);
      updatedPlayers[currentPlayerIndex].score += score;
      updatedPlayers[currentPlayerIndex].streak += 1;
      
      // Award power-ups for streaks
      if (updatedPlayers[currentPlayerIndex].streak % 3 === 0) {
        updatedPlayers[currentPlayerIndex].powerUps += 1;
      }
      
      setWordHistory([...wordHistory, word]);
      setPlayers(updatedPlayers);
      setMessage(`🎉 Great word! +${score} points!`);
      
      // Update game stats
      setGameStats(prev => ({
        ...prev,
        totalWordsPlayed: prev.totalWordsPlayed + 1,
        longestWord: word.length > prev.longestWord.length ? word : prev.longestWord,
        fastestWord: prev.fastestWord === null || wordTime < prev.fastestWord ? wordTime : prev.fastestWord
      }));
      
      triggerParticles();
      nextTurn();
    } else {
      updatedPlayers[currentPlayerIndex].score -= 3;
      updatedPlayers[currentPlayerIndex].streak = 0;
      setPlayers(updatedPlayers);
      setMessage(`❌ Invalid word! -3 points`);
      nextTurn();
    }
    
    startTimeRef.current = Date.now();
  };

  const usePowerUp = (powerUpName) => {
    const updatedPlayers = [...players];
    if (updatedPlayers[currentPlayerIndex].powerUps <= 0) return;
    
    updatedPlayers[currentPlayerIndex].powerUps -= 1;
    setPlayers(updatedPlayers);
    
    switch (powerUpName) {
      case "Time Freeze":
        clearInterval(timerRef.current);
        setPowerUpActive("Time Freeze");
        setTimeout(() => {
          setPowerUpActive(null);
          startTimer();
        }, 10000);
        break;
      case "Skip Turn":
        nextTurn();
        break;
      case "Double Points":
        setMultiplier(2);
        setPowerUpActive("Double Points");
        break;
      case "Hint":
        if (wordHistory.length > 0) {
          const lastWord = wordHistory[wordHistory.length - 1];
          const lastLetter = lastWord.charAt(lastWord.length - 1);
          setMessage(`💡 Hint: Try words starting with "${lastLetter.toUpperCase()}" like "${lastLetter}ample words"`);
        }
        break;
      case "Steal Point":
        {
            const opponent = (currentPlayerIndex + 1) % 2;
        if (updatedPlayers[opponent].score > 0) {
          updatedPlayers[opponent].score -= 1;
          updatedPlayers[currentPlayerIndex].score += 1;
          setPlayers(updatedPlayers);
        }
        }
        break;
    }
  };

  const triggerParticles = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    setGameEnded(true);
    setGameStarted(false);
    
    const winner = players[0].score > players[1].score ? players[0] : players[1];
    setMessage(`🏆 Game Over! ${winner.name} wins with ${winner.score} points!`);
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    setPlayers([
      { name: "Player 1", score: 0, streak: 0, powerUps: 0, avatar: "🎮" },
      { name: "Player 2", score: 0, streak: 0, powerUps: 0, avatar: "🎯" },
    ]);
    setCurrentPlayerIndex(0);
    setWordHistory([]);
    setCurrentWord("");
    setMessage("Player 1's turn - Enter a word to start!");
    setGameStarted(false);
    setGameEnded(false);
    setRound(1);
    setTime(30);
    setChallengeMode(null);
    setBannedLetters([]);
    setMultiplier(1);
    setPowerUpActive(null);
    setLastWordMeaning("");
    setGameStats({
      totalWordsPlayed: 0,
      longestWord: "",
      fastestWord: null,
      averageWordLength: 0
    });
  };

  const getHint = () => {
    if (wordHistory.length === 0) {
      return "Enter any word to start...";
    }
    const lastWord = wordHistory[wordHistory.length - 1];
    const targetLetter = gameMode === "reverse" ? lastWord.charAt(0) : lastWord.charAt(lastWord.length - 1);
    return `Next word must start with "${targetLetter.toUpperCase()}"`;
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      setMessage(`${players[currentPlayerIndex].name}'s turn!`);
    }
  }, [currentPlayerIndex, gameStarted, gameEnded, players]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 relative overflow-hidden">
      {/* Compact Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-48 h-48 bg-purple-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-48 h-48 bg-blue-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 500}ms`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {!gameStarted && !gameEnded ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                🎮 Ultimate Shiritori
              </h1>
              <p className="text-sm text-white/80">Advanced word-chaining game!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">⚙️ Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 mb-1 text-sm">Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="easy">🟢 Easy (45s, 3+ letters)</option>
                      <option value="medium">🟡 Medium (30s, 4+ letters)</option>
                      <option value="hard">🔴 Hard (20s, 5+ letters)</option>
                      <option value="expert">⚫ Expert (15s, 6+ letters)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-1 text-sm">Game Mode</label>
                    <select 
                      value={gameMode} 
                      onChange={(e) => setGameMode(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="classic">🎯 Classic Shiritori</option>
                      <option value="reverse">🔄 Reverse Chain</option>
                      <option value="powerup">⚡ Power-up Battle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-1 text-sm">Max Rounds</label>
                    <input 
                      type="number" 
                      value={maxRounds} 
                      onChange={(e) => setMaxRounds(Number(e.target.value))}
                      min="5" 
                      max="50"
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">🎯 Rules</h3>
                <ul className="text-white/80 space-y-1 text-xs">
                  <li>• Start with last letter of previous word</li>
                  <li>• Longer words = more points</li>
                  <li>• Build streaks for bonus points</li>
                  <li>• Earn power-ups every 3 correct words</li>
                  <li>• Invalid words lose 3 points</li>
                  <li>• Time out loses 2 points</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🚀 Start Game!
              </button>
            </div>
          </div>
        ) : gameEnded ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">🏆 Game Over!</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {players.map((player, index) => (
                <div key={index} className={`p-4 rounded-xl ${player.score === Math.max(...players.map(p => p.score)) ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400' : 'bg-white/5 border border-white/10'}`}>
                  <div className="text-2xl mb-1">{player.avatar}</div>
                  <h3 className="text-lg font-bold text-white">{player.name}</h3>
                  <p className="text-2xl font-bold text-purple-300">{player.score} pts</p>
                  <p className="text-white/60 text-sm">Streak: {player.streak}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white mb-2">📊 Stats</h3>
              <div className="grid grid-cols-3 gap-2 text-white/80 text-sm">
                <div>
                  <p className="font-semibold">Words</p>
                  <p className="text-lg text-purple-300">{gameStats.totalWordsPlayed}</p>
                </div>
                <div>
                  <p className="font-semibold">Longest</p>
                  <p className="text-lg text-purple-300">{gameStats.longestWord || "None"}</p>
                </div>
                <div>
                  <p className="font-semibold">Difficulty</p>
                  <p className="text-lg text-purple-300 capitalize">{difficulty}</p>
                </div>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
            >
              🔄 Play Again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Compact Header */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎮 Shiritori
                </h1>
                <div className="text-white/80 text-sm">Round {round}/{maxRounds}</div>
              </div>
              
              {(challengeMode || powerUpActive) && (
                <div className="mt-2 space-y-1">
                  {challengeMode && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2">
                      <p className="text-red-200 font-semibold text-xs">🔥 Challenge: {challengeMode}</p>
                    </div>
                  )}
                  {powerUpActive && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2">
                      <p className="text-yellow-200 font-semibold text-xs">⚡ Active: {powerUpActive}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compact Player Stats */}
            <div className="grid grid-cols-2 gap-3">
              {players.map((player, index) => (
                <div key={index} className={`bg-white/10 backdrop-blur-lg rounded-xl p-3 border ${currentPlayerIndex === index ? 'border-purple-400 shadow-lg shadow-purple-500/50' : 'border-white/20'} transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{player.name}</h3>
                        <p className="text-xs text-white/60">Streak: {player.streak}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-300">{player.score}</p>
                      <p className="text-xs text-white/60">⚡{player.powerUps}</p>
                    </div>
                  </div>
                  
                  {currentPlayerIndex === index && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-white/80">
                        <span>Time</span>
                        <span>{time}s</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${time <= 10 ? 'bg-red-500' : time <= 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{width: `${(time / difficultySettings[difficulty].time) * 100}%`}}
                        />
                      </div>
                    </div>
                  )}

                  {/* Compact Power-ups */}
                  {gameMode === "powerup" && player.powerUps > 0 && currentPlayerIndex === index && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {powerUps.slice(0, 3).map((powerUp, i) => (
                          <button
                            key={i}
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            onClick={() => usePowerUp(powerUp.name)}
                            className="px-2 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-white text-xs rounded-md transition-all duration-200"
                            title={powerUp.description}
                          >
                            {powerUp.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Compact Game Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">{message}</span>
                </div>
                <div className="text-white/60 text-xs">{getHint()}</div>
              </div>
              {lastWordMeaning && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-2 mt-2">
                  <p className="text-blue-200 text-xs"><strong>Meaning:</strong> {lastWordMeaning}</p>
                </div>
              )}
            </div>

            {/* Compact Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder={getHint()}
                  disabled={isLoading}
                  ref={inputRef}
                />
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Submit"}
                </button>
              </div>
            </div>

            {/* Compact Word History & Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                <h3 className="text-sm font-bold text-white mb-2">📚 History</h3>
                {wordHistory.length === 0 ? (
                  <p className="text-white/60 text-xs">No words yet</p>
                ) : (
                  <div className="max-h-20 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {wordHistory.slice(-6).map((word, index) => (
                        <div 
                          key={index} 
                          className="px-2 py-1 rounded bg-white/20 text-white text-xs"
                        >
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                <h3 className="text-sm font-bold text-white mb-2">📊 Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-white/60">Words</p>
                    <p className="text-sm font-bold text-purple-300">{gameStats.totalWordsPlayed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">Longest</p>
                    <p className="text-sm font-bold text-green-300">{gameStats.longestWord || "None"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">Multiplier</p>
                    <p className="text-sm font-bold text-yellow-300">{multiplier}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">Level</p>
                    <p className="text-sm font-bold text-red-300 capitalize">{difficulty}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Controls */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 text-sm"
              >
                🔄 Reset
              </button>
              <button
                onClick={endGame}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 text-sm"
              >
                🏁 End
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}

export default AdvancedGame;


