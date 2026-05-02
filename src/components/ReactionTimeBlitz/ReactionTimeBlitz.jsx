// ReactionTimeBlitz

import React, { useState } from "react";
import {
  Brain,
  Play,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  Heart,
  Eye,
  Globe,
} from "lucide-react";
import Questions from "../utility/Questions/Questions";

const ReactionTimeBlitz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameState, setGameState] = useState("welcome"); // welcome, playing, results
  const [selectedOption, setSelectedOption] = useState(null);
  const [language, setLanguage] = useState("en");
  const [showResults, setShowResults] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);

  const questions = Questions();

  const getBrainType = (totalScore) => {
    if (totalScore >= 15 && totalScore <= 21) {
      return {
        type: "Balance Brain",
        icon: <Target className="w-12 h-12" />,
        color: "from-green-400 to-blue-500",
        bgColor: "bg-gradient-to-br from-green-100 to-blue-100",
        description:
          "You have a well-balanced approach to life. You think logically while maintaining emotional awareness.",
        traits: [
          "Logical thinking",
          "Emotional intelligence",
          "Adaptable",
          "Measured responses",
        ],
        iqRange: "115-130",
        strengths: [
          "Problem-solving",
          "Decision making",
          "Leadership",
          "Communication",
        ],
        careers: ["Management", "Counseling", "Teaching", "Research"],
      };
    } else if (totalScore >= 22 && totalScore <= 27) {
      return {
        type: "Spontaneous Brain",
        icon: <Zap className="w-12 h-12" />,
        color: "from-yellow-400 to-orange-500",
        bgColor: "bg-gradient-to-br from-yellow-100 to-orange-100",
        description:
          "You are quick-thinking, adaptable, and thrive in dynamic environments. You make decisions instinctively.",
        traits: [
          "Quick decision-making",
          "High adaptability",
          "Creative thinking",
          "Risk-taking",
        ],
        iqRange: "120-135",
        strengths: [
          "Innovation",
          "Crisis management",
          "Networking",
          "Entrepreneurship",
        ],
        careers: ["Entrepreneur", "Sales", "Marketing", "Emergency Services"],
      };
    } else if (totalScore >= 28 && totalScore <= 33) {
      return {
        type: "Persistent Brain",
        icon: <Trophy className="w-12 h-12" />,
        color: "from-purple-400 to-pink-500",
        bgColor: "bg-gradient-to-br from-purple-100 to-pink-100",
        description:
          "You are determined, hardworking, and never give up. You achieve goals through persistence.",
        traits: ["High persistence", "Goal-oriented", "Disciplined", "Patient"],
        iqRange: "110-125",
        strengths: [
          "Long-term planning",
          "Quality work",
          "Reliability",
          "Detail-oriented",
        ],
        careers: ["Engineering", "Research", "Project Management", "Academia"],
      };
    } else if (totalScore >= 34 && totalScore <= 39) {
      return {
        type: "Sensitive Brain",
        icon: <Heart className="w-12 h-12" />,
        color: "from-pink-400 to-rose-500",
        bgColor: "bg-gradient-to-br from-pink-100 to-rose-100",
        description:
          "You are highly empathetic, emotionally aware, and deeply connected to others feelings.",
        traits: [
          "High empathy",
          "Emotional sensitivity",
          "Intuitive",
          "Caring nature",
        ],
        iqRange: "105-120",
        strengths: [
          "Understanding others",
          "Creativity",
          "Teamwork",
          "Healing",
        ],
        careers: ["Healthcare", "Social Work", "Arts", "Human Resources"],
      };
    } else if (totalScore >= 40 && totalScore <= 45) {
      return {
        type: "Conscious Brain",
        icon: <Eye className="w-12 h-12" />,
        color: "from-indigo-400 to-purple-500",
        bgColor: "bg-gradient-to-br from-indigo-100 to-purple-100",
        description:
          "You are highly self-aware, mindful, and deeply thoughtful about life and relationships.",
        traits: [
          "High self-awareness",
          "Mindfulness",
          "Deep thinking",
          "Reflective nature",
        ],
        iqRange: "125-140",
        strengths: ["Self-reflection", "Philosophy", "Meditation", "Wisdom"],
        careers: [
          "Psychology",
          "Philosophy",
          "Writing",
          "Spiritual Leadership",
        ],
      };
    }
    return {
      type: "Unique Brain",
      icon: <Brain className="w-12 h-12" />,
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gradient-to-br from-gray-100 to-gray-200",
      description:
        "Your brain pattern is unique and doesn't fit typical categories.",
      traits: ["Individual", "Unique perspective", "Complex", "Multifaceted"],
      iqRange: "100-140",
      strengths: ["Versatility", "Uniqueness", "Complexity", "Individuality"],
      careers: ["Various fields", "Creative roles", "Innovation", "Research"],
    };
  };

  const handleStartGame = () => {
    setGameState("playing");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
  };

  const handleAnswerSelect = (optionId, score) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      const newAnswers = [
        ...answers,
        { questionId: questions[currentQuestion].id, score },
      ];
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setGameState("results");
        setShowResults(true);
        setAnimateScore(true);
      }
    }, 500);
  };

  const calculateTotalScore = () => {
    return answers.reduce((total, answer) => total + answer.score, 0);
  };

  const restartGame = () => {
    setGameState("welcome");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResults(false);
    setAnimateScore(false);
  };

  const totalScore = calculateTotalScore();
  const brainType = getBrainType(totalScore);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameState === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4 rounded-full animate-pulse">
                  <Brain className="w-16 h-16 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Brain Type Analysis
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Discover your unique brain type through 15 psychological
                questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <Globe className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Multi-Language
                </h3>
                <p className="text-white/70">Available in English & Bengali</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <Target className="w-8 h-8 text-pink-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Scientific Analysis
                </h3>
                <p className="text-white/70">Based on psychological research</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    language === "en"
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}>
                  English
                </button>
                <button
                  onClick={() => setLanguage("bn")}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    language === "bn"
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}>
                  বাংলা
                </button>
              </div>

              <button
                onClick={handleStartGame}
                className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 w-full md:w-auto mx-auto">
                <Play className="w-6 h-6 group-hover:animate-pulse" />
                {language === "en"
                  ? "Start Brain Analysis"
                  : "ব্রেইন বিশ্লেষণ শুরু করুন"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "playing") {
    const question = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 font-medium">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-white/80 font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">
                  {currentQuestion + 1}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {question.question[language]}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id, option.score)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedOption === option.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 border-white text-white shadow-2xl"
                      : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                  }`}
                  disabled={selectedOption !== null}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.id
                            ? "bg-white border-white"
                            : "border-white/40"
                        }`}>
                        <span
                          className={`font-bold ${
                            selectedOption === option.id
                              ? "text-purple-500"
                              : "text-white/60"
                          }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-left font-medium text-lg">
                        {option.option[language]}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-6 h-6 transition-transform ${
                        selectedOption === option.id
                          ? "transform rotate-90"
                          : ""
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${
                brainType.color
              } mb-6 ${animateScore ? "animate-bounce" : ""}`}>
              {brainType.icon}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Your Brain Type
            </h1>
            <div
              className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${
                brainType.color
              } text-white font-bold text-2xl md:text-3xl shadow-2xl ${
                animateScore ? "animate-pulse" : ""
              }`}>
              {brainType.type}
            </div>
          </div>

          {/* Score Display */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <h3 className="text-white/80 font-medium mb-2">Total Score</h3>
              <div
                className={`text-4xl font-bold text-white ${
                  animateScore ? "animate-pulse" : ""
                }`}>
                {showResults ? totalScore : 0}
              </div>
              <p className="text-white/60 text-sm mt-2">out of 45</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <h3 className="text-white/80 font-medium mb-2">IQ Range</h3>
              <div className="text-4xl font-bold text-white">
                {brainType.iqRange}
              </div>
              <p className="text-white/60 text-sm mt-2">estimated range</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <h3 className="text-white/80 font-medium mb-2">Brain Category</h3>
              <div className="text-2xl font-bold text-white">
                {brainType.type.split(" ")[0]}
              </div>
              <p className="text-white/60 text-sm mt-2">primary trait</p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Description */}
            <div
              className={`${brainType.bgColor} rounded-2xl p-8 border border-white/20`}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Brain className="w-8 h-8" />
                About Your Brain
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {brainType.description}
              </p>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Key Traits:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {brainType.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-white/50 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Careers */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Your Strengths
                </h4>
                <ul className="space-y-2">
                  {brainType.strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="text-white/80 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Ideal Careers
                </h4>
                <ul className="space-y-2">
                  {brainType.careers.map((career, index) => (
                    <li
                      key={index}
                      className="text-white/80 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      {career}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Brain Type Distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Brain Type Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                {
                  name: "Balance",
                  range: "15-21",
                  icon: <Target className="w-6 h-6" />,
                  color: "bg-green-500",
                },
                {
                  name: "Spontaneous",
                  range: "22-27",
                  icon: <Zap className="w-6 h-6" />,
                  color: "bg-yellow-500",
                },
                {
                  name: "Persistent",
                  range: "28-33",
                  icon: <Trophy className="w-6 h-6" />,
                  color: "bg-purple-500",
                },
                {
                  name: "Sensitive",
                  range: "34-39",
                  icon: <Heart className="w-6 h-6" />,
                  color: "bg-pink-500",
                },
                {
                  name: "Conscious",
                  range: "40-45",
                  icon: <Eye className="w-6 h-6" />,
                  color: "bg-indigo-500",
                },
              ].map((type, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl text-center transition-all ${
                    brainType.type.includes(type.name)
                      ? "bg-white text-gray-800 shadow-lg transform scale-105"
                      : "bg-white/5 text-white/70"
                  }`}>
                  <div className="flex justify-center mb-2">{type.icon}</div>
                  <div className="font-semibold text-sm">{type.name}</div>
                  <div className="text-xs opacity-75">{type.range}</div>
                  {brainType.type.includes(type.name) && (
                    <div className="mt-2">
                      <div className="text-2xl font-bold">{totalScore}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 mx-auto">
              <RotateCcw className="w-6 h-6" />
              Take Test Again
            </button>

            <p className="text-white/60 text-sm">
              Share your results with friends and discover their brain types!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ReactionTimeBlitz;
