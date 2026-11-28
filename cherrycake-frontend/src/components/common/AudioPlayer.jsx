import React, { useState, useEffect, useRef } from 'react';
import useTranslation from '../../i18n/useTranslation';

const FALLBACK_PLAYLIST = [
  {
    title: 'Mellow Fox - Backyard',
    url: '/assets/audio/Mellow Fox - Backyard.m4a'
  },
  {
    title: 'Rio - Fly Love',
    url: '/assets/audio/Rio - Fly Love.m4a'
  },
  {
    title: 'Notre Dame de Paris - Belle',
    url: '/assets/audio/Notre Dame de Paris - Belle.m4a'
  },
  {
    title: 'Garou - Je Nattendais Que Vous',
    url: '/assets/audio/Garou - Je Nattendais Que Vous.mp3'
  },
  {
    title: 'Notre Dame de Paris - Lune',
    url: '/assets/audio/Notre Dame de Paris - Lune.mp3'
  }
];

export function AudioPlayer() {
  const { t } = useTranslation();
  const [playlist, setPlaylist] = useState(FALLBACK_PLAYLIST);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animFrameRef = useRef(null);

  const bar0Ref = useRef(null);
  const bar1Ref = useRef(null);
  const bar2Ref = useRef(null);
  const bar3Ref = useRef(null);
  const hasInteractedRef = useRef(false);
  const startPlaybackRef = useRef(null);

  // Load playlist from JSON
  useEffect(() => {
    fetch('/assets/audio/playlist.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d) => ({
            title: d.title,
            url: d.url.startsWith('/') ? d.url : `/${d.url}`
          }));
          setPlaylist(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const currentTrack = playlist[trackIndex] || playlist[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Initialize Web Audio API AnalyserNode
  const ensureAudioAnalyser = () => {
    if (analyserRef.current || !audioRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;

      const sourceNode = ctx.createMediaElementSource(audioRef.current);
      sourceNode.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;
    } catch (err) {
      console.warn('Web Audio API initialization notice:', err);
    }
  };

  // Real-time audio frequency loop
  const updateEqualizerFrame = (timestamp = 0) => {
    const bars = [bar0Ref.current, bar1Ref.current, bar2Ref.current, bar3Ref.current];

    if (!audioRef.current || audioRef.current.paused) {
      bars.forEach((b) => {
        if (b) b.style.height = '3px';
      });
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];

      if (sum > 0) {
        const getAvg = (start, end) => {
          let s = 0;
          for (let i = start; i <= end; i++) s += dataArray[i] || 0;
          return s / (end - start + 1);
        };

        const currentVol = audioRef.current ? audioRef.current.volume : 1;
        const v0 = getAvg(0, 2);
        const v1 = getAvg(3, 5);
        const v2 = getAvg(6, 10);
        const v3 = getAvg(11, 18);

        const bands = [v0, v1, v2, v3];
        bars.forEach((bar, idx) => {
          if (bar) {
            const scaled = 3 + Math.round((bands[idx] / 255) * 13 * Math.min(1.5, currentVol + 0.3));
            const clamped = Math.max(3, Math.min(16, scaled));
            bar.style.height = `${clamped}px`;
          }
        });
      } else {
        // Fallback subtle rhythm
        const t = timestamp / 250;
        const fallback = [
          Math.round(5 + 3 * Math.sin(t)),
          Math.round(7 + 4 * Math.cos(t * 1.3)),
          Math.round(6 + 5 * Math.sin(t * 1.7)),
          Math.round(4 + 3 * Math.cos(t * 0.9))
        ];
        bars.forEach((bar, idx) => {
          if (bar) bar.style.height = `${fallback[idx]}px`;
        });
      }
    }

    animFrameRef.current = requestAnimationFrame(updateEqualizerFrame);
  };

  const startPlayback = () => {
    if (!audioRef.current) return;
    ensureAudioAnalyser();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(updateEqualizerFrame);
        }
      })
      .catch((err) => {
        console.warn('Playback prevented:', err);
        setIsPlaying(false);
      });
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    const bars = [bar0Ref.current, bar1Ref.current, bar2Ref.current, bar3Ref.current];
    bars.forEach((b) => {
      if (b) b.style.height = '3px';
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleNext = () => {
    const nextIdx = (trackIndex + 1) % playlist.length;
    setTrackIndex(nextIdx);
    setTimeout(() => {
      startPlayback();
    }, 50);
  };

  const handlePrev = () => {
    const prevIdx = (trackIndex - 1 + playlist.length) % playlist.length;
    setTrackIndex(prevIdx);
    setTimeout(() => {
      startPlayback();
    }, 50);
  };

  useEffect(() => {
    startPlaybackRef.current = startPlayback;
  });

  // User's requirement: music on VITE must start automatically when user first clicks on the page
  useEffect(() => {
    const handleFirstClick = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        if (audioRef.current && audioRef.current.paused) {
          startPlaybackRef.current?.();
        }
      }
    };

    document.addEventListener('click', handleFirstClick, { once: true });
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="audio-bar" id="audioBar" role="region" aria-label="Artisanal Music Player">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onEnded={handleNext}
        onPlay={() => {
          setIsPlaying(true);
          ensureAudioAnalyser();
          if (!animFrameRef.current) {
            animFrameRef.current = requestAnimationFrame(updateEqualizerFrame);
          }
        }}
        onPause={() => {
          setIsPlaying(false);
          const bars = [bar0Ref.current, bar1Ref.current, bar2Ref.current, bar3Ref.current];
          bars.forEach((b) => {
            if (b) b.style.height = '3px';
          });
        }}
      />

      {/* LEFT: Spinning Vinyl Disc & Track Details */}
      <div className="audio-left">
        <div className={`audio-disc ${isPlaying ? 'spinning playing' : ''}`} id="audioDisc">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
          </svg>
        </div>
        <div className="audio-details">
          <span className="audio-track-name" title={currentTrack?.title}>
            {currentTrack?.title || 'Cherry Cake Melody'}
          </span>
          <span className="audio-status-label">
            {/* Real Audio-Reactive Equalizer Bars */}
            <span className={`audio-equalizer ${isPlaying ? 'playing' : ''}`} id="audioEq">
              <span ref={bar0Ref} className="eq-bar bar-1"></span>
              <span ref={bar1Ref} className="eq-bar bar-2"></span>
              <span ref={bar2Ref} className="eq-bar bar-3"></span>
              <span ref={bar3Ref} className="eq-bar bar-4"></span>
            </span>
            <span>{isPlaying ? t('audio.nowPlaying', 'Now Playing') : t('audio.paused', 'Paused')}</span>
          </span>
        </div>
      </div>

      {/* CENTER: |<  (▶/❚❚)  >| */}
      <div className="audio-center-controls">
        <button
          type="button"
          className="audio-nav-btn"
          id="prevTrackBtn"
          onClick={handlePrev}
          title="Previous Track"
          aria-label="Previous Track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </button>

        <button
          type="button"
          className="play-toggle-btn"
          id="playBtn"
          onClick={togglePlay}
          title={isPlaying ? 'Pause music' : 'Play music'}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="audio-nav-btn"
          id="nextTrackBtn"
          onClick={handleNext}
          title="Next Track"
          aria-label="Next Track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </button>
      </div>

      {/* RIGHT: Volume Slider */}
      <div className="audio-right">
        <div className="volume-box">
          <svg className="volume-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            className="volume-input"
            id="volumeSlider"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
