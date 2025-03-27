// Utility function to play notification sound
export const playNotificationSound = (soundType = "default") => {
  console.log(`Attempting to play sound: ${soundType}`);

  // Different sound files for different contexts
  const soundFiles = {
    default: "./audio/news-ting-6832.mp3",
    trackingSuccess: "./audio/happy-logo-13397.mp3",
    loginSuccess: "./audio/success-fanfare-trumpets-6185.mp3",
    loginFail: "./audio/fail-234710.mp3",
    profileSuccess: "./audio/success-fanfare-trumpets-6185.mp3",
  };

  // Get the correct sound file based on the type
  const soundFile = soundFiles[soundType] || soundFiles.default;
  console.log(`Sound file path: ${soundFile}`);

  try {
    const audio = new Audio(soundFile);
    audio.volume = 0.5; // Set volume to 50%

    // Add event listeners to track success/failure
    audio.addEventListener("play", () => {
      console.log(`Sound ${soundType} started playing successfully`);
    });

    audio.addEventListener("error", (e) => {
      console.error(`Error event on audio element for ${soundType}:`, e);
    });

    // Ensure the play call is awaited properly
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`Sound ${soundType} playback initiated successfully`);
        })
        .catch((error) => {
          console.error(
            `Error playing ${soundType} notification sound:`,
            error
          );
          // Attempt to play the sound again with user interaction
          console.log(
            `Sound could not be played automatically due to browser policy`
          );
          // Create a hidden button and simulate a click
          forcePlaySoundWithUserInteraction(soundFile);
        });
    }
  } catch (error) {
    console.error(`Error creating audio element for ${soundType}:`, error);
  }
};

// Function to handle browser autoplay restrictions by forcing playback with user interaction
const forcePlaySoundWithUserInteraction = (soundFile) => {
  console.log("Attempting to force sound playback with user interaction");

  // Create a hidden button in the UI
  const soundButton = document.createElement("button");
  soundButton.style.position = "fixed";
  soundButton.style.top = "0";
  soundButton.style.left = "0";
  soundButton.style.width = "1px";
  soundButton.style.height = "1px";
  soundButton.style.opacity = "0.01";
  soundButton.style.pointerEvents = "none";
  soundButton.innerText = "Play Sound";

  // Add the button to the DOM
  document.body.appendChild(soundButton);

  // Add a click handler that plays the sound
  soundButton.addEventListener("click", () => {
    // Sử dụng đường dẫn tương đối cùng cấp với soundFile nhận được
    const audio = new Audio(
      soundFile.startsWith("/") ? `.${soundFile}` : soundFile
    );
    audio.volume = 0.5;
    audio
      .play()
      .catch((err) => console.error("Still couldn't play sound:", err));

    // Remove the button after playing
    setTimeout(() => {
      document.body.removeChild(soundButton);
    }, 1000);
  });

  // Simulate a click on the button
  soundButton.click();
};

// Special function for error sounds that need to be played after validation failures
// This function is specifically designed to be called after user interaction like form submission
export const playErrorSound = () => {
  console.log("Playing error sound with direct user interaction");
  const audio = new Audio("./audio/fail-234710.mp3");
  audio.volume = 0.6; // Make error sounds slightly louder

  // Create and click a temporary button to ensure user interaction
  const tempButton = document.createElement("button");
  tempButton.style.display = "none";
  document.body.appendChild(tempButton);

  // Use the click event to play the sound
  tempButton.addEventListener("click", () => {
    audio.play().catch((error) => {
      console.error("Error playing error sound:", error);
    });
  });

  // Trigger the click
  tempButton.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(tempButton);
  }, 1000);
};

// Utility function to play delete success sound
export const playDeleteSound = () => {
  const audio = new Audio(
    "./audio/cylindrical-wrench-bell-2-170504_1501-46956.mp3"
  );
  audio.volume = 0.5; // Set volume to 50%
  audio.play().catch((error) => {
    console.error("Error playing delete sound:", error);
  });
};

// Utility function to play UI interaction sound
export const playUISound = () => {
  const audio = new Audio("./audio/ui-pop-sound-316482.mp3");
  audio.volume = 0.3; // Set volume to 30% to avoid being too loud
  audio.play().catch((error) => {
    console.error("Error playing UI sound:", error);
  });
};
