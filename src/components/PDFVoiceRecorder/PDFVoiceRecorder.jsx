import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Play,
  Pause,
  Square,
  Volume2,
  Download,
  FileText,
  Mic,
  Settings,
  AlertCircle,
  Smartphone,
} from "lucide-react";

const PDFVoiceRecorder = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
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
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const speechRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      return;
    }

    setIsLoading(true);
    setError("");
    setPdfFile(file);

    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      setError("");
    } catch (err) {
      console.error("PDF extraction error:", err);
      setError(`Failed to extract text from PDF: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file) => {
    try {
      // Load PDF.js from CDN if not already loaded
      if (!window.pdfjsLib) {
        await loadPDFJS();
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }

      if (!fullText.trim()) {
        throw new Error("No text found in PDF - it might be image-based");
      }

      return fullText.trim();
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error(
        "Failed to extract text from PDF. The PDF might be image-based or require OCR processing."
      );
    }
  };

  const loadPDFJS = () => {
    return new Promise((resolve, reject) => {
      // Load PDF.js from CDN
      const script = document.createElement("script");
      script.src = `${import.meta.env.VITE_PDF_GENERATOR_URL}`;
      script.onload = () => {
        // Set worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          `${import.meta.env.VITE_PDF_GENERATOR_CDN_URL}`;
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });
  };

  const startSpeech = () => {
    if (!extractedText || !speechSupported) return;

    try {
      // Cancel any existing speech
      speechSynthesis.cancel();

      // Wait a bit for cancel to complete (mobile fix)
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(extractedText);
        
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

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
      a.download = `${pdfFile?.name?.replace(".pdf", "") || "recording"}_voice_recording.${extension}`;
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
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            PDF Voice Recorder
          </h1>
          <p className="text-xl text-gray-300">
            Convert your PDF documents to speech and record audio
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
          {/* PDF Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              PDF Upload
            </h2>

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">
                  {pdfFile ? pdfFile.name : "Click to upload PDF or drag & drop"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {isLoading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                  <p className="text-gray-300 mt-2">Extracting text from PDF...</p>
                </div>
              )}

              {extractedText && (
                <div className="bg-black/20 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-2">
                    Extracted Text ({extractedText.length} characters):
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {extractedText}
                  </p>
                </div>
              )}
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
                        setSelectedVoice(voices.find((v) => v.name === e.target.value))
                      }
                      className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 text-sm"
                    >
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
                      className="w-full"
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
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex gap-3">
                {!isPlaying ? (
                  <button
                    onClick={startSpeech}
                    disabled={!extractedText || !speechSupported}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                    <li>Note: System audio capture may not work on all devices</li>
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

export default PDFVoiceRecorder;