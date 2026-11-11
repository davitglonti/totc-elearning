import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Video, Sparkles, AlertCircle, RefreshCw, Maximize2, Zap } from 'lucide-react';

/**
 * Bunny Stream Video Player Component
 * Supports both official Bunny Stream iframe embeds and direct HTML5 videos with Bunny-styled Plyr controls.
 */
export default function BunnyPlayer({
  src,
  poster,
  title,
  onTimeUpdate,
  onEnded,
  initialTime = 0,
  autoPlay = false
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Detect whether this is an official Bunny Stream embed iframe or direct video file
  const isBunnyIframe = src && (
    src.includes('iframe.mediadelivery.net') || 
    src.includes('video.bunnycdn.com') ||
    src.includes('/embed/')
  );

  // Ensure local /uploads/ URLs route cleanly to backend or proxy
  const getResolvedSrc = (inputUrl) => {
    if (!inputUrl) return '';
    const trimmed = String(inputUrl).trim();
    if (trimmed.startsWith('/uploads/')) {
      return `http://localhost:5000${trimmed}`;
    }
    return trimmed;
  };

  const finalSrc = getResolvedSrc(src);

  useEffect(() => {
    setLoadError(false);

    if (isBunnyIframe || !finalSrc || !videoRef.current) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player:', e);
        }
        playerRef.current = null;
      }
      return;
    }

    try {
      // Destroy any prior Plyr instance on the element
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Initialize Plyr with Bunny Stream custom controls and dark theme
      const player = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'restart',
          'rewind',
          'play',
          'fast-forward',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed', 'loop'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        seekTime: 10,
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        autoplay: autoPlay,
        hideControls: true,
        resetOnEnd: false,
        ratio: '16:9'
      });

      playerRef.current = player;

      // Event listeners
      player.on('timeupdate', () => {
        if (onTimeUpdate && player.currentTime !== undefined) {
          onTimeUpdate(Math.floor(player.currentTime));
        }
      });

      player.on('waiting', () => setIsBuffering(true));
      player.on('playing', () => setIsBuffering(false));
      player.on('pause', () => setIsBuffering(false));

      player.on('ended', () => {
        if (onEnded) onEnded();
      });

      player.on('error', (e) => {
        console.warn('Bunny Player video playback error:', e);
        setLoadError(true);
      });

      if (initialTime > 0) {
        player.on('ready', () => {
          player.currentTime = initialTime;
        });
      }

    } catch (err) {
      console.error('Failed to initialize Bunny Plyr player:', err);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [finalSrc, isBunnyIframe]);

  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-900 rounded-[24px] border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 text-totc-teal flex items-center justify-center shadow-lg border border-slate-700/50">
          <Video className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-white mb-1">No Video Attached</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The instructor has not uploaded a video for this lecture yet.
          </p>
        </div>
      </div>
    );
  }

  // Case 1: Official Bunny Stream Embed Iframe
  if (isBunnyIframe) {
    // Ensure responsive and clean embed parameters
    let iframeUrl = src;
    if (!iframeUrl.includes('autoplay=')) {
      const sep = iframeUrl.includes('?') ? '&' : '?';
      iframeUrl = `${iframeUrl}${sep}autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
    }

    return (
      <div className="bunny-stream-player relative w-full h-full bg-black rounded-[24px] overflow-hidden shadow-2xl border border-slate-800 group">
        {/* Bunny Stream Edge badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-totc-teal/30 text-[11px] font-semibold text-totc-teal shadow-lg pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
          <Zap className="w-3.5 h-3.5 text-totc-teal animate-pulse" />
          <span>Bunny Stream CDN</span>
        </div>

        <iframe
          src={iframeUrl}
          loading="lazy"
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
          title={title || 'Bunny Stream Video'}
        />
      </div>
    );
  }

  // Case 2: Direct Video Stream / Local File with Bunny-themed Plyr Player
  return (
    <div className="bunny-stream-player relative w-full h-full bg-black rounded-[24px] overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group">
      
      {/* Bunny Stream Edge badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-totc-teal/30 text-[11px] font-semibold text-totc-teal shadow-lg pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
        <Zap className="w-3.5 h-3.5 text-totc-teal animate-pulse" />
        <span>Bunny Stream Engine</span>
      </div>

      {loadError ? (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 bg-slate-900/90 rounded-2xl border border-red-500/20 max-w-md mx-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <h4 className="font-bold text-white text-base">Video Loading Error</h4>
          <p className="text-xs text-slate-400">
            Could not stream the media file. Please check your network connection or ensure the backend video path is available.
          </p>
          <button
            onClick={() => {
              setLoadError(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-2 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-totc-teal" />
            <span>Retry Playback</span>
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={finalSrc}
          poster={poster}
          playsInline
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}
