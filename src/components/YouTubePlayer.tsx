import React, { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onReady?: (player: any) => void;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  volume?: number;
  playing?: boolean;
  currentTime?: number;
  className?: string;
}

// YouTube Player States
export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onReady,
  onStateChange,
  onTimeUpdate,
  onDurationChange,
  volume = 100,
  playing = false,
  currentTime = 0,
  className = ''
}) => {
  const playerRef = useRef<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  const initializePlayer = () => {
    const newPlayer = new window.YT.Player(playerRef.current, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 1
      },
      events: {
        onReady: (event: any) => {
          setPlayer(event.target);
          onReady?.(event.target);
          // Get duration once player is ready
          const checkDuration = () => {
            const duration = event.target.getDuration();
            if (duration > 0) {
              onDurationChange?.(duration);
            } else {
              setTimeout(checkDuration, 100);
            }
          };
          checkDuration();
        },
        onStateChange: (event: any) => {
          onStateChange?.(event.data);
          
          if (event.data === YT_PLAYER_STATE.PLAYING) {
            startTimeUpdate(event.target);
          } else {
            stopTimeUpdate();
          }
        }
      }
    });
  };

  const startTimeUpdate = (playerInstance: any) => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerInstance && playerInstance.getCurrentTime) {
        const currentTime = playerInstance.getCurrentTime();
        onTimeUpdate?.(currentTime);
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  // Control player based on props
  useEffect(() => {
    if (!player) return;

    if (playing) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [player, playing]);

  useEffect(() => {
    if (!player) return;
    
    player.setVolume(volume);
  }, [player, volume]);

  useEffect(() => {
    if (!player) return;
    
    const playerCurrentTime = player.getCurrentTime();
    if (Math.abs(playerCurrentTime - currentTime) > 2) {
      player.seekTo(currentTime, true);
    }
  }, [player, currentTime]);

  useEffect(() => {
    if (!player) return;
    
    // Stop time update khi load video mới
    stopTimeUpdate();
    
    // Load video mới và reset timeline
    player.loadVideoById(videoId);
    
    // Reset duration sau khi load video mới
    setTimeout(() => {
      const duration = player.getDuration();
      if (duration > 0) {
        onDurationChange?.(duration);
      }
    }, 1000);
  }, [player, videoId]);

  return (
    <div className={className} style={{ position: 'absolute', left: '-9999px' }}>
      <div ref={playerRef} />
    </div>
  );
};

// Helper function to extract video ID from YouTube URL
export const extractYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Helper function to get YouTube thumbnail
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};