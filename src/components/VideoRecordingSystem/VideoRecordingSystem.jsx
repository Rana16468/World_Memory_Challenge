import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Monitor, 
  Camera, 
  Mic, 
  MicOff, 
  Download, 
  Settings,
  Clock,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Share
} from 'lucide-react';

const VideoRecordingSystem = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingMode, setRecordingMode] = useState('screen'); // 'screen', 'camera', 'both'
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recordings, setRecordings] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [frameRate, setFrameRate] = useState('30fps');
  const [pipPosition, setPipPosition] = useState('bottom-right'); // Position for picture-in-picture
  const [audioSource, setAudioSource] = useState('system'); // 'system', 'microphone', 'both'
  const [audioLevel, setAudioLevel] = useState(0);
  
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const intervalRef = useRef(null);
  const chunksRef = useRef([]);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioAnalyserRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  // Audio level monitoring
  const setupAudioMonitoring = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      audioAnalyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyser && isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(Math.round((average / 255) * 100));
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video constraints based on quality
  const getVideoConstraints = () => {
    const constraints = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4K': { width: 3840, height: 2160 }
    };
    return {
      ...constraints[quality],
      frameRate: parseInt(frameRate)
    };
  };

  // Mix multiple audio streams
  const mixAudioStreams = (streams) => {
    if (streams.length === 0) return null;
    if (streams.length === 1) return streams[0];

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      const gainNodes = [];

      streams.forEach((stream, index) => {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          const source = audioContext.createMediaStreamSource(stream);
          const gainNode = audioContext.createGain();
          
          // Adjust gain to prevent distortion when mixing
          gainNode.gain.value = 1.0 / streams.length;
          
          source.connect(gainNode);
          gainNode.connect(destination);
          gainNodes.push(gainNode);
        }
      });

      return destination.stream;
    } catch (error) {
      console.error('Error mixing audio streams:', error);
      // Fallback to first stream with audio
      return streams.find(stream => stream.getAudioTracks().length > 0) || streams[0];
    }
  };

  // Combine screen and camera streams using canvas
  const combineStreams = (screenStream, cameraStream, canvas) => {
    const ctx = canvas.getContext('2d');
    const screenVideo = document.createElement('video');
    const cameraVideo = document.createElement('video');
    
    screenVideo.srcObject = screenStream;
    cameraVideo.srcObject = cameraStream;
    
    screenVideo.play();
    cameraVideo.play();
    
    const videoConstraints = getVideoConstraints();
    canvas.width = videoConstraints.width;
    canvas.height = videoConstraints.height;
    
    const drawFrame = () => {
      if (!isRecording) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw screen sharing (main content)
      if (screenVideo.readyState === 4) {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }
      
      // Draw camera feed (picture-in-picture)
      if (cameraVideo.readyState === 4) {
        const pipSize = Math.min(canvas.width, canvas.height) * 0.25; // 25% of main video
        const margin = 20;
        
        let pipX, pipY;
        
        switch (pipPosition) {
          case 'top-left':
            pipX = margin;
            pipY = margin;
            break;
          case 'top-right':
            pipX = canvas.width - pipSize - margin;
            pipY = margin;
            break;
          case 'bottom-left':
            pipX = margin;
            pipY = canvas.height - pipSize - margin;
            break;
          case 'bottom-right':
          default:
            pipX = canvas.width - pipSize - margin;
            pipY = canvas.height - pipSize - margin;
            break;
        }
        
        // Draw PiP border
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipX - 2, pipY - 2, pipSize + 4, pipSize + 4);
        
        // Draw camera video
        ctx.drawImage(cameraVideo, pipX, pipY, pipSize, pipSize);
      }
      
      animationRef.current = requestAnimationFrame(drawFrame);
    };
    
    // Start drawing when both videos are ready
    const checkReady = () => {
      if (screenVideo.readyState === 4 && cameraVideo.readyState === 4) {
        drawFrame();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
    
    // Return canvas stream
    return canvas.captureStream(parseInt(frameRate));
  };

  // Start recording
  const startRecording = async () => {
    try {
      chunksRef.current = [];
      let finalStream;
      let audioStreams = [];

      if (recordingMode === 'screen') {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: getVideoConstraints(),
          audio: audioEnabled && audioSource !== 'microphone'
        });
        screenStreamRef.current = finalStream;
        
        if (audioEnabled && finalStream.getAudioTracks().length > 0) {
          audioStreams.push(finalStream);
        }
      } 
      else if (recordingMode === 'camera') {
        const constraints = {
          video: videoEnabled ? getVideoConstraints() : false,
          audio: false // Handle audio separately
        };
        
        finalStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStreamRef.current = finalStream;
      } 
      else if (recordingMode === 'both') {
        // Get both streams
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: getVideoConstraints(),
          audio: audioEnabled && (audioSource === 'system' || audioSource === 'both')
        });
        
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled ? { width: 640, height: 480 } : false,
          audio: false // Handle audio separately to avoid conflicts
        });
        
        screenStreamRef.current = screenStream;
        cameraStreamRef.current = cameraStream;
        
        // Add screen audio if available
        if (audioEnabled && screenStream.getAudioTracks().length > 0) {
          audioStreams.push(screenStream);
        }
        
        // Create canvas for combining streams
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas not available for stream combination');
        }
        
        // Combine video streams
        const combinedVideoStream = combineStreams(screenStream, cameraStream, canvas);
        finalStream = combinedVideoStream;
        
        // Update preview to show combined stream
        if (videoRef.current) {
          videoRef.current.srcObject = finalStream;
        }
        
        // Also show camera preview
        if (cameraRef.current) {
          cameraRef.current.srcObject = cameraStream;
        }
      }

      // Handle microphone audio separately
      if (audioEnabled && (audioSource === 'microphone' || audioSource === 'both')) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          micStreamRef.current = micStream;
          audioStreams.push(micStream);
        } catch (micError) {
          console.warn('Could not access microphone:', micError);
          alert('Warning: Could not access microphone. Recording will continue without microphone audio.');
        }
      }

      // Mix audio streams if multiple sources
      if (audioStreams.length > 0) {
        const mixedAudioStream = mixAudioStreams(audioStreams);
        if (mixedAudioStream && finalStream) {
          // Add mixed audio tracks to final stream
          mixedAudioStream.getAudioTracks().forEach(track => {
            finalStream.addTrack(track);
          });
        }
        
        // Setup audio monitoring on the first audio stream
        setupAudioMonitoring(audioStreams[0]);
      }

      if (!finalStream) {
        throw new Error('Failed to create media stream');
      }

      // For single stream modes, update video preview
      if (recordingMode !== 'both' && videoRef.current) {
        videoRef.current.srcObject = finalStream;
      }

      // Set up MediaRecorder with better audio codec support
      let options = {
        mimeType: 'video/webm; codecs=vp9,opus',
        videoBitsPerSecond: quality === '4K' ? 8000000 : quality === '1080p' ? 5000000 : 2500000,
        audioBitsPerSecond: 128000
      };

      // Fallback for unsupported codec combinations
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm; codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
        }
      }

      mediaRecorderRef.current = new MediaRecorder(finalStream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newRecording = {
          id: Date.now(),
          url: url,
          blob: blob,
          duration: formatTime(recordingTime),
          timestamp: new Date().toLocaleString(),
          mode: recordingMode,
          quality: quality,
          audioSource: audioSource
        };
        setRecordings(prev => [...prev, newRecording]);
        setAudioLevel(0);
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(`Error starting recording: ${error.message}. Please ensure you have granted necessary permissions.`);
    }
  };

  // Stop recording
  const stopRecording = () => {
    // Stop animation frame for combined mode
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all streams
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioLevel(0);
    
    // Clear video previews
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (cameraRef.current) {
      cameraRef.current.srcObject = null;
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  // Download recording
  const downloadRecording = (recording) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `recording_${recording.timestamp.replace(/[/,:]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Delete recording
  const deleteRecording = (id) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-2">
      <div className="max-w-7xl mx-auto">
        {/* Hidden canvas for stream combination */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {/* Compact Header with All Controls */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-lg p-3 mb-3 border border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            {/* Title and Status */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Video Studio Pro
              </h1>
              {isRecording && (
                <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                  {isPaused && <span className="ml-1 text-yellow-300">PAUSED</span>}
                </div>
              )}
            </div>

            {/* Recording Mode */}
            <div className="flex bg-slate-700 rounded p-0.5">
              <button
                onClick={() => setRecordingMode('screen')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  recordingMode === 'screen' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                disabled={isRecording}
              >
                <Monitor size={12} />
                Screen
              </button>
              <button
                onClick={() => setRecordingMode('camera')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  recordingMode === 'camera' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                disabled={isRecording}
              >
                <Camera size={12} />
                Camera
              </button>
              <button
                onClick={() => setRecordingMode('both')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  recordingMode === 'both' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                disabled={isRecording}
              >
                <Video size={12} />
                Both
              </button>
            </div>

            {/* Audio Source Selection */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">Audio:</span>
              <select
                value={audioSource}
                onChange={(e) => setAudioSource(e.target.value)}
                className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
                disabled={isRecording}
              >
                <option value="system">System</option>
                <option value="microphone">Microphone</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Audio Level Indicator */}
            {isRecording && audioEnabled && (
              <div className="flex items-center gap-1">
                <Volume2 size={12} className="text-green-400" />
                <div className="w-16 h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      audioLevel > 70 ? 'bg-red-500' : audioLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-8">{audioLevel}%</span>
              </div>
            )}

            {/* PiP Position for Both mode */}
            {recordingMode === 'both' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">PiP:</span>
                <select
                  value={pipPosition}
                  onChange={(e) => setPipPosition(e.target.value)}
                  className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
                  disabled={isRecording}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
            )}

            {/* Quality Controls */}
            <div className="flex items-center gap-1">
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
                disabled={isRecording}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
              <select
                value={frameRate}
                onChange={(e) => setFrameRate(e.target.value)}
                className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
                disabled={isRecording}
              >
                <option value="30">30fps</option>
                <option value="60">60fps</option>
                <option value="120">120fps</option>
              </select>
            </div>

            {/* Audio/Video Toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-1.5 rounded transition-colors ${
                  audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isRecording}
              >
                {audioEnabled ? <Mic size={12} /> : <MicOff size={12} />}
              </button>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-1.5 rounded transition-colors ${
                  videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isRecording}
              >
                {videoEnabled ? <Video size={12} /> : <VideoOff size={12} />}
              </button>
            </div>

            {/* Main Recording Controls */}
            <div className="flex items-center gap-1">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-medium"
                >
                  <Play size={12} />
                  Record
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={togglePause}
                    className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1.5 rounded flex items-center gap-1 transition-colors text-xs"
                  >
                    {isPaused ? <Play size={12} /> : <Pause size={12} />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="bg-slate-600 hover:bg-slate-700 px-2 py-1.5 rounded flex items-center gap-1 transition-colors text-xs"
                  >
                    <Square size={12} />
                    Stop
                  </button>
                </div>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 bg-slate-700 rounded hover:bg-slate-600 transition-colors ml-1"
              >
                {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-3">
          {/* Video Preview */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Monitor size={14} />
                <h2 className="text-sm font-medium">
                  Live Preview {recordingMode === 'both' ? '(Combined)' : `(${recordingMode})`}
                </h2>
                {audioEnabled && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Volume2 size={10} />
                    <span>{audioSource}</span>
                  </div>
                )}
              </div>
              {recordingMode === 'both' && (
                <div className="text-xs text-slate-400">
                  Camera in {pipPosition.replace('-', ' ')}
                </div>
              )}
            </div>
            
            <div className="relative bg-black rounded overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-contain"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera size={32} className="mx-auto mb-1 text-slate-500" />
                    <p className="text-xs text-slate-400">No active recording</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {recordingMode === 'both' ? 'Screen + Camera mode selected' : `${recordingMode.charAt(0).toUpperCase() + recordingMode.slice(1)} mode selected`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Audio: {audioEnabled ? audioSource : 'disabled'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera preview for "both" mode when not recording */}
            {recordingMode === 'both' && !isRecording && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={12} />
                  <span className="text-xs text-slate-400">Camera Preview</span>
                </div>
                <div className="relative bg-black rounded overflow-hidden w-32 h-24">
                  <video
                    ref={cameraRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recordings List */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} />
              <h2 className="text-sm font-medium">Recordings ({recordings.length})</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recordings.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <Video size={24} className="mx-auto mb-1" />
                  <p className="text-xs">No recordings yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="bg-slate-700 rounded p-2 border border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`p-1 rounded flex-shrink-0 ${
                            recording.mode === 'both' ? 'bg-green-600' : 
                            recording.mode === 'screen' ? 'bg-blue-600' : 'bg-purple-600'
                          }`}>
                            <Video size={10} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs font-medium truncate">
                              Recording {recording.id}
                              {recording.mode === 'both' && <span className="text-green-400 ml-1">●</span>}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">
                              {recording.duration} • {recording.mode} • {recording.quality}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {recording.timestamp} • Audio: {recording.audioSource || 'system'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => downloadRecording(recording)}
                            className="bg-blue-600 hover:bg-blue-700 p-1 rounded transition-colors"
                            title="Download"
                          >
                            <Download size={10} />
                          </button>
                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="bg-red-600 hover:bg-red-700 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Square size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecordingSystem;