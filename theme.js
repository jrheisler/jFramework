// theme.js

const Theme = {
    mode: "dark",
  
    modes: {
      light: {
        background: "#F4F4F4",
        text: "#222222",
        primary: "#4A90E2",
        secondary: "#50E3C2",
        success: "#27AE60",
        danger: "#E74C3C",
        accent: "#FFC107",
        muted: "#888888"
      },
      dark: {
        background: "#1e1e1e",
        text: "#f0f0f0",
        primary: "#2196F3",
        secondary: "#4DD0E1",
        success: "#66BB6A",
        danger: "#EF5350",
        accent: "#FFD54F",
        muted: "#aaaaaa"
      }
    },
  
    fonts: {
      base: "Arial, sans-serif"
    },
  
    spacing: {
      padding: "12px",
      margin: "40px"
    },
  
    get colors() {
      return Theme.modes[Theme.mode];
    },
  
    applyGlobalStyles() {
      document.body.style.backgroundColor = Theme.colors.background;
      document.body.style.color = Theme.colors.text;
      document.body.style.fontFamily = Theme.fonts.base;
      document.body.style.transition = "background-color 0.3s, color 0.3s";
    },
  
    // 🆕 Subscribe to theme changes
    subscribe(fn) {
      if (!Theme._subscribers) Theme._subscribers = [];
      Theme._subscribers.push(fn);
    },
  
    setMode(newMode) {
      if (!Theme.modes[newMode]) return;
  
      Theme.mode = newMode;
      Theme.applyGlobalStyles();
  
      // 🔁 Notify all subscribers (e.g., components)
      if (Theme._subscribers) {
        Theme._subscribers.forEach(fn => fn());
      }
  
      // 🔔 Optional external hook
      if (Theme.onModeChange) {
        Theme.onModeChange(newMode);
      }
    }
  };
  