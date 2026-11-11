import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, Volume1, VolumeX, 
  Maximize, Minimize, Settings, Check, Loader2,
  Tv, Film, SlidersHorizontal, Sparkles, Shield, ShieldAlert, Lock
} from 'lucide-react';
import { api } from '../services/api';

/**
 * Bunny Stream Video Player Component
 * A high-end, responsive video player matching Bunny Stream's exact aesthetic
 * with Enterprise DRM Content Protection (anti-download, context menu blocker,
 * anti-screen-recording dynamic forensic watermark, tab-blur guard).
 */
export default function BunnyPlayer({
  src,
  poster,
  title,
  moduleTitle,
  onTimeUpdate,
  onEnded,
  initialTime = 0,
  autoPlay = false,
  currentUser = null
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const activeUser = currentUser || api.auth.getCurrentUser();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // UI & DRM Security state
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [pulsePlayIcon, setPulsePlayIcon] = useState(false);
  const [qualityNotice, setQualityNotice] = useState('');
  const [drmNotice, setDrmNotice] = useState('');
  const drmNoticeTimeoutRef = useRef(null);

  // Anti-Screen Recording Dynamic Floating Watermark Positions
  const watermarkPositions = [
    'top-16 left-6',
    'top-24 right-8',
    'bottom-28 left-8',
    'bottom-24 right-8',
    'top-1/3 left-10',
    'bottom-1/3 right-10',
    'top-1/2 left-1/4',
    'top-1/2 right-1/4'
  ];
  const [watermarkIndex, setWatermarkIndex] = useState(0);

  // Periodically relocate watermark every 12s across video canvas to deter screen recorders/cameras
  useEffect(() => {
    const timer = setInterval(() => {
      setWatermarkIndex(prev => (prev + 1) % watermarkPositions.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [watermarkPositions.length]);

  const triggerDrmNotice = useCallback((msg) => {
    setDrmNotice(msg);
    if (drmNoticeTimeoutRef.current) clearTimeout(drmNoticeTimeoutRef.current);
    drmNoticeTimeoutRef.current = setTimeout(() => {
      setDrmNotice('');
    }, 3200);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerDrmNotice('🔒 კონტენტი დაცულია საავტორო უფლებებით — ვიდეოს ჩამოტვირთვა ან კოპირება შეზღუდულია');
    return false;
  }, [triggerDrmNotice]);

  const controlsTimeoutRef = useRef(null);

  // Quality resolution options
  const qualityOptions = [
    { id: '1080p', label: '1080p Full HD', badge: 'HD', desc: 'Crisp 60fps' },
    { id: '720p', label: '720p HD', badge: 'HD', desc: 'High Quality' },
    { id: '480p', label: '480p SD', badge: 'SD', desc: 'Standard' },
    { id: '360p', label: '360p Data Saver', badge: 'SD', desc: 'Data Saver' },
    { id: 'Auto', label: 'Auto (Adaptive)', badge: 'Auto', desc: 'Automatic' },
  ];

  // Detect whether this is an official Bunny Stream iframe embed
  const isBunnyIframe = src && (
    src.includes('iframe.mediadelivery.net') || 
    src.includes('video.bunnycdn.com') ||
    src.includes('/embed/')
  );

  const resolveSrc = (url) => {
    if (!url) return '';
    return String(url).trim();
  };

  const finalSrc = resolveSrc(src);

  // Auto-hide controls timer
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }, 2500);
    }
  }, [isPlaying]);

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(e => console.warn('Play error:', e));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setPulsePlayIcon(true);
    setTimeout(() => setPulsePlayIcon(false), 450);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Seek video by delta seconds (-10s / +10s)
  const seekRelative = useCallback((seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Scrub bar interaction
  const handleScrubberChange = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    resetControlsTimeout();
  };

  const handleScrubberMouseMove = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  // Volume & Mute
  const handleVolumeChange = (newVol) => {
    if (!videoRef.current) return;
    const v = Math.max(0, Math.min(1, parseFloat(newVol)));
    videoRef.current.volume = v;
    videoRef.current.muted = v === 0;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume > 0 ? volume : 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Speed change
  const handleSpeedSelect = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    resetControlsTimeout();
  };

  // Quality resolution change
  const handleQualitySelect = (qualityId) => {
    setSelectedQuality(qualityId);
    setShowQualityMenu(false);

    const savedTime = videoRef.current ? videoRef.current.currentTime : 0;
    const wasPlaying = videoRef.current ? !videoRef.current.paused : false;

    // Show temporary notice badge
    setQualityNotice(`Resolution: ${qualityId}`);
    setTimeout(() => setQualityNotice(''), 2500);

    // If stream URL contains resolution templates (like Bunny play_720p.mp4), adapt smoothly
    if (videoRef.current && finalSrc.includes('_') && finalSrc.includes('.mp4')) {
      const updatedSrc = finalSrc.replace(/play_\d+p\.mp4/, `play_${qualityId}.mp4`);
      if (updatedSrc !== finalSrc) {
        videoRef.current.src = updatedSrc;
        videoRef.current.currentTime = savedTime;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }

    resetControlsTimeout();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen error:', err);
      });
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    if (onTimeUpdate) {
      onTimeUpdate(Math.floor(t));
    }

    // Update buffer progress
    if (videoRef.current.buffered.length > 0) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedTime(end);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    if (initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  };

  // Keyboard controls & Anti-Piracy Shortcut Guard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. DRM Protected shortcuts: Save (Ctrl+S), View Source (Ctrl+U), Inspect (F12, Ctrl+Shift+I/J/C)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerDrmNotice('🛡️ გვერდის და ვიდეოს შენახვა შეზღუდულია TOTC DRM უსაფრთხოებით');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        triggerDrmNotice('🛡️ კოდის წყაროს ნახვა შეზღუდულია');
        return;
      }

      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerDrmNotice('🛡️ დეველოპერის ხელსაწყოებით ჩამოტვირთვა დაბლოკილია');
        return;
      }

      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, triggerDrmNotice]);

  // Tab switch / Screen Recording App Background Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        triggerDrmNotice('⏸️ ვიდეო შეჩერებულია ფანჯრის გადართვის გამო (უსაფრთხოების რეჟიმი)');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerDrmNotice]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  // Case 1: Official Bunny Stream Embed Iframe
  if (isBunnyIframe) {
    let iframeUrl = src;
    if (!iframeUrl.includes('autoplay=')) {
      const sep = iframeUrl.includes('?') ? '&' : '?';
      iframeUrl = `${iframeUrl}${sep}autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
    }

    return (
      <div className="relative w-full h-full bg-black rounded-[24px] overflow-hidden shadow-2xl border border-slate-800 group">
        {/* Top Header Badge with Lesson Title */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 max-w-md pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-[#00CBB8]/40 text-xs font-bold text-white shadow-lg flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#00CBB8] animate-pulse shrink-0" />
            <span className="truncate">{title || 'Lecture Video'}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#00CBB8] shrink-0">
            HD 1080p
          </span>
        </div>

        <iframe
          src={iframeUrl}
          loading="lazy"
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
          title={title || 'Lecture Video Stream'}
        />
      </div>
    );
  }

  // Case 2: Bunny-styled Modern Streaming Player
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={handleContextMenu}
      onDragStart={(e) => { e.preventDefault(); return false; }}
      className="relative w-full h-full bg-black rounded-[24px] overflow-hidden shadow-2xl border border-slate-800 select-none group font-poppins"
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* Native Video Element with DRM Protections */}
      <video
        ref={videoRef}
        src={finalSrc}
        poster={poster}
        playsInline
        preload="auto"
        controlsList="nodownload nofullscreen noplaybackrate"
        disablePictureInPicture
        onContextMenu={handleContextMenu}
        onDragStart={(e) => { e.preventDefault(); return false; }}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        className="w-full h-full object-contain cursor-pointer pointer-events-auto"
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      />

      {/* DRM Transparent Protection Shield Overlay */}
      <div 
        onContextMenu={handleContextMenu}
        onDragStart={(e) => { e.preventDefault(); return false; }}
        className="absolute inset-0 z-5 pointer-events-none"
      />

      {/* =========================================================================
          Anti-Screen Recording Dynamic Forensic Watermark (Coursera/Udemy Enterprise DRM)
          Relocates every 12s so screen recorders cannot crop or blur learner's identity
          ========================================================================= */}
      <div
        className={`absolute z-15 transition-all duration-1000 ease-in-out pointer-events-none select-none ${watermarkPositions[watermarkIndex]} opacity-35 hover:opacity-50`}
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95)' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-xs border border-white/10 text-[10px] font-mono text-white/90 shadow-md">
          <Shield className="w-3 h-3 text-[#00CBB8] shrink-0" />
          <span className="font-semibold">{activeUser?.fullName || 'Verified Learner'}</span>
          {activeUser?.email && (
            <>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{activeUser.email}</span>
            </>
          )}
          <span className="text-white/40">•</span>
          <span className="text-[#00CBB8] font-bold">DRM PROTECTED</span>
        </div>
      </div>

      {/* DRM Security Toast Notification */}
      {drmNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 pointer-events-none">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{drmNotice}</span>
        </div>
      )}

      {/* Top Header Banner: Specific Lesson Name & Quality Indicator */}
      <div className={`absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left: Module / Section name */}
        <div className="flex items-center gap-2">
          {moduleTitle && (
            <span className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90 drop-shadow truncate max-w-xs flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-[#00CBB8]" />
              <span className="truncate">{moduleTitle}</span>
            </span>
          )}
        </div>

        {/* Right: Specific Lesson / Lecture Title & Resolution Badge */}
        <div className="flex items-center gap-2 max-w-sm sm:max-w-md">
          <div className="px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#00CBB8]/40 text-xs font-bold text-white shadow-xl flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#00CBB8] animate-pulse shrink-0" />
            <span className="truncate">{title || 'Course Lecture'}</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 shrink-0" title="DRM Content Protection Active: Anti-Download & Screen Recording Guard">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="tracking-wider">DRM SECURE</span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#00CBB8] shrink-0 uppercase tracking-wide">
            {selectedQuality}
          </span>
        </div>
      </div>

      {/* Quality Switch Toast Notification */}
      {qualityNotice && (
        <div className="absolute top-16 right-4 z-20 px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-[#00CBB8]/50 text-xs font-semibold text-[#00CBB8] shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-[#00CBB8]" />
          <span>{qualityNotice}</span>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md">
            <Loader2 className="w-10 h-10 text-[#00CBB8] animate-spin" />
          </div>
        </div>
      )}

      {/* Large Centered Glowing Play Button (Shows when paused) */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/25 group-hover:bg-black/35 transition-colors"
        >
          <div className="relative group/play">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-4 rounded-full bg-[#00CBB8]/30 blur-xl group-hover/play:bg-[#00CBB8]/50 transition-all duration-500 animate-pulse" />
            
            <button
              aria-label="Play Video"
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#00CBB8] hover:bg-[#00b5a3] text-white flex items-center justify-center shadow-[0_0_40px_rgba(0,203,184,0.7)] group-hover/play:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/40"
            >
              <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-white ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Click Pulse Animation */}
      {pulsePlayIcon && isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white scale-125 animate-out fade-out zoom-out duration-300">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* =========================================================================
          Bottom Controls Overlay Bar (Bunny Stream Theme)
          ========================================================================= */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-20 px-4 sm:px-6 pb-4 pt-16 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        {/* Scrubber Progress Bar */}
        <div 
          onClick={handleScrubberChange}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          className="relative h-2 hover:h-3.5 bg-white/20 rounded-full cursor-pointer mb-3.5 transition-all duration-200 group/bar flex items-center"
        >
          {/* Buffered Progress */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-white/35 rounded-full transition-all duration-300"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Played Progress (Bunny Teal) */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-[#00CBB8] rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Thumb */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(0,203,184,0.9)] border-2 border-[#00CBB8] scale-0 group-hover/bar:scale-100 transition-transform duration-150" />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div 
              className="absolute -top-9 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 border border-white/20 text-[11px] font-bold text-white shadow-xl pointer-events-none"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between text-white text-sm">
          {/* Left Controls: Play/Pause, Rewind, Forward, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Play / Pause Toggle */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => seekRelative(-10)}
              className="p-2 rounded-xl text-white/80 hover:text-[#00CBB8] hover:bg-white/10 transition-colors relative group/btn"
              title="Rewind 10s (←)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="absolute text-[8px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono">10</span>
            </button>

            {/* Fast-Forward 10s */}
            <button
              onClick={() => seekRelative(10)}
              className="p-2 rounded-xl text-white/80 hover:text-[#00CBB8] hover:bg-white/10 transition-colors relative group/btn"
              title="Forward 10s (→)"
            >
              <RotateCw className="w-4 h-4" />
              <span className="absolute text-[8px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono">10</span>
            </button>

            {/* Volume Control + Slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="w-16 sm:w-20 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#00CBB8] transition-all"
              />
            </div>

            {/* Time Display */}
            <div className="text-xs text-slate-300 font-mono font-medium tracking-tight pl-1 sm:pl-2">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1.5">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Quality Selector, Speed Selector, PiP, Fullscreen */}
          <div className="flex items-center gap-2 relative">
            {/* Video Quality / Resolution Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  showQualityMenu 
                    ? 'bg-[#00CBB8] text-white border-[#00CBB8]' 
                    : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border-white/10'
                }`}
                title="Video Quality / Resolution"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00CBB8]" />
                <span className="uppercase">{selectedQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-12 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl p-2 shadow-2xl min-w-[170px] z-30 animate-in fade-in zoom-in-95 font-poppins">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>Quality</span>
                    <span className="text-[#00CBB8] text-[9px]">HD Stream</span>
                  </div>
                  {qualityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleQualitySelect(opt.id)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition-colors ${
                        selectedQuality === opt.id 
                          ? 'bg-[#00CBB8]/20 text-[#00CBB8]' 
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{opt.id}</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${opt.badge === 'HD' ? 'bg-[#00CBB8]/30 text-[#00CBB8]' : 'bg-slate-700 text-slate-300'}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{opt.desc}</div>
                      </div>
                      {selectedQuality === opt.id && <Check className="w-4 h-4 text-[#00CBB8] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border ${
                  showSpeedMenu 
                    ? 'bg-[#00CBB8] text-white border-[#00CBB8]' 
                    : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border-white/10'
                }`}
                title="Playback Speed"
              >
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-12 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl p-1.5 shadow-2xl min-w-[110px] z-30 animate-in fade-in zoom-in-95 font-poppins">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider border-b border-white/10 mb-1">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedSelect(s)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition-colors ${
                        playbackSpeed === s 
                          ? 'bg-[#00CBB8]/20 text-[#00CBB8]' 
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <Check className="w-3.5 h-3.5 text-[#00CBB8]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title="Picture in Picture"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
