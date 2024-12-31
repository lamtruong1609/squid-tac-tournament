const SQUID_GAME_SHAPES = ['circle', 'triangle', 'square'] as const;
const SQUID_GAME_COLORS = ['#ff0000', '#00ff00', '#0000ff'] as const;

export const generateSquidAvatar = () => {
  const shape = SQUID_GAME_SHAPES[Math.floor(Math.random() * SQUID_GAME_SHAPES.length)];
  const color = SQUID_GAME_COLORS[Math.floor(Math.random() * SQUID_GAME_COLORS.length)];
  
  // Generate SVG for the avatar
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${shape === 'circle' 
        ? `<circle cx="50" cy="50" r="40" fill="${color}" />`
        : shape === 'triangle'
        ? `<polygon points="50,10 90,90 10,90" fill="${color}" />`
        : `<rect x="10" y="10" width="80" height="80" fill="${color}" />`
      }
    </svg>
  `;

  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  return dataUrl;
};