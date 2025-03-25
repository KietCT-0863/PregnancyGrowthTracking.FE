import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Howl } from "howler";
import "../styles/Sidebar.scss";

const SidebarTunes = () => {
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [loadError, setLoadError] = useState(false);
  const audioContext = useRef(null);

  const tunes = [
    { 
      id: 1, 
      name: "Giọng hát thai nhi", 
      creator: "Miroslav Philharmonik", 
      type: "3 bài hát - 7 phút/bài",
      src: "https://soundbible.com/mp3/lullaby-music-box-22304.mp3" 
    },
    { 
      id: 2, 
      name: "Âm nhạc êm dịu", 
      creator: "Jonathan Lim", 
      type: "4 bài hát",
      src: "https://soundbible.com/mp3/healing-18495.mp3"
    },
    { 
      id: 3, 
      name: "Nhạc mẹ hát ru", 
      creator: "Minawati Sri Dewdotre", 
      type: "8 bài hát mẹ ru",
      src: "https://soundbible.com/mp3/lullaby-music-box-22304.mp3" 
    },
    { 
      id: 4, 
      name: "Tiếng ồn trắng", 
      creator: "Susila Putrimaswari", 
      type: "5 tiếng - 20 phút/tệp",
      src: "https://soundbible.com/mp3/Ocean_Waves-Mike_Koenig-980635569.mp3" 
    },
    { 
      id: 5, 
      name: "Nhạc thai giáo", 
      creator: "SpaceSounds", 
      type: "7 phút/tệp",
      src: "https://soundbible.com/mp3/healing-18495.mp3" 
    },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext initialized:", audioContext.current);
      } catch (error) {
        console.error("AudioContext initialization failed:", error);
      }
    }

    return () => {
      if (sound) {
        sound.stop();
      }
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close();
      }
    };
  }, []);

  const playSound = (tuneId) => {
    console.log("Attempting to play sound for tune ID:", tuneId);
    
    if (audioContext.current && audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }

    if (sound) {
      console.log("Stopping current sound");
      sound.stop();
    }

    if (playingId === tuneId) {
      console.log("Stopping playback - same tune clicked");
      setPlayingId(null);
      setSound(null);
      return;
    }

    const selectedTune = tunes.find((tune) => tune.id === tuneId);
    if (!selectedTune || !selectedTune.src) {
      console.error("Invalid tune or missing src:", selectedTune);
      return;
    }

    console.log("Creating new Howl instance for:", selectedTune.src);
    setLoadError(false);

    const newSound = new Howl({
      src: [selectedTune.src],
      volume: volume,
      loop: true,
      html5: true,
      preload: true,
      onload: () => {
        console.log("Sound loaded successfully:", selectedTune.name);
      },
      onplay: () => {
        console.log("Sound started playing:", selectedTune.name);
      },
      onstop: () => {
        console.log("Sound stopped:", selectedTune.name);
      },
      onend: () => {
        console.log("Sound playback ended:", selectedTune.name);
      },
      onloaderror: (id, err) => {
        console.error("Error loading sound:", selectedTune.name, err);
        setLoadError(true);
      },
      onplayerror: (id, err) => {
        console.error("Error playing sound:", selectedTune.name, err);
        if (newSound._html5) {
          console.log("Already using HTML5, cannot retry");
        } else {
          console.log("Retrying with HTML5 Audio");
          newSound._html5 = true;
          newSound.play();
        }
      }
    });

    console.log("Attempting to play sound...");
    newSound.play();
    setSound(newSound);
    setPlayingId(tuneId);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    console.log("Volume changed to:", newVolume);
    setVolume(newVolume);
    if (sound) {
      sound.volume(newVolume);
    }
  };

  const toggleMute = () => {
    if (sound) {
      if (isMuted) {
        console.log("Unmuting sound, volume:", volume);
        sound.volume(volume);
      } else {
        console.log("Muting sound");
        sound.volume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="sidebar-section tunes-pack">
      <h2>Tunes/Pack</h2>
      
      {loadError && (
        <div className="error-message">
          Không thể tải file âm thanh. Vui lòng kiểm tra kết nối mạng hoặc làm mới trang.
        </div>
      )}
      
      <div className="tunes-list">
        {tunes.map((tune) => (
          <div 
            key={tune.id} 
            className={`tune-item ${playingId === tune.id ? 'playing' : ''}`}
          >
            <div className="tune-avatar">
              <Music size={18} />
            </div>
            <div className="tune-info">
              <h3>{tune.name}</h3>
              <p>{tune.type}</p>
            </div>
            <button 
              className="play-button"
              onClick={() => playSound(tune.id)}
              aria-label={playingId === tune.id ? "Dừng phát" : "Phát nhạc"}
            >
              {playingId === tune.id ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        ))}
      </div>

      {playingId && (
        <div className="volume-controls">
          <button 
            className="mute-button"
            onClick={toggleMute}
            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Âm lượng"
          />
        </div>
      )}
      
      <div className="help-text">
        <p>Bấm vào nút phát để nghe nhạc. Kiểm tra âm lượng của thiết bị và loa nếu không nghe được.</p>
      </div>
    </div>
  );
};

export default SidebarTunes; 