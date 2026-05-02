import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Trophy,
  Star,
  Globe,
  BookOpen,
  Target,
  RefreshCw,
  Heart,
  Award,
  Settings,
  Clock,
  Key,
  Zap,
} from "lucide-react";
import {
  codas,
  complexConsonants,
  consonants,
  diphthongs,
  englishBigrams,
  languages,
  letterFrequency,
  nuclei,
  onsets,
  patterns,
  prefixes,
  semanticFields,
  startLetters,
  suffixes,
  vowels,
} from "./utility/TranslationGameData";

const TranslationGame = () => {
  const [gameState, setGameState] = useState("menu"); // menu, settings, playing, paused, gameOver
  const [currentWord, setCurrentWord] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("it");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [timerActive, setTimerActive] = useState(false);
  const [currentQuestionInLevel, setCurrentQuestionInLevel] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedWords, setUsedWords] = useState(new Set());
  const [gameSettings, setGameSettings] = useState({
    timePerQuestion: 45,
    questionsPerLevel: 5,
    difficulty: "medium",
    livesCount: 3,
    useAlgorithmicGeneration: true,
    apiKeys: {
      wordsApi: "",
      wordnik: "",
      ninjas: "",
    },
  });

  const difficultySettings = {
    easy: { timePerQuestion: 60, questionsPerLevel: 3, livesCount: 5 },
    medium: { timePerQuestion: 45, questionsPerLevel: 5, livesCount: 3 },
    hard: { timePerQuestion: 30, questionsPerLevel: 7, livesCount: 2 },
  };

  // 🚀 DYNAMIC ROOT GENERATION ALGORITHMS
  const WordGenerationAlgorithms = {
    // Algorithm 1: Morphological Pattern Generation
    morphologicalGenerator: (level, difficulty) => {
      const pattern =
        patterns[difficulty][
          Math.floor(Math.random() * patterns[difficulty].length)
        ];
      let word = "";

      for (let char of pattern) {
        if (char === "C") {
          if (Math.random() < 0.3 && level > 2) {
            word +=
              complexConsonants[
                Math.floor(Math.random() * complexConsonants.length)
              ];
          } else {
            word += consonants[Math.floor(Math.random() * consonants.length)];
          }
        } else if (char === "V") {
          if (Math.random() < 0.25 && level > 3) {
            word += diphthongs[Math.floor(Math.random() * diphthongs.length)];
          } else {
            word += vowels[Math.floor(Math.random() * vowels.length)];
          }
        }
      }

      return word;
    },

    // Algorithm 2: Semantic Field Generator
    semanticFieldGenerator: (level) => {
      const fieldKeys = Object.keys(semanticFields);
      const selectedField =
        fieldKeys[Math.floor(Math.random() * fieldKeys.length)];
      const baseWord =
        semanticFields[selectedField][
          Math.floor(Math.random() * semanticFields[selectedField].length)
        ];

      let word = baseWord;

      // Add complexity based on level and difficulty
      if (level > 2 && Math.random() < 0.4) {
        word = prefixes[Math.floor(Math.random() * prefixes.length)] + word;
      }

      if (level > 1 && Math.random() < 0.5) {
        word = word + suffixes[Math.floor(Math.random() * suffixes.length)];
      }

      return word;
    },

    // Algorithm 3: Markov Chain Word Generator
    markovChainGenerator: (level) => {
      const minLength = Math.max(3, Math.min(4 + Math.floor(level / 2), 6));
      const maxLength = Math.max(6, Math.min(8 + Math.floor(level / 2), 12));
      const targetLength =
        minLength + Math.floor(Math.random() * (maxLength - minLength + 1));

      let word = startLetters[Math.floor(Math.random() * startLetters.length)];

      for (let i = 1; i < targetLength; i++) {
        const lastChar = word[word.length - 1];
        const possibleNext = englishBigrams[lastChar] || [
          "a",
          "e",
          "i",
          "o",
          "u",
        ];
        const nextChar =
          possibleNext[Math.floor(Math.random() * possibleNext.length)];
        word += nextChar;
      }

      return word;
    },

    // Algorithm 4: Frequency-Based Generator
    frequencyBasedGenerator: (level, difficulty) => {
      const wordPatterns = {
        easy: { high: 0.7, medium: 0.25, low: 0.05 },
        medium: { high: 0.6, medium: 0.3, low: 0.1 },
        hard: { high: 0.5, medium: 0.35, low: 0.15 },
      };

      const pattern = wordPatterns[difficulty];
      const length = Math.max(4, Math.min(5 + level, 10));
      let word = "";

      for (let i = 0; i < length; i++) {
        const rand = Math.random();
        let letterPool;

        if (rand < pattern.high) {
          letterPool = letterFrequency.high;
        } else if (rand < pattern.high + pattern.medium) {
          letterPool = letterFrequency.medium;
        } else {
          letterPool = letterFrequency.low;
        }

        word += letterPool[Math.floor(Math.random() * letterPool.length)];
      }

      return word;
    },

    // Algorithm 5: Linguistic Rule-Based Generator
    linguisticRuleGenerator: (level) => {
      const syllableCount = Math.max(1, Math.min(2 + Math.floor(level / 3), 4));
      let word = "";

      for (let i = 0; i < syllableCount; i++) {
        const onset = onsets[Math.floor(Math.random() * onsets.length)];
        const nucleus = nuclei[Math.floor(Math.random() * nuclei.length)];
        const coda =
          i === syllableCount - 1
            ? codas[Math.floor(Math.random() * codas.length)]
            : "";

        word += onset + nucleus + coda;
      }

      return word;
    },
  };

  // 🎯 SMART WORD SELECTION ALGORITHM
  const generateAlgorithmicWord = (level, difficulty) => {
    const algorithms = [
      WordGenerationAlgorithms.morphologicalGenerator,
      WordGenerationAlgorithms.semanticFieldGenerator,
      WordGenerationAlgorithms.markovChainGenerator,
      WordGenerationAlgorithms.frequencyBasedGenerator,
      WordGenerationAlgorithms.linguisticRuleGenerator,
    ];

    // Choose algorithm based on level for variety
    const algorithmIndex = (level - 1) % algorithms.length;
    const selectedAlgorithm = algorithms[algorithmIndex];

    let attempts = 0;
    let word;

    do {
      word = selectedAlgorithm(level, difficulty);
      attempts++;
    } while (usedWords.has(word) && attempts < 10);

    return word;
  };

  // 🔍 ENHANCED WORD VALIDATION
  const validateGeneratedWord = async (word) => {
    try {
      // Check with Free Dictionary API for real word validation
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      if (response.ok) {
        const data = await response.json();
        return (
          data &&
          data.length > 0 &&
          data[0].meanings &&
          data[0].meanings.length > 0
        );
      }
      return false;
    } catch (error) {
      if (error) {
        return false;
      }
    }
  };

  // Timer management
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft, gameState]);

  const handleTimeUp = useCallback(() => {
    setTimerActive(false);
    setLives((prev) => prev - 1);
    setStreak(0);
    setFeedback(`⏰ Time's up! The answer was: ${correctAnswer}`);

    const result = {
      word: currentWord,
      userAnswer: "Time Up",
      correctAnswer,
      isCorrect: false,
      language: selectedLanguage,
      timeUsed: gameSettings.timePerQuestion,
    };

    setGameHistory((prev) => [...prev, result]);
    setTotalQuestions((prev) => prev + 1);

    if (lives <= 1) {
      setTimeout(() => setGameState("gameOver"), 2000);
    } else {
      setTimeout(() => {
        generateNewWord();
      }, 2000);
    }
  }, [
    lives,
    correctAnswer,
    currentWord,
    selectedLanguage,
    gameSettings.timePerQuestion,
  ]);

  // Enhanced word fetching with multiple APIs + Algorithmic generation
  const fetchRandomWord = async () => {
    try {
      if (gameSettings.useAlgorithmicGeneration) {
        const word = generateAlgorithmicWord(level, gameSettings.difficulty);

        // Validate the generated word
        const isValid = await validateGeneratedWord(word);

        if (isValid) {
          console.log(`✅ Algorithmic generation success: ${word}`);
          return word;
        } else {
          console.log(
            `❌ Generated word not valid: ${word}, falling back to APIs`
          );
        }
      }

      // Calculate difficulty parameters based on level
      const wordLengthMin = Math.min(3 + Math.floor(level / 2), 6);
      const wordLengthMax = Math.min(6 + Math.floor(level / 2), 15);

      // Define multiple API strategies
      const apiStrategies = [
        // Strategy 1: WordsAPI (RapidAPI)
        {
          name: "WordsAPI",
          fetch: async () => {
            if (!gameSettings.apiKeys.wordsApi) throw new Error("No API key");

            const response = await fetch(
              `https://wordsapiv1.p.rapidapi.com/words/?random=true&letterPattern=^[a-zA-Z]{${wordLengthMin},${wordLengthMax}}$`,
              {
                headers: {
                  "X-RapidAPI-Key": gameSettings.apiKeys.wordsApi,
                  "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
                },
              }
            );

            if (!response.ok) throw new Error("API request failed");
            const data = await response.json();
            return data.word;
          },
        },

        // Strategy 2: Wordnik API
        {
          name: "Wordnik",
          fetch: async () => {
            if (!gameSettings.apiKeys.wordnik) throw new Error("No API key");

            const response = await fetch(
              `https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=1000&minLength=${wordLengthMin}&maxLength=${wordLengthMax}&api_key=${gameSettings.apiKeys.wordnik}`
            );

            if (!response.ok) throw new Error("API request failed");
            const data = await response.json();
            return data.word;
          },
        },

        // Strategy 3: API Ninjas
        {
          name: "API Ninjas",
          fetch: async () => {
            if (!gameSettings.apiKeys.ninjas) throw new Error("No API key");

            const response = await fetch(
              "https://api.api-ninjas.com/v1/randomword",
              {
                headers: {
                  "X-Api-Key": gameSettings.apiKeys.ninjas,
                },
              }
            );

            if (!response.ok) throw new Error("API request failed");
            const data = await response.json();
            const word = data.word;

            // Filter by length
            if (word.length >= wordLengthMin && word.length <= wordLengthMax) {
              return word;
            }
            throw new Error("Word length not suitable");
          },
        },

        // Strategy 4: English Words API
        {
          name: "English Words",
          fetch: async () => {
            const response = await fetch(
              "https://random-words-api.vercel.app/word"
            );
            if (!response.ok) throw new Error("API request failed");
            const data = await response.json();
            const word = data[0]?.word;

            if (
              word &&
              word.length >= wordLengthMin &&
              word.length <= wordLengthMax
            ) {
              return word.toLowerCase();
            }
            throw new Error("Word length not suitable");
          },
        },

        // Strategy 5: Fallback Algorithmic Generation
        {
          name: "Fallback Algorithm",
          fetch: async () => {
            const word = generateAlgorithmicWord(
              level,
              gameSettings.difficulty
            );
            const isValid = await validateGeneratedWord(word);

            if (isValid) {
              return word;
            }
            throw new Error("Generated word not valid");
          },
        },
      ];

      // Try each API strategy
      for (const strategy of apiStrategies) {
        try {
          console.log(`Trying ${strategy.name}...`);
          const word = await strategy.fetch();

          if (
            word &&
            typeof word === "string" &&
            !usedWords.has(word.toLowerCase())
          ) {
            console.log(`✅ ${strategy.name} success: ${word}`);
            return word.toLowerCase();
          }
        } catch (error) {
          console.log(`❌ ${strategy.name} failed:`, error.message);
          continue;
        }
      }

      // If all strategies fail, use emergency fallback
      const emergencyWord = generateAlgorithmicWord(
        level,
        gameSettings.difficulty
      );
      console.log(`🚨 Emergency fallback: ${emergencyWord}`);
      return emergencyWord;
    } catch (error) {
      console.error("Error fetching random word:", error);
      throw error;
    }
  };

  const fetchTranslation = async (word, targetLang) => {
    setLoading(true);
    try {
      // Try multiple translation APIs for better reliability
      const translationAPIs = [
        // MyMemory API (free, no key required)
        async () => {
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              word
            )}&langpair=en|${targetLang}`
          );
          const data = await response.json();
          if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
          }
          throw new Error("MyMemory API failed");
        },

        // LibreTranslate API (free, no key required)
        async () => {
          const response = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: word,
              source: "en",
              target: targetLang,
              format: "text",
            }),
          });
          const data = await response.json();
          if (data.translatedText) {
            return data.translatedText;
          }
          throw new Error("LibreTranslate API failed");
        },

        // Lingva Translate API (free, no key required)
        async () => {
          const response = await fetch(
            `https://lingva.ml/api/v1/en/${targetLang}/${encodeURIComponent(
              word
            )}`
          );
          const data = await response.json();
          if (data.translation) {
            return data.translation;
          }
          throw new Error("Lingva API failed");
        },
      ];

      // Try each API
      for (const apiCall of translationAPIs) {
        try {
          const translation = await apiCall();
          if (translation && translation.toLowerCase() !== word.toLowerCase()) {
            return translation;
          }
        } catch (error) {
          console.log("Translation API failed, trying next...", error);
        }
      }

      throw new Error("All translation APIs failed");
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateNewWord = async () => {
    setLoading(true);
    try {
      const newWord = await fetchRandomWord();
      setUsedWords((prev) => new Set([...prev, newWord]));
      setCurrentWord(newWord);
      setUserAnswer("");
      setFeedback("");
      setShowHint(false);
      setTimeLeft(gameSettings.timePerQuestion);
      setTimerActive(true);

      const translation = await fetchTranslation(newWord, selectedLanguage);
      setCorrectAnswer(translation);
    } catch (error) {
      console.error("Error generating new word:", error);
      setFeedback(
        "⚠️ Error generating word. Please check your settings or try again."
      );
      setTimeout(() => generateNewWord(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    const settings = difficultySettings[gameSettings.difficulty];
    setGameSettings((prev) => ({ ...prev, ...settings }));
    setGameState("playing");
    setScore(0);
    setLives(settings.livesCount);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionInLevel(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setGameHistory([]);
    setUsedWords(new Set());
    generateNewWord();
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    setTimerActive(false);
    const timeUsed = gameSettings.timePerQuestion - timeLeft;
    const userAnswerClean = userAnswer.toLowerCase().trim();
    const correctAnswerClean = correctAnswer.toLowerCase().trim();

    // More flexible answer checking
    const isCorrect =
      userAnswerClean === correctAnswerClean ||
      correctAnswerClean.includes(userAnswerClean) ||
      userAnswerClean.includes(correctAnswerClean);

    const result = {
      word: currentWord,
      userAnswer,
      correctAnswer,
      isCorrect,
      language: selectedLanguage,
      timeUsed,
      level,
    };

    setGameHistory((prev) => [...prev, result]);
    setTotalQuestions((prev) => prev + 1);
    setCurrentQuestionInLevel((prev) => prev + 1);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      const basePoints = level * 10;
      const timeBonus = Math.max(0, timeLeft * 2);
      const streakBonus = streak >= 2 ? 20 : 0;
      const totalPoints = basePoints + timeBonus + streakBonus;

      setScore((prev) => prev + totalPoints);
      setStreak((prev) => prev + 1);
      setFeedback(
        `🎉 Correct! +${totalPoints} points (Base: ${basePoints}, Time: ${timeBonus}, Streak: ${streakBonus})`
      );

      // Level progression
      if (currentQuestionInLevel + 1 >= gameSettings.questionsPerLevel) {
        setLevel((prev) => prev + 1);
        setCurrentQuestionInLevel(0);
        setFeedback((prev) => prev + ` 🆙 Level ${level + 1} unlocked!`);
      }
    } else {
      setLives((prev) => prev - 1);
      setStreak(0);
      setFeedback(`❌ Wrong! The correct answer was: "${correctAnswer}"`);

      if (lives <= 1) {
        setTimeout(() => setGameState("gameOver"), 2000);
        return;
      }
    }

    setTimeout(() => {
      if (gameState === "playing") {
        generateNewWord();
      }
    }, 2000);
  };

  const getHint = () => {
    if (correctAnswer && !showHint) {
      setShowHint(true);
      setScore((prev) => Math.max(0, prev - 10));
    }
  };

  const pauseGame = () => {
    setTimerActive(false);
    setGameState("paused");
  };

  const resumeGame = () => {
    setTimerActive(true);
    setGameState("playing");
  };

  const resetGame = () => {
    setGameState("menu");
    setScore(0);
    setLives(3);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionInLevel(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setGameHistory([]);
    setUsedWords(new Set());
    setTimerActive(false);
  };

  // Settings Screen
  if (gameState === "settings") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-center mb-8">
              <Settings className="mx-auto mb-4 text-5xl text-blue-400" />
              <h1 className="text-3xl font-bold mb-2">Game Settings</h1>
              <p className="text-lg opacity-80">
                Configure your endless word generation experience
              </p>
            </div>

            <div className="space-y-8">
              {/* API Keys Section */}
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Key className="text-yellow-400" />
                  API Keys (Optional but Recommended)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      WordsAPI (RapidAPI) Key:
                    </label>
                    <input
                      type="password"
                      value={gameSettings.apiKeys.wordsApi}
                      onChange={(e) =>
                        setGameSettings((prev) => ({
                          ...prev,
                          apiKeys: {
                            ...prev.apiKeys,
                            wordsApi: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your RapidAPI key for WordsAPI"
                      className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Wordnik API Key:
                    </label>
                    <input
                      type="password"
                      value={gameSettings.apiKeys.wordnik}
                      onChange={(e) =>
                        setGameSettings((prev) => ({
                          ...prev,
                          apiKeys: { ...prev.apiKeys, wordnik: e.target.value },
                        }))
                      }
                      placeholder="Enter your Wordnik API key"
                      className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      API Ninjas Key:
                    </label>
                    <input
                      type="password"
                      value={gameSettings.apiKeys.ninjas}
                      onChange={(e) =>
                        setGameSettings((prev) => ({
                          ...prev,
                          apiKeys: { ...prev.apiKeys, ninjas: e.target.value },
                        }))
                      }
                      placeholder="Enter your API Ninjas key"
                      className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                    <p className="text-sm">
                      <strong>📝 Note:</strong> API keys are optional. Free APIs
                      are available, but premium keys provide better word
                      variety and reliability.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3">
                  Difficulty Level:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(difficultySettings).map(([key, settings]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setGameSettings((prev) => ({
                          ...prev,
                          difficulty: key,
                        }))
                      }
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        gameSettings.difficulty === key
                          ? "bg-green-500 text-white transform scale-105"
                          : "bg-white/20 hover:bg-white/30"
                      }`}>
                      <div className="font-bold capitalize">{key}</div>
                      <div className="text-sm">
                        {settings.timePerQuestion}s •{" "}
                        {settings.questionsPerLevel} questions •{" "}
                        {settings.livesCount} lives
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3">
                  Target Language:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => setSelectedLanguage(code)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        selectedLanguage === code
                          ? "bg-yellow-500 text-black transform scale-105"
                          : "bg-white/20 hover:bg-white/30"
                      }`}>
                      <span className="text-xl mr-2">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="font-semibold mb-3">
                  🚀 Dynamic Word Generation Features:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p>• 🎯 Multiple API integrations for variety</p>
                    <p>• 📈 Difficulty-based word complexity</p>
                    <p>• 🔄 No word repetition system</p>
                    <p>• 🛡️ Fallback system for reliability</p>
                  </div>
                  <div className="space-y-2">
                    <p>• 📚 Real dictionary validation</p>
                    <p>• 🌐 Multi-language translation</p>
                    <p>• ⚡ Fast API response handling</p>
                    <p>• 🎲 True random word selection</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setGameState("menu")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                Back
              </button>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                Start Dynamic Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pause Screen
  if (gameState === "paused") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 via-blue-600 to-indigo-800 p-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center text-white shadow-2xl">
            <Clock className="mx-auto mb-4 text-5xl text-blue-400" />
            <h1 className="text-3xl font-bold mb-4">Game Paused</h1>
            <p className="text-lg mb-8">
              Take your time! The endless adventure awaits...
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={resumeGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                Resume
              </button>
              <button
                onClick={resetGame}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                Quit Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center text-white shadow-2xl">
            <div className="mb-8">
              <Globe className="mx-auto mb-4 text-6xl text-blue-400" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                LinguaQuest ∞
              </h1>
              <p className="text-xl opacity-90">
                Endless Language Learning Adventure
              </p>
            </div>

            <div className="mb-8 p-6 bg-white/10 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                🌟 Endless Mode Features:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p>• ∞ Unlimited Words</p>
                  <p>• 🎯 Dynamic Difficulty</p>
                  <p>• 🌍 12 Languages</p>
                  <p>• 🧠 Smart AI Generation</p>
                </div>
                <div className="text-left">
                  <p>• 🔄 No Repetition</p>
                  <p>• 💡 Intelligent Hints</p>
                  <p>• 📊 Progress Tracking</p>
                  <p>• 🏆 Streak Bonuses</p>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30">
              <h3 className="font-semibold mb-2">
                🚀 New: Endless Vocabulary!
              </h3>
              <p className="text-sm opacity-90">
                Experience unlimited word generation with adaptive difficulty.
                No more limited word lists - challenge yourself with endless
                possibilities!
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setGameState("settings")}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
                <Settings className="inline mr-2" size={24} />
                Settings
              </button>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
                <Play className="inline mr-2" size={24} />
                Start Adventure
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gameState === "playing") {
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const progress =
      (currentQuestionInLevel / gameSettings.questionsPerLevel) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={20} />
                  <span className="font-bold text-lg">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="text-blue-400" size={20} />
                  <span>Level {level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-orange-400" size={20} />
                  <span>{streak} streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="text-green-400" size={20} />
                  <span>{accuracy}% accuracy</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(gameSettings.livesCount)].map((_, i) => (
                    <Heart
                      key={i}
                      className={i < lives ? "text-red-500" : "text-gray-400"}
                      size={20}
                      fill={i < lives ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <div
                  className={`text-xl font-bold px-3 py-1 rounded-lg ${
                    timeLeft <= 10
                      ? "bg-red-500/30 text-red-300"
                      : timeLeft <= 20
                      ? "bg-yellow-500/30 text-yellow-300"
                      : "bg-green-500/30 text-green-300"
                  }`}>
                  {timeLeft}s
                </div>
                <button
                  onClick={pauseGame}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-all duration-300">
                  ⏸️
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-xs text-center mt-1 opacity-75">
              Question {currentQuestionInLevel + 1} of{" "}
              {gameSettings.questionsPerLevel} in Level {level}
            </div>
          </div>

          {/* Game Area */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
            <div className="mb-8">
              <div className="text-sm opacity-75 mb-2">
                Translate to {languages[selectedLanguage].flag}{" "}
                {languages[selectedLanguage].name}
              </div>
              <div className="text-6xl font-bold mb-6 text-yellow-400 drop-shadow-lg">
                {currentWord}
              </div>
              {showHint && (
                <div className="text-xl text-orange-400 mb-4 p-3 bg-orange-500/20 rounded-lg">
                  💡 Hint:{" "}
                  {correctAnswer.substring(
                    0,
                    Math.max(1, Math.floor(correctAnswer.length / 2))
                  )}
                  ...
                </div>
              )}
            </div>

            <div className="mb-8">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !loading && checkAnswer()
                }
                placeholder="Enter your translation..."
                className="w-full max-w-lg p-4 text-xl rounded-xl border-3 border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 focus:bg-white/30 transition-all duration-300"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={checkAnswer}
                disabled={loading || !userAnswer.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100">
                {loading ? (
                  <RefreshCw className="animate-spin" size={24} />
                ) : (
                  "Submit Answer"
                )}
              </button>

              <button
                onClick={getHint}
                disabled={showHint}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100">
                {showHint ? "Hint Used" : "Get Hint (-10 pts)"}
              </button>
            </div>

            {feedback && (
              <div
                className={`text-lg font-bold p-4 rounded-xl transition-all duration-300 ${
                  feedback.includes("Correct")
                    ? "bg-green-500/30 text-green-200 border-2 border-green-400"
                    : "bg-red-500/30 text-red-200 border-2 border-red-400"
                }`}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === "gameOver") {
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const avgTimePerQuestion =
      gameHistory.length > 0
        ? Math.round(
            gameHistory.reduce((sum, item) => sum + item.timeUsed, 0) /
              gameHistory.length
          )
        : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-purple-600 to-indigo-800 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center text-white shadow-2xl">
            <Award className="mx-auto mb-6 text-7xl text-yellow-400" />
            <h1 className="text-5xl font-bold mb-6">Game Complete!</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 p-4 rounded-xl">
                <Trophy className="mx-auto mb-2 text-yellow-400" size={32} />
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-sm opacity-75">Final Score</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <Target className="mx-auto mb-2 text-blue-400" size={32} />
                <div className="text-2xl font-bold">{level}</div>
                <div className="text-sm opacity-75">Level Reached</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <BookOpen className="mx-auto mb-2 text-green-400" size={32} />
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm opacity-75">Accuracy</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <Clock className="mx-auto mb-2 text-purple-400" size={32} />
                <div className="text-2xl font-bold">{avgTimePerQuestion}s</div>
                <div className="text-sm opacity-75">Avg. Time</div>
              </div>
            </div>

            <div className="mb-8 p-6 bg-white/10 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                📊 Performance Summary:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p>Total Questions: {totalQuestions}</p>
                  <p>Correct Answers: {correctAnswers}</p>
                  <p>
                    Best Streak:{" "}
                    {Math.max(
                      ...gameHistory.map((_, i) => {
                        let streak = 0;
                        for (
                          let j = i;
                          j < gameHistory.length && gameHistory[j].isCorrect;
                          j++
                        ) {
                          streak++;
                        }
                        return streak;
                      }),
                      0
                    )}
                  </p>
                </div>
                <div>
                  <p>Language: {languages[selectedLanguage].name}</p>
                  <p>Difficulty: {gameSettings.difficulty}</p>
                  <p>Questions per Level: {gameSettings.questionsPerLevel}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
                <Play className="inline mr-2" size={24} />
                Play Again
              </button>

              <button
                onClick={() => setGameState("settings")}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
                <Settings className="inline mr-2" size={24} />
                Settings
              </button>

              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
                <Globe className="inline mr-2" size={24} />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default TranslationGame;
