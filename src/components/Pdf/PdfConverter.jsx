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
  Languages,
  ArrowRightLeft,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Globe,
  Wifi,
  WifiOff,
  Book,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { EnhancedTranslations } from "../utility/EnhancedTranslations";




const PdfConverter = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationMethod, setTranslationMethod] = useState("mymemory");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [translationSuccess, setTranslationSuccess] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [wordDefinitions, setWordDefinitions] = useState([]);
  const [libreTranslateUrl, setLibreTranslateUrl] = useState(import.meta.env.VITE_LIBRETRANSLATE);
  //libreTranslateUrl

  // PDF related states
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [showPdfText, setShowPdfText] = useState(false);

  const speechRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const textareaRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Function to count words in text
  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Check device type, speech support, and network status
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        )
      );
    };

    const checkSpeechSupport = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        setSpeechSupported(true);

        const loadVoices = () => {
          const availableVoices = speechSynthesis.getVoices();

          if (availableVoices.length > 0) {
            setVoices(availableVoices);
            if (!selectedVoice) {
              const bengaliVoice = availableVoices.find(
                (voice) =>
                  voice.lang.startsWith("bn-") || voice.lang.includes("bengali")
              );
              const englishVoice = availableVoices.find((voice) =>
                voice.lang.startsWith("en-")
              );
              setSelectedVoice(
                bengaliVoice || englishVoice || availableVoices[0]
              );
            }
          }
        };

        loadVoices();

        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = loadVoices;
        }

        setTimeout(loadVoices, 1000);
      } else {
        setSpeechSupported(false);
        setError("Speech synthesis is not supported in this browser");
      }
    };

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    checkMobile();
    checkSpeechSupport();

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      if (speechRef.current && speechSynthesis) {
        speechSynthesis.cancel();
      }
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [selectedVoice]);

  // Improved MyMemory API with better error handling and rate limiting
  const translateWithMyMemory = async (text, fromLang, toLang) => {
    try {
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const langPair = `${fromLang}|${toLang}`;
      const encodedText = encodeURIComponent(text.trim());
      
      const maxLength = 500;
      if (text.length > maxLength) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        
        let currentChunk = '';
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
        
        const translatedChunks = [];
        for (const chunk of chunks) {
          const response = await fetch(
            `${import.meta.env.VITE_MYMEMORY}?q=${encodeURIComponent(chunk)}&langpair=${langPair}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; TranslatorApp/1.0)'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.responseStatus === 200 && data.responseData?.translatedText) {
            translatedChunks.push(data.responseData.translatedText);
          } else {
            throw new Error(`API Error: ${data.responseDetails || 'Unknown error'}`);
          }
          
          // Add delay between chunks
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return translatedChunks.join('. ');
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_MYMEMORY}?q=${encodedText}&langpair=${langPair}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (compatible; TranslatorApp/1.0)'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          return data.responseData.translatedText;
        } else {
          throw new Error(`API Error: ${data.responseDetails || 'Translation failed'}`);
        }
      }
    } catch (error) {
      console.error("MyMemory API error:", error);
      throw new Error(`MyMemory API failed: ${error.message}`);
    }
  };

  // Improved LibreTranslate with custom URL support
  const translateWithLibreTranslate = async (text, fromLang, toLang) => {
    try {
      const url = libreTranslateUrl || import.meta.env.VITE_LIBRETRANSLATE;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.translatedText) {
        return data.translatedText;
      } else {
        throw new Error('No translation returned');
      }
    } catch (error) {
      console.error("LibreTranslate error:", error);
      throw new Error(`LibreTranslate failed: ${error.message}`);
    }
  };

  // Google Translate (unofficial API)
  const translateWithGoogle = async (text, fromLang, toLang) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_GOOGLEAPIS}?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Google Translate error:", error);
      throw new Error(`Google Translate failed: ${error.message}`);
    }
  };

  // Enhanced offline translation with better phrase handling
  const translateOffline = (text) => {
    const normalizedText = text.toLowerCase().trim();
    
    // Check for exact phrase matches first
    if (EnhancedTranslations[normalizedText]) {
      return EnhancedTranslations[normalizedText];
    }
    
    // Handle sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length > 1) {
      return sentences.map(sentence => {
        const trimmed = sentence.trim();
        if (EnhancedTranslations[trimmed.toLowerCase()]) {
          return EnhancedTranslations[trimmed.toLowerCase()];
        }
        
        // Word-by-word translation
        const words = trimmed.split(/\s+/);
        const translated = words.map(word => {
          const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
          return EnhancedTranslations[cleanWord] || word;
        });
        return translated.join(" ");
      }).join("। ");
    } else {
      // Single sentence - try word-by-word
      const words = normalizedText.split(/\s+/);
      const translated = words.map(word => {
        const cleanWord = word.replace(/[.,!?;:]/g, "");
        return EnhancedTranslations[cleanWord] || word;
      });
      return translated.join(" ");
    }
  };

  // PDF processing remains the same
  const processPdf = async (file) => {
    setIsPdfProcessing(true);
    setError("");

    try {
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF.js library not loaded");
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }

      if (fullText.trim()) {
        setPdfText(fullText.trim());
        setInputText(fullText.trim());
        setUploadedPdfName(file.name);
        setError("");
      } else {
        setError("No text content found in the PDF file");
      }
    } catch (err) {
      console.error("PDF processing error:", err);
      setError(`Failed to process PDF: ${err.message}`);
    } finally {
      setIsPdfProcessing(false);
    }
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        processPdf(file);
      } else {
        setError("Please select a valid PDF file");
      }
    }
  };

  const clearPdfData = () => {
    setPdfText("");
    setUploadedPdfName("");
    setShowPdfText(false);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handleTextChange = (event) => {
    setInputText(event.target.value);
    setError("");
    setTranslationSuccess(false);
  };

  const clearText = () => {
    setInputText("");
    setTranslatedText("");
    setTranslationSuccess(false);
    setWordDefinitions([]);
    clearPdfData();
    stopSpeech();
  };

  const pasteText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setInputText(text);
        setError("");
      } else {
        setError(
          "Clipboard API not supported. Please paste manually (Ctrl+V)."
        );
      }
    } catch (err) {
      setError("Failed to paste text. Please paste manually (Ctrl+V).", err);
    }
  };

  const copyTranslation = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(translatedText);
        setError("");
        setTranslationSuccess(true);
        setTimeout(() => setTranslationSuccess(false), 2000);
      } else {
        setError("Clipboard API not supported.");
      }
    } catch (err) {
      setError("Failed to copy text.", err);
    }
  };

  const fetchWordDefinitions = async (word) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DICTIONARY_API_URL}/${word}`
      );
      if (!response.ok) {
        throw new Error("Word not found");
      }
      const data = await response.json();
      return data[0]?.meanings || [];
    } catch (error) {
      console.error("Dictionary API error:", error);
      return [];
    }
  };

  const openGoogleTranslate = () => {
    const text = currentLanguage === "en" ? inputText : translatedText;
    const sourceLang = currentLanguage === "en" ? "en" : "bn";
    const targetLang = currentLanguage === "en" ? "bn" : "en";
    const url = `${import.meta.env.VITE_TRANSLATE}/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Main translation function with improved error handling and auto-redirect
  const translateText = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to translate");
      return;
    }

    // Check word count for auto-redirect to Google Translate
    const wordCount = countWords(inputText);
    
    if (wordCount > 100) {
      setError(`Text contains ${wordCount} words (>100). Redirecting to Google Translate for better accuracy...`);
      setTimeout(() => {
        openGoogleTranslate();
      }, 2000);
      return;
    }

    setIsTranslating(true);
    setError("");
    setTranslationSuccess(false);
    setWordDefinitions([]);

    try {
      let translated = "";
      const fromLang = currentLanguage === "en" ? "en" : "bn";
      const toLang = currentLanguage === "en" ? "bn" : "en";

      // Try online translation first if online
      if (isOnline) {
        const translationMethods = [
          { name: "mymemory", func: translateWithMyMemory },
          { name: "libretranslate", func: translateWithLibreTranslate },
          { name: "google", func: translateWithGoogle }
        ];

        let selectedMethod = translationMethods.find(m => m.name === translationMethod);
        if (!selectedMethod) {
          selectedMethod = translationMethods[0]; // Default to MyMemory
        }

        let success = false;
        let lastError = "";

        // Try selected method first
        try {
          translated = await selectedMethod.func(inputText, fromLang, toLang);
          success = true;
        } catch (error) {
          lastError = error.message;
          console.error(`${selectedMethod.name} failed:`, error);
        }

        // If selected method fails, try other methods
        if (!success) {
          for (const method of translationMethods) {
            if (method.name === selectedMethod.name) continue;
            
            try {
              translated = await method.func(inputText, fromLang, toLang);
              success = true;
              setError(`${selectedMethod.name} failed, used ${method.name} instead`);
              break;
            } catch (error) {
              console.error(`${method.name} failed:`, error);
              lastError = error.message;
            }
          }
        }

        // If all online methods fail, fall back to offline
        if (!success) {
          setError(`All online translation methods failed: ${lastError}. Using offline method.`);
          translated = translateOffline(inputText);
        }
      } else {
        // Offline translation
        translated = translateOffline(inputText);
      }

      setTranslatedText(translated);
      setTranslationSuccess(true);

      // Fetch word definitions for English text
      if (currentLanguage === "en" && isOnline) {
        try {
          const words = inputText.toLowerCase().match(/\b\w+\b/g) || [];
          const uniqueWords = [...new Set(words)].slice(0, 5);

          const definitions = [];
          for (const word of uniqueWords) {
            try {
              const meanings = await fetchWordDefinitions(word);
              if (meanings.length > 0) {
                definitions.push({ word, meanings: meanings.slice(0, 2) });
              }
            } catch (err) {
                console.log(err);

            }
          }
          setWordDefinitions(definitions);
        } catch (err) {
          console.error("Error fetching definitions:", err);
        }
      }
    } catch (err) {
      console.error("Translation error:", err);
      setError(`Translation failed: ${err.message}`);
      // Try offline as last resort
      try {
        const offline = translateOffline(inputText);
        setTranslatedText(offline);
        setTranslationSuccess(true);
        setError(`Online translation failed, used offline method: ${err.message}`);
      } catch (offlineErr) {
        setError(`All translation methods failed: ${offlineErr.message}`);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    setCurrentLanguage(currentLanguage === "en" ? "bn" : "en");
    setInputText(translatedText);
    setTranslatedText(inputText);
    setWordDefinitions([]);
  };

  const startSpeech = () => {
    const textToSpeak = translatedText || inputText;

    if (!textToSpeak.trim() || !speechSupported) return;

    try {
      speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.lang = currentLanguage === "en" ? "en-US" : "bn-BD";
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

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

      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4",
        });
        setRecordedChunks([blob]);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setError("");
    } catch (err) {
      console.error("Recording error:", err);
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
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
      a.download = `translation_recording.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const testSpeech = () => {
    if (speechSupported) {
      const testText =
        currentLanguage === "en" ? "Testing English speech" : "বাংলা পরীক্ষা";
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.lang = currentLanguage === "en" ? "en-US" : "bn-BD";
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      speechSynthesis.speak(utterance);
    }
  };

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      import.meta.env.VITE_PDF_GENERATOR_URL;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          import.meta.env.VITE_PDF_GENERATOR_CDN_URL;
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Get current word count
  const currentWordCount = countWords(inputText);

  
  if(!currentWordCount)
  {
    console.log("issues by the ", currentWordCount)

  }

  if(!wordDefinitions.length){
    console.log("word defination error")
  }
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              English ⇄ Bangla Translator
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Convert text between English and Bangla with speech synthesis
            </p>

            <div className="flex items-center justify-center gap-4 text-sm">
              {isMobile && (
                <div className="flex items-center gap-2 text-blue-300">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile optimized</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-300">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Translation Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Translation Method:
                </label>
                <select
                  value={translationMethod}
                  onChange={(e) => setTranslationMethod(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600">
                  <option value="mymemory">MyMemory API (Online)</option>
                  <option value="google">Google Translate (Online)</option>
                  <option value="offline">Basic Offline Translation</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">
                  Current Language:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-white">
                    {currentLanguage === "en" ? "English" : "বাংলা"}
                  </span>
                  <button
                    onClick={swapLanguages}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors">
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">
                  LibreTranslate URL:
                </label>
                <input
                  type="url"
                  value={libreTranslateUrl}
                  onChange={(e) => setLibreTranslateUrl(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 text-sm"
                  placeholder="Optional custom URL"
                />
              </div>
            </div>
          </div>

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
           
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Type className="w-6 h-6" />
                {currentLanguage === "en" ? "English Text" : "বাংলা টেক্সট"}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={pasteText}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <Copy className="w-4 h-4" />
                    Paste
                  </button>
                  <button
                    onClick={clearText}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                  <button
                    onClick={openGoogleTranslate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4" />
                    Google Translate
                  </button>
                </div>

                {/* PDF Upload Section */}
                <div className="bg-black/20 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    PDF Upload
                  </h3>

                  <div className="space-y-3">
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={isPdfProcessing}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                        {isPdfProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {isPdfProcessing ? "Processing..." : "Upload PDF"}
                      </button>

                      {uploadedPdfName && (
                        <button
                          onClick={() => setShowPdfText(!showPdfText)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                          <Book className="w-4 h-4" />
                          {showPdfText ? "Hide" : "Show"} PDF Text
                        </button>
                      )}

                      {uploadedPdfName && (
                        <button
                          onClick={clearPdfData}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                          <X className="w-4 h-4" />
                          Clear PDF
                        </button>
                      )}
                    </div>

                    {uploadedPdfName && (
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-200 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>PDF loaded: {uploadedPdfName}</span>
                        </div>
                      </div>
                    )}

                    {showPdfText && pdfText && (
                      <div className="bg-gray-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <div className="text-gray-300 text-sm whitespace-pre-wrap">
                          {pdfText.substring(0, 500)}...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={handleTextChange}
                    placeholder={
                      currentLanguage === "en"
                        ? "Enter English text here or upload a PDF file..."
                        : "এখানে বাংলা টেক্সট লিখুন বা PDF ফাইল আপলোড করুন..."
                    }
                    className="w-full h-80 bg-black/20 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
                    {inputText.length} characters
                  </div>
                </div>

                <div className="flex gap-2">
                                <button
                                  onClick={translateText}
                                  disabled={isTranslating || !inputText.trim()}
                                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  {isTranslating ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Languages className="w-5 h-5" />
                                  )}
                                  {isTranslating ? 'Translating...' : 'Translate'}
                                </button>
                              </div>
               {/* Quick Examples */}
                            <div className="bg-black/20 rounded-lg p-4">
                              <h3 className="text-white font-semibold mb-2">Quick Examples:</h3>
                              <div className="space-y-2">
                                {currentLanguage === 'en' ? (
                                  <>
                                    <button
                                      onClick={() => setInputText("Hello! How are you today? I hope you are doing well.")}
                                      className="w-full text-left text-gray-300 hover:text-white text-sm p-2 hover:bg-white/10 rounded transition-colors"
                                    >
                                      Basic greeting
                                    </button>
                                    <button
                                      onClick={() => setInputText("Thank you for your help. I really appreciate it.")}
                                      className="w-full text-left text-gray-300 hover:text-white text-sm p-2 hover:bg-white/10 rounded transition-colors"
                                    >
                                      Gratitude expression
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setInputText("আসসালামু আলাইকুম। আপনি কেমন আছেন?")}
                                      className="w-full text-left text-gray-300 hover:text-white text-sm p-2 hover:bg-white/10 rounded transition-colors"
                                    >
                                      সাধারণ অভিবাদন
                                    </button>
                                    <button
                                      onClick={() => setInputText("আপনার সাহায্যের জন্য অনেক ধন্যবাদ।")}
                                      className="w-full text-left text-gray-300 hover:text-white text-sm p-2 hover:bg-white/10 rounded transition-colors"
                                    >
                                      কৃতজ্ঞতা প্রকাশ
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
              
                       
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                      <Languages className="w-6 h-6" />
                                      {currentLanguage === 'en' ? 'বাংলা অনুবাদ' : 'English Translation'}
                                    </h2>
                        
                                    <div className="space-y-4">
                                      <div className="flex gap-2 flex-wrap">
                                        <button
                                          onClick={copyTranslation}
                                          disabled={!translatedText}
                                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                        >
                                          {translationSuccess ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : (
                                            <Copy className="w-4 h-4" />
                                          )}
                                          {translationSuccess ? 'Copied!' : 'Copy'}
                                        </button>
                                      </div>
                        
                        
                                      <div className="relative">
                                        <textarea
                                          value={translatedText}
                                          readOnly
                                          placeholder={currentLanguage === 'en' ? 
                                            "Bangla translation will appear here..." : 
                                            "English translation will appear here..."}
                                          className="w-full h-80 bg-black/20 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none"
                                        />
                                        <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
                                          {translatedText.length} characters
                                        </div>
                                      </div>
                        
                                      {/* Speech Controls */}
                                      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                          <Volume2 className="w-5 h-5" />
                                          Speech Controls
                                        </h3>
                        
                                        <div className="space-y-3">
                                          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-blue-200 text-sm">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-3 h-3 rounded-full ${speechSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                              <span>
                                                Speech: {speechSupported ? `Ready (${voices.length} voices)` : 'Not Supported'}
                                              </span>
                                            </div>
                                          </div>
                        
                                          <button
                                            onClick={testSpeech}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors text-sm"
                                          >
                                            Test Speech
                                          </button>
                        
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
                                                disabled={!translatedText.trim() || !speechSupported}
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
                                            <h4 className="text-white font-semibold mb-3">Record Audio</h4>
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
                                  </div>
                      </div>
              
                     {/* Translation Status & Help */}
                             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Status Bar */}
                               <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                 <h3 className="text-lg font-bold text-white mb-3">Status</h3>
                                 <div className="space-y-2 text-sm">
                                   <div className="flex items-center justify-between text-gray-300">
                                     <span>Speech Status:</span>
                                     <span className={`flex items-center gap-2 ${
                                       isPlaying ? 'text-green-400' : 'text-gray-400'
                                     }`}>
                                       {isPlaying ? (isPaused ? "Paused" : "Playing") : "Ready"}
                                       {isRecording && (
                                         <span className="flex items-center gap-1">
                                           <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                           Recording
                                         </span>
                                       )}
                                     </span>
                                   </div>
                                   <div className="flex items-center justify-between text-gray-300">
                                     <span>Translation Method:</span>
                                     <span className="flex items-center gap-2">
                                       {translationMethod === 'libretranslate' ? (
                                         <><Globe className="w-4 h-4" />LibreTranslate</>
                                       ) : (
                                         <><Wifi className="w-4 h-4" />Offline</>
                                       )}
                                     </span>
                                   </div>
                                   <div className="flex items-center justify-between text-gray-300">
                                     <span>Current Language:</span>
                                     <span>{currentLanguage === 'en' ? 'English → Bangla' : 'বাংলা → English'}</span>
                                   </div>
                                 </div>
                               </div>
                     
                               {/* Help & Tips */}
                               <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                 <h3 className="text-lg font-bold text-white mb-3">Help & Tips</h3>
                                 <div className="space-y-2 text-sm text-gray-300">
                                   <div className="flex items-start gap-2">
                                     <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                     <span>Use LibreTranslate for accurate online translation</span>
                                   </div>
                                   <div className="flex items-start gap-2">
                                     <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                     <span>Offline mode provides basic word-to-word translation</span>
                                   </div>
                                   <div className="flex items-start gap-2">
                                     <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                     <span>Click language swap button to reverse translation</span>
                                   </div>
                                   <div className="flex items-start gap-2">
                                     <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                     <span>Use Google Translate button for additional verification</span>
                                   </div>
                                   <div className="flex items-start gap-2">
                                     <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                     <span>For best speech synthesis, select appropriate voice language</span>
                                   </div>
                                 </div>
                               </div>
                             </div>
              
                       {/* Alternative Translation Services */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-3">Alternative Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">LibreTranslate</h4>
              <p className="text-gray-300 text-sm mb-3">
                Free, open-source translation API with good accuracy
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-400">
                  {isOnline ? 'Available' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Google Translate</h4>
              <p className="text-gray-300 text-sm mb-3">
                Opens in new tab for manual translation and verification
              </p>
              <button
                onClick={openGoogleTranslate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
              >
                Open Google Translate
              </button>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Offline Mode</h4>
              <p className="text-gray-300 text-sm mb-3">
                Basic word mapping for common English-Bangla phrases
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">
                  {/* {Object.keys(basicTranslations).length} words available */}
                </span>
              </div>
            </div>
          </div>
        </div>
                    </div>
                  </div>
                    </>
                );
              };
              
              export default PdfConverter;