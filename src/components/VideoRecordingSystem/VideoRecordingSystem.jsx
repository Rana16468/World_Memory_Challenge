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
  Clock,
  Video,
  VideoOff,
  Volume2,
  Maximize,
  Minimize,
} from 'lucide-react';

const VideoRecordingSystem = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingMode, setRecordingMode] = useState('screen');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recordings, setRecordings] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [frameRate, setFrameRate] = useState('30');
  const [pipPosition, setPipPosition] = useState('bottom-right');
  const [audioSource, setAudioSource] = useState('microphone');
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const intervalRef = useRef(null);
  const chunksRef = useRef([]);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioLevelIntervalRef = useRef(null);
  const recordingTimeRef = useRef(0);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused]);

  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, []);

  const cleanupAll = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    clearInterval(intervalRef.current);
    stopAllStreams();
  };

  const stopAllStreams = () => {
    [screenStreamRef, cameraStreamRef, micStreamRef].forEach(ref => {
      if (ref.current) {
        ref.current.getTracks().forEach(t => t.stop());
        ref.current = null;
      }
    });
  };

  // FIX 2: Audio monitoring using interval instead of stale closure in rAF
  const setupAudioMonitoring = (stream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
        setAudioLevel(Math.round((avg / 255) * 100));
      }, 100);
    } catch (err) {
      console.error('Audio monitoring setup failed:', err);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getVideoConstraints = () => {
    const res = { '720p': { width: 1280, height: 720 }, '1080p': { width: 1920, height: 1080 }, '4K': { width: 3840, height: 2160 } };
    return { ...res[quality], frameRate: parseInt(frameRate) };
  };

  // FIX 1 & 4: Proper audio mixing — returns a single MediaStream with mixed audio
  const buildMixedAudioStream = (audioOnlyStreams) => {
    const trackedStreams = audioOnlyStreams.filter(s => s && s.getAudioTracks().length > 0);
    if (trackedStreams.length === 0) return null;
    if (trackedStreams.length === 1) return trackedStreams[0];

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const dest = ctx.createMediaStreamDestination();
      trackedStreams.forEach(stream => {
        const src = ctx.createMediaStreamSource(stream);
        // FIX 4: Use gain of 0.8 per source to avoid clipping, not divided by count
        const gain = ctx.createGain();
        gain.gain.value = 0.8;
        src.connect(gain);
        gain.connect(dest);
      });
      // Store the extra context so it can be closed later
      audioContextRef.current = ctx;
      return dest.stream;
    } catch (err) {
      console.error('Audio mix error:', err);
      return trackedStreams[0];
    }
  };

  // FIX 3: combineStreams now accepts pre-mixed audio stream and adds it to output
  const combineStreams = (screenStream, cameraStream, canvas, mixedAudioStream) => {
    const ctx = canvas.getContext('2d');
    const screenVideo = document.createElement('video');
    const cameraVideo = document.createElement('video');
    screenVideo.srcObject = screenStream;
    cameraVideo.srcObject = cameraStream;
    screenVideo.muted = true;
    cameraVideo.muted = true;
    screenVideo.play().catch(() => {});
    cameraVideo.play().catch(() => {});

    const vc = getVideoConstraints();
    canvas.width = vc.width;
    canvas.height = vc.height;

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (screenVideo.readyState >= 2) {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }
      if (cameraVideo.readyState >= 2) {
        const pipSize = Math.min(canvas.width, canvas.height) * 0.25;
        const margin = 20;
        let px, py;
        switch (pipPosition) {
          case 'top-left':    px = margin; py = margin; break;
          case 'top-right':   px = canvas.width - pipSize - margin; py = margin; break;
          case 'bottom-left': px = margin; py = canvas.height - pipSize - margin; break;
          default:            px = canvas.width - pipSize - margin; py = canvas.height - pipSize - margin;
        }
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.strokeRect(px - 2, py - 2, pipSize + 4, pipSize + 4);
        ctx.drawImage(cameraVideo, px, py, pipSize, pipSize);
      }
      animationRef.current = requestAnimationFrame(drawFrame);
    };

    const canvasVideoStream = canvas.captureStream(parseInt(frameRate));

    // FIX 3: Build final stream combining canvas video + mixed audio tracks explicitly
    const finalStream = new MediaStream();
    canvasVideoStream.getVideoTracks().forEach(t => finalStream.addTrack(t));
    if (mixedAudioStream) {
      mixedAudioStream.getAudioTracks().forEach(t => finalStream.addTrack(t));
    }

    const waitAndDraw = () => {
      if (screenVideo.readyState >= 2 && cameraVideo.readyState >= 2) {
        drawFrame();
      } else {
        setTimeout(waitAndDraw, 100);
      }
    };
    waitAndDraw();

    return finalStream;
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      recordingTimeRef.current = 0;
      setStatusMsg('Starting...');

      let finalStream = null;
      const audioOnlyStreams = []; // FIX 5: collect audio streams separately, never double-add

      // ── SCREEN MODE ─────────────────────────────────────────────────────────
      if (recordingMode === 'screen') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: getVideoConstraints(),
          audio: false, // FIX 5: always capture audio separately for clean mixing
        });
        screenStreamRef.current = screenStream;

        if (audioEnabled && (audioSource === 'system' || audioSource === 'both')) {
          // Try to get system audio via display media (supported on some browsers)
          try {
            const sysAudio = await navigator.mediaDevices.getDisplayMedia({ video: false, audio: true });
            audioOnlyStreams.push(sysAudio);
          } catch {
            setStatusMsg('System audio unavailable, continuing...');
          }
        }

        // Build a clean video-only stream from screen, then add audio below
        finalStream = new MediaStream(screenStream.getVideoTracks());
      }

      // ── CAMERA MODE ─────────────────────────────────────────────────────────
      else if (recordingMode === 'camera') {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled ? getVideoConstraints() : false,
          audio: false,
        });
        cameraStreamRef.current = camStream;
        finalStream = new MediaStream(camStream.getVideoTracks());
      }

      // ── BOTH MODE ────────────────────────────────────────────────────────────
      else if (recordingMode === 'both') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: getVideoConstraints(),
          audio: false,
        });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled ? { width: 640, height: 480 } : false,
          audio: false,
        });
        screenStreamRef.current = screenStream;
        cameraStreamRef.current = cameraStream;

        // We resolve audio first so combineStreams can embed it
        if (audioEnabled && (audioSource === 'microphone' || audioSource === 'both')) {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
              video: false,
            });
            micStreamRef.current = micStream;
            audioOnlyStreams.push(micStream);
          } catch (e) {
            console.warn('Mic unavailable:', e);
          }
        }

        const mixedAudio = buildMixedAudioStream(audioOnlyStreams);
        const canvas = canvasRef.current;
        finalStream = combineStreams(screenStream, cameraStream, canvas, mixedAudio);

        if (videoRef.current) videoRef.current.srcObject = finalStream;

        // Audio monitoring on mic or first audio stream
        const monitorStream = micStreamRef.current || (audioOnlyStreams[0] ?? null);
        if (monitorStream) setupAudioMonitoring(monitorStream);

        setIsRecording(true);
        setRecordingTime(0);
        setStatusMsg('');
        startMediaRecorder(finalStream);
        return; // Both mode exits here; everything is already wired
      }

      // ── AUDIO for SCREEN / CAMERA modes ─────────────────────────────────────
      if (audioEnabled) {
        if (audioSource === 'microphone' || audioSource === 'both') {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
              video: false,
            });
            micStreamRef.current = micStream;
            audioOnlyStreams.push(micStream);
          } catch (e) {
            console.warn('Mic unavailable:', e);
            setStatusMsg('Microphone unavailable — recording video only.');
          }
        }

        // FIX 1: Build mixed audio and add tracks once to finalStream
        const mixedAudio = buildMixedAudioStream(audioOnlyStreams);
        if (mixedAudio && finalStream) {
          mixedAudio.getAudioTracks().forEach(t => finalStream.addTrack(t));
        }

        const monitorStream = audioOnlyStreams[0] ?? null;
        if (monitorStream) setupAudioMonitoring(monitorStream);
      }

      if (!finalStream) throw new Error('Could not create media stream.');

      if (videoRef.current) videoRef.current.srcObject = finalStream;

      setIsRecording(true);
      setRecordingTime(0);
      setStatusMsg('');
      startMediaRecorder(finalStream);

    } catch (err) {
      console.error('startRecording error:', err);
      setStatusMsg('');
      alert(`Recording error: ${err.message}`);
    }
  };

  const startMediaRecorder = (stream) => {
    const mimeTypes = [
      'video/webm; codecs=vp9,opus',
      'video/webm; codecs=vp8,opus',
      'video/webm',
    ];
    const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
    const bitrate = quality === '4K' ? 8_000_000 : quality === '1080p' ? 5_000_000 : 2_500_000;

    const options = { mimeType, videoBitsPerSecond: bitrate, audioBitsPerSecond: 128_000 };
    const recorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordings(prev => [...prev, {
        id: Date.now(),
        url,
        blob,
        duration: formatTime(recordingTimeRef.current),
        timestamp: new Date().toLocaleString(),
        mode: recordingMode,
        quality,
        audioSource,
      }]);
      setAudioLevel(0);
    };

    recorder.start(100);
  };

  const stopRecording = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopAllStreams();

    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    setAudioLevel(0);

    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const downloadRecording = (rec) => {
    const a = document.createElement('a');
    a.href = rec.url;
    a.download = `recording_${rec.timestamp.replace(/[/,: ]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteRecording = (id) => setRecordings(prev => prev.filter(r => r.id !== id));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-2">
      <div className="max-w-7xl mx-auto">
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Header Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">

            {/* Title + Status */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Video Studio Pro
              </h1>
              {statusMsg && (
                <span className="text-xs text-yellow-300 animate-pulse">{statusMsg}</span>
              )}
              {isRecording && (
                <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                  {isPaused && <span className="ml-1 text-yellow-300">PAUSED</span>}
                </div>
              )}
            </div>

            {/* Mode */}
            <div className="flex bg-slate-700 rounded p-0.5">
              {[['screen', 'Screen', Monitor], ['camera', 'Camera', Camera], ['both', 'Both', Video]].map(([val, label, Icon]) => (
                <button
                  key={val}
                  onClick={() => setRecordingMode(val)}
                  disabled={isRecording}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                    recordingMode === val
                      ? val === 'both' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {/* Audio Source */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">Audio:</span>
              <select
                value={audioSource}
                onChange={e => setAudioSource(e.target.value)}
                disabled={isRecording}
                className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
              >
                <option value="microphone">Microphone</option>
                <option value="system">System</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Audio Level */}
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

            {/* PiP position */}
            {recordingMode === 'both' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">PiP:</span>
                <select
                  value={pipPosition}
                  onChange={e => setPipPosition(e.target.value)}
                  disabled={isRecording}
                  className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
            )}

            {/* Quality */}
            <div className="flex items-center gap-1">
              <select
                value={quality}
                onChange={e => setQuality(e.target.value)}
                disabled={isRecording}
                className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
              <select
                value={frameRate}
                onChange={e => setFrameRate(e.target.value)}
                disabled={isRecording}
                className="bg-slate-700 rounded px-2 py-1 text-xs text-white border border-slate-600"
              >
                <option value="30">30fps</option>
                <option value="60">60fps</option>
              </select>
            </div>

            {/* Audio/Video toggles */}
            <div className="flex gap-1">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                disabled={isRecording}
                className={`p-1.5 rounded transition-colors ${audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                title={audioEnabled ? 'Mute audio' : 'Enable audio'}
              >
                {audioEnabled ? <Mic size={12} /> : <MicOff size={12} />}
              </button>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                disabled={isRecording}
                className={`p-1.5 rounded transition-colors ${videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                title={videoEnabled ? 'Disable video' : 'Enable video'}
              >
                {videoEnabled ? <Video size={12} /> : <VideoOff size={12} />}
              </button>
            </div>

            {/* Record Controls */}
            <div className="flex items-center gap-1">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-medium"
                >
                  <Play size={12} /> Record
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
                    <Square size={12} /> Stop
                  </button>
                </div>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 bg-slate-700 rounded hover:bg-slate-600 transition-colors ml-1"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-3">

          {/* Preview */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Monitor size={14} />
                <h2 className="text-sm font-medium">
                  Live Preview {recordingMode === 'both' ? '(Screen + Camera)' : `(${recordingMode})`}
                </h2>
              </div>
              {recordingMode === 'both' && (
                <span className="text-xs text-slate-400">Camera: {pipPosition.replace('-', ' ')}</span>
              )}
            </div>
            <div className="relative bg-black rounded overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video ref={videoRef} autoPlay muted className="w-full h-full object-contain" />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera size={32} className="mx-auto mb-1 text-slate-500" />
                    <p className="text-xs text-slate-400">No active recording</p>
                    <p className="text-xs text-slate-500 mt-1">{recordingMode} mode • Audio: {audioEnabled ? audioSource : 'disabled'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recordings */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
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
                  {recordings.map(rec => (
                    <div key={rec.id} className="bg-slate-700 rounded p-2 border border-slate-600">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`p-1 rounded flex-shrink-0 ${
                            rec.mode === 'both' ? 'bg-green-600' : rec.mode === 'screen' ? 'bg-blue-600' : 'bg-purple-600'
                          }`}>
                            <Video size={10} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{rec.timestamp}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {rec.duration} · {rec.mode} · {rec.quality} · 🎙 {rec.audioSource}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => downloadRecording(rec)}
                            className="bg-blue-600 hover:bg-blue-700 p-1 rounded transition-colors"
                            title="Download"
                          >
                            <Download size={10} />
                          </button>
                          <button
                            onClick={() => deleteRecording(rec.id)}
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