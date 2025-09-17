import React, { useState, useRef } from 'react';

function AudioPlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error("Audio play failed:", err);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold transition"
      >
        {isPlaying ? 'Pause' : 'Play Audio'}
      </button>
    </div>
  );
}

export default AudioPlayer;
