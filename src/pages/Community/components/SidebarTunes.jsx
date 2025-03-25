import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Howl, Howler } from "howler";
import "../styles/Sidebar.scss";

const SidebarTunes = () => {
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [loadError, setLoadError] = useState(false);
  const audioContext = useRef(null);

  // Kiểm tra xem Howler đã được cài đặt chính xác chưa
  useEffect(() => {
    console.log("Howler version:", Howler.version);
    console.log("Howler codecs:", Howler.codecs());
    console.log("Howler usingWebAudio:", Howler.usingWebAudio);
    console.log("Howler html5AudioPool:", Howler.html5AudioPool);
    
    // Kiểm tra các định dạng âm thanh hỗ trợ
    console.log("MP3 support:", Howler.codecs('mp3'));
    console.log("WAV support:", Howler.codecs('wav'));
    console.log("OGG support:", Howler.codecs('ogg'));
    
    // Log các file âm thanh
    console.log("Audio files in tunes:", tunes.map(tune => ({
      id: tune.id,
      name: tune.name,
      src: tune.src
    })));

    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext initialized:", audioContext.current);
        console.log("AudioContext state:", audioContext.current.state);
      } catch (error) {
        console.error("AudioContext initialization failed:", error);
      }
    } else {
      console.warn("Web Audio API not supported in this browser");
    }

    // Kiểm tra xem trình duyệt có cho phép autoplay không
    document.addEventListener('DOMContentLoaded', () => {
      const autoplayTest = document.createElement('audio');
      autoplayTest.src = "data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj4QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
      autoplayTest.load();
      autoplayTest.play().then(() => {
        console.log("Autoplay is allowed");
      }).catch(e => {
        console.warn("Autoplay is not allowed:", e);
      });
    });

    return () => {
      if (sound) {
        console.log("Cleaning up sound on unmount");
        sound.stop();
      }
      if (audioContext.current && audioContext.current.state !== 'closed') {
        console.log("Closing AudioContext on unmount");
        audioContext.current.close();
      }
    };
  }, []);

  const tunes = [
    { 
      id: 1, 
      name: "Giọng hát thai nhi", 
      creator: "Miroslav Philharmonik", 
      type: "3 bài hát - 7 phút/bài",
      src: "/audio/Erika-VA-6036685.mp3" 
    },
    { 
      id: 2, 
      name: "Âm nhạc êm dịu", 
      creator: "Jonathan Lim", 
      type: "4 bài hát",
      src: "/audio/skibidi-toilet.mp3"
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

  const playSound = (tuneId) => {
    console.log("=== PLAY SOUND START ===");
    console.log("Attempting to play sound for tune ID:", tuneId);
    
    try {
      // Kiểm tra trình duyệt có hỗ trợ Howler không
      if (!Howler) {
        console.error("Howler is not defined or not loaded properly");
        return;
      }
      
      // Khởi động AudioContext nếu bị tạm dừng
      if (audioContext.current && audioContext.current.state === 'suspended') {
        console.log("Resuming suspended AudioContext");
        audioContext.current.resume().then(() => {
          console.log("AudioContext resumed successfully");
        }).catch(error => {
          console.error("Failed to resume AudioContext:", error);
        });
      }

      // Dừng âm thanh hiện tại nếu có
      if (sound) {
        console.log("Stopping current sound");
        sound.stop();
      }

      // Nếu click vào bài đang phát thì dừng
      if (playingId === tuneId) {
        console.log("Stopping playback - same tune clicked");
        setPlayingId(null);
        setSound(null);
        return;
      }

      // Tìm bài hát từ tuneId
      const selectedTune = tunes.find((tune) => tune.id === tuneId);
      if (!selectedTune || !selectedTune.src) {
        console.error("Invalid tune or missing src:", selectedTune);
        return;
      }

      console.log("Creating new Howl instance for:", selectedTune.src);
      console.log("Full tune object:", selectedTune);

      // Kiểm tra file có tồn tại không bằng fetch
      fetch(selectedTune.src)
        .then(response => {
          if (!response.ok) {
            console.error(`File không tồn tại hoặc không thể truy cập: ${selectedTune.src}`);
            console.error('Phản hồi:', response.status, response.statusText);
            setLoadError(true);
            throw new Error(`Error fetching audio file: ${response.status} ${response.statusText}`);
          }
          console.log(`File tồn tại và có thể truy cập: ${selectedTune.src}`);
          return response.blob();
        })
        .then(blob => {
          console.log("File audio blob:", blob);
          console.log("File type:", blob.type);
          console.log("File size:", blob.size, "bytes");
          
          // Reset trạng thái lỗi
          setLoadError(false);

          // Tạo đối tượng Howl mới
          const newSound = new Howl({
            src: [selectedTune.src],
            volume: volume,
            loop: true,
            html5: true, // Sử dụng HTML5 Audio để tránh vấn đề CORS
            format: ['mp3', 'wav'], // Thêm định dạng rõ ràng
            xhr: {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache'
              },
            },
            preload: true,
            onload: () => {
              console.log("Sound loaded successfully:", selectedTune.name);
              console.log("Sound state:", newSound.state());
              console.log("Sound duration:", newSound.duration(), "seconds");
            },
            onplay: () => {
              console.log("Sound started playing:", selectedTune.name);
              console.log("Sound playing state:", newSound.playing());
            },
            onstop: () => {
              console.log("Sound stopped:", selectedTune.name);
            },
            onpause: () => {
              console.log("Sound paused:", selectedTune.name);
            },
            onseek: () => {
              console.log("Sound position changed:", newSound.seek());
            },
            onend: () => {
              console.log("Sound playback ended:", selectedTune.name);
            },
            onloaderror: (id, err) => {
              console.error("Error loading sound:", selectedTune.name, err);
              console.error("Sound ID:", id);
              console.error("Error details:", err);
              setLoadError(true);
            },
            onplayerror: (id, err) => {
              console.error("Error playing sound:", selectedTune.name, err);
              console.error("Sound ID:", id);
              console.error("Error details:", err);
              
              // Thử lại với HTML5 audio fallback
              if (newSound._html5) {
                console.log("Already using HTML5, cannot retry");
              } else {
                console.log("Retrying with HTML5 Audio");
                newSound._html5 = true;
                newSound.play();
              }
            }
          });

          // Phát nhạc
          console.log("Attempting to play sound...");
          newSound.play();
          
          // Kiểm tra trạng thái sau khi gọi play
          setTimeout(() => {
            console.log("Sound state after play call:", newSound.state());
            console.log("Sound playing status:", newSound.playing());
            if (!newSound.playing()) {
              console.warn("Sound not playing after play() call. Trying again...");
              newSound.play();
            }
          }, 500);
          
          setSound(newSound);
          setPlayingId(tuneId);
        })
        .catch(error => {
          console.error("Error loading audio file:", error);
          setLoadError(true);
        });
    } catch (error) {
      console.error("Unexpected error in playSound:", error);
      setLoadError(true);
    }
    console.log("=== PLAY SOUND END ===");
  };

  // Xử lý việc thay đổi âm lượng
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    console.log("Volume changed to:", newVolume);
    setVolume(newVolume);
    if (sound) {
      sound.volume(newVolume);
      console.log("New volume applied to sound:", sound.volume());
    }
  };

  // Xử lý việc tắt/bật âm thanh
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
      console.log("Mute state toggled to:", !isMuted);
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
        <p>Mở Developer Console (F12) để xem thông tin debug chi tiết.</p>
      </div>
    </div>
  );
};

export default SidebarTunes; 