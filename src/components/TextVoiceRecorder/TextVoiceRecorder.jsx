import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Download,
  Mic,
  Settings,
  AlertCircle,
  Smartphone,
  Type,
  Copy,
  Trash2,
} from "lucide-react";

const TextVoiceRecorder = () => {
  const [inputText, setInputText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const speechRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const textareaRef = useRef(null);

  // Check device type and speech support
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()));
    };

    const checkSpeechSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setSpeechSupported(true);
        
        // Wait for voices to load
        const loadVoices = () => {
          const availableVoices = speechSynthesis.getVoices();
          console.log('Available voices:', availableVoices.length);
          
          if (availableVoices.length > 0) {
            setVoices(availableVoices);
            if (!selectedVoice) {
              // Prefer English voices
              const englishVoice = availableVoices.find(voice => 
                voice.lang.startsWith('en-')
              ) || availableVoices[0];
              setSelectedVoice(englishVoice);
            }
          }
        };

        // Load voices immediately
        loadVoices();
        
        // Also listen for voices changed event (important for mobile)
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        // Fallback timeout for mobile devices
        setTimeout(loadVoices, 1000);
      } else {
        setSpeechSupported(false);
        setError("Speech synthesis is not supported in this browser");
      }
    };

    checkMobile();
    checkSpeechSupport();

    return () => {
      if (speechRef.current && speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [selectedVoice]); 

  const handleTextChange = (event) => {
    setInputText(event.target.value);
    setError("");
  };

  const clearText = () => {
    setInputText("");
    stopSpeech();
  };

  const pasteText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setInputText(text);
        setError("");
      } else {
        // Fallback for browsers without clipboard API
        setError("Clipboard API not supported. Please paste manually (Ctrl+V).");
      }
    } catch (err) {
      console.error("Paste error:", err);
      setError("Failed to paste text. Please paste manually (Ctrl+V).");
    }
  };

  const startSpeech = () => {
    if (!inputText.trim() || !speechSupported) return;

    try {
      // Cancel any existing speech
      speechSynthesis.cancel();

      // Wait a bit for cancel to complete (mobile fix)
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(inputText.trim());
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        
        // Mobile optimization
        if (isMobile) {
          utterance.volume = 1;
          utterance.rate = Math.max(0.5, Math.min(speechRate, 2));
        }

        utterance.onstart = () => {
          setIsPlaying(true);
          setIsPaused(false);
          setError("");
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };

        utterance.onerror = (event) => {
          console.error("Speech error:", event);
          setError(`Speech synthesis error: ${event.error}`);
          setIsPlaying(false);
          setIsPaused(false);
        };

        utterance.onpause = () => {
          setIsPaused(true);
        };

        utterance.onresume = () => {
          setIsPaused(false);
        };

        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
      }, 100);
    } catch (err) {
      console.error("Speech start error:", err);
      setError("Failed to start speech synthesis");
    }
  };

  const pauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Check for MediaRecorder support
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
        });
        setRecordedChunks([blob]);

        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setError("");
    } catch (err) {
      console.error("Recording error:", err);
      setError("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = recordedChunks[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = blob.type.includes("webm") ? "webm" : "mp4";
      a.download = `text_to_speech_recording.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const testSpeech = () => {
    if (speechSupported) {
      const utterance = new SpeechSynthesisUtterance("Testing speech synthesis");
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Text to Speech Recorder
          </h1>
          <p className="text-xl text-gray-300">
            Convert your text to speech and record audio
          </p>
          {isMobile && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-300">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm">Mobile optimized version</span>
            </div>
          )}
        </div>

        {/* Speech Support Warning */}
        {!speechSupported && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Speech synthesis is not supported in this browser</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Input Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Type className="w-6 h-6" />
              Text Input
            </h2>

            <div className="space-y-4">
              {/* Text Controls */}
              <div className="flex gap-2">
                <button
                  onClick={pasteText}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Paste
                </button>
                <button
                  onClick={clearText}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder="Enter your text here... (100-500 words or more)"
                  className="w-full h-80 bg-black/20 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
                  {inputText.length} characters
                </div>
              </div>

              {/* Quick Text Examples */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Quick Examples:</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setInputText("Hello! This is a test of the text to speech system. It can convert any text you provide into natural sounding speech.")}
                    className="w-full text-left text-gray-300 hover:text-white text-sm p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    Sample Text 1
                  </button>
                  <button
                    onClick={() => setInputText("Welcome to our text to speech application. You can type or paste any text here, and it will be converted to speech using your browser's built-in speech synthesis capabilities.")}
                    className="w-full text-left text-gray-300 hover:text-white text-sm p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    Sample Text 2
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Speech Controls Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-6 h-6" />
              Speech Controls
            </h2>

            <div className="space-y-4">
              {/* Speech Status */}
              <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${speechSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>
                    Speech: {speechSupported ? `Ready (${voices.length} voices)` : 'Not Supported'}
                  </span>
                </div>
              </div>

              {/* Test Speech Button */}
              {speechSupported && (
                <button
                  onClick={testSpeech}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors text-sm"
                >
                  Test Speech
                </button>
              )}

              {/* Voice Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full bg-gray-600/50 hover:bg-gray-600/70 text-white p-3 rounded-lg transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Voice Settings
                </span>
                <span className={`transform transition-transform ${showSettings ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {showSettings && (
                <div className="space-y-3 bg-black/20 rounded-lg p-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Voice:</label>
                    <select
                      value={selectedVoice?.name || ""}
                      onChange={(e) =>
                        setSelectedVoice(voices.find((v) => v.name === e.target.value) || null)
                      }
                      className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 text-sm"
                    >
                      <option value="">Select a voice...</option>
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">
                      Speed: {speechRate}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">
                      Pitch: {speechPitch}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speechPitch}
                      onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex gap-3">
                {!isPlaying ? (
                  <button
                    onClick={startSpeech}
                    disabled={!inputText.trim() || !speechSupported}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Play
                  </button>
                ) : (
                  <button
                    onClick={isPaused ? resumeSpeech : pauseSpeech}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                )}

                <button
                  onClick={stopSpeech}
                  disabled={!isPlaying && !isPaused}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </div>

              {/* Recording Controls */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-white font-semibold mb-3">Record Audio</h3>
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 text-blue-200 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Recording Instructions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Start recording before playing speech</li>
                    <li>This will record your microphone audio</li>
                    <li>Stop recording when finished</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop Recording
                    </button>
                  )}

                  {recordedChunks.length > 0 && (
                    <button
                      onClick={downloadRecording}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  )}
                </div>

                {recordedChunks.length > 0 && (
                  <div className="mt-3 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm">
                    Recording saved! You can download the audio file above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>
              Status: {isPlaying ? (isPaused ? "Paused" : "Playing") : "Ready"}
            </span>
            <span>
              {isRecording && (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Recording...
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextVoiceRecorder;