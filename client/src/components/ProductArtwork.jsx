const palettes = {
  clay: { jar: "#d7a58d", wax: "#edcdb8", label: "#f6f0e7", shadow: "#a36654" },
  garden: { jar: "#b1a995", wax: "#e5ddc8", label: "#f7f3e7", shadow: "#72765f" },
  dusk: { jar: "#665e68", wax: "#bdb0b4", label: "#f1e8dc", shadow: "#383640" },
  linen: { jar: "#c5b7a2", wax: "#e8d9bf", label: "#faf5eb", shadow: "#99836a" },
};

export default function ProductArtwork({ tone = "clay", name, className = "" }) {
  const colors = palettes[tone] || palettes.clay;

  return (
    <svg
      className={`product-artwork ${className}`}
      viewBox="0 0 360 400"
      role="img"
      aria-label={`${name}, handmade candle in its ceramic vessel`}
    >
      <defs>
        <radialGradient id={`glow-${tone}`} cx="48%" cy="40%">
          <stop offset="0" stopColor="#fff8e9" stopOpacity=".93" />
          <stop offset="1" stopColor="#ded4c2" stopOpacity=".28" />
        </radialGradient>
        <linearGradient id={`vessel-${tone}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0" stopColor={colors.wax} />
          <stop offset=".48" stopColor={colors.jar} />
          <stop offset="1" stopColor={colors.shadow} />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="337" rx="98" ry="15" fill="#513b30" opacity=".11" />
      <circle cx="181" cy="177" r="127" fill={`url(#glow-${tone})`} />
      <path
        d="M119 157Q121 151 127 151H233Q239 151 241 157L253 287Q254 305 238 311Q180 326 122 311Q106 305 107 287Z"
        fill={`url(#vessel-${tone})`}
        stroke="#49382d"
        strokeOpacity=".12"
      />
      <ellipse cx="180" cy="157" rx="61" ry="13" fill={colors.jar} />
      <ellipse cx="180" cy="158" rx="51" ry="8" fill={colors.wax} />
      <path d="M179 148c-2-9 5-13 6-20 1-6-2-11-3-14 11 8 15 18 9 28" fill="#dfa365" />
      <path d="M183 147c0-6 4-9 5-14 4 5 5 10 1 15" fill="#fff1c8" />
      <path
        d="M137 193q43-12 86 0v55q-43 11-86 0z"
        fill={colors.label}
        opacity=".96"
      />
      <text
        x="180"
        y="219"
        fill="#55483d"
        fontFamily="Georgia, serif"
        fontSize="12"
        textAnchor="middle"
        letterSpacing="2"
      >
        EMBER &amp; WICK
      </text>
      <line x1="158" y1="229" x2="202" y2="229" stroke="#998779" strokeWidth=".8" />
      <text
        x="180"
        y="241"
        fill="#65584d"
        fontFamily="Arial, sans-serif"
        fontSize="6"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        POURED BY HAND · 8 OZ
      </text>
      <path d="M133 174q-8 20-9 45" stroke="white" opacity=".18" strokeWidth="3" fill="none" />
    </svg>
  );
}
