"use client";
// Shared compact Sure Success Point School logo.
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/system';

// Galactic palette (unchanged)
const galacticPalette = {
  trust: '#0d47a1', // Royal Cosmic Blue
  quality: '#f39c12', // Solar Flare Gold
  safety: '#f50057', // Quantum Neon Violet
  energyCore: '#9d00ff',
  quantumPulse: '#00ffe5',
  starNebula: '#f8ff00'
};

// Define glow animation (scale down shadow values)
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.3), 0 0 6px rgba(0, 240, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.5), 0 0 12px rgba(0, 240, 255, 0.4);
  }
  100% {
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.3), 0 0 6px rgba(0, 240, 255, 0.2);
  }
`;

// Trust-specific LeadingPlate
const TrustLeadingPlate = styled(Box)({
  position: 'absolute',
  top: '-18px',
  left: '-25.8px',
  width: '55.2px',
  transform: 'rotate(-30deg)',
  height: '12px',
  background: `linear-gradient(135deg, ${galacticPalette.trust}, #082F0D)`,
  border: '1.2px solid transparent',
  borderImage: `linear-gradient(135deg, 
    ${galacticPalette.energyCore}, 
    ${galacticPalette.quantumPulse}, 
    ${galacticPalette.starNebula}) 1`,
  clipPath: 'polygon(12.5% 0%, 100% 0%, 90% 100%, 0% 100%)',
  zIndex: -1,
  boxShadow: '0 0 4.8px rgba(255,255,255,0.5), 0 0 8.4px #00f0ff55',
});

// Quality-specific LeadingPlate
const QualityLeadingPlate = styled(Box)({
  position: 'absolute',
  width: '55.2px',
  transform: 'rotate(-30deg)',  
  top: '-18px',
  left: '-18.6px',
  height: '12px',
  background: `linear-gradient(135deg, ${galacticPalette.quality}, #082F0D)`,
  border: '1.2px solid transparent',
  borderImage: `linear-gradient(135deg, 
    ${galacticPalette.energyCore}, 
    ${galacticPalette.quantumPulse}, 
    ${galacticPalette.starNebula}) 1`,
  clipPath: 'polygon(12.5% 0%, 100% 0%, 90% 100%, 0% 100%)',
  zIndex: -1,
  boxShadow: '0 0 4.8px rgba(255,255,255,0.5), 0 0 8.4px #00f0ff55',
});

// Safety-specific LeadingPlate
const SafetyLeadingPlate = styled(Box)({
  position: 'absolute',
  width: '55.2px',
  top: '-18px',
  left: '-21.6px',
  height: '12px',
  background: `linear-gradient(135deg, ${galacticPalette.safety}, #082F0D)`,
  border: '1.2px solid transparent',
  borderImage: `linear-gradient(135deg, 
    ${galacticPalette.energyCore}, 
    ${galacticPalette.quantumPulse}, 
    ${galacticPalette.starNebula}) 1`,
  clipPath: 'polygon(12.5% 0%, 100% 0%, 90% 100%, 0% 100%)',
  zIndex: -1,
  boxShadow: '0 0 4.8px rgba(255,255,255,0.5), 0 0 8.4px #00f0ff55',
  transform: 'rotate(-30deg)',
});

const StrokeHexagon = styled(Box)(({ strokeColor = galacticPalette.quality }) => ({
  width: '97.5px',
  height: '85.5px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  fontWeight: 700,
  textShadow: `
    -0.72px -0.72px 0 #000000,
     0.72px -0.72px 0 #000000,
    -0.72px  0.72px 0 #000000,
     0.72px  0.72px 0 #000000
  `,
  top: 0,
  left: 0,
  zIndex: 0,
}));

const Hexagon = styled(Box)(({ color }) => ({
  width: '96px',
  height: '84px',
  backgroundColor: color,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  animation: `${glowAnimation} 1.5s ease-in-out infinite`,
  backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(0,0,0,0.25))',
  transition: 'all 0.3s ease',
  zIndex: 1,
}));

const RotatedHexagonWrapper = styled(Box)({
  transform: 'rotate(90deg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '97.2px',
  height: '85.2px',
  margin: '0',
});

const InnerContent = styled(Box)({
  transform: 'rotate(-90deg)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

// Specific RotatedText variants for maximum alignment control
const TrustRotatedText = styled(Box)({
  position: 'absolute',
  top: '-18px',
  left: '-22.8px',
  fontSize: '7.2px',
  transform: 'rotate(-31deg)',
  color: '#fff',
  fontWeight: 700,
  textShadow: `
    -0.72px -0.72px 0 #000000,
     0.72px -0.72px 0 #000000,
    -0.72px  0.72px 0 #000000,
     0.72px  0.72px 0 #000000
  `,
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
});

const QualityRotatedText = styled(Box)({
  position: 'absolute',
  top: '-15.6px',
  left: '-14.4px',
  fontSize: '7.2px',
  transform: 'rotate(-31deg)',
  color: '#fff',
  fontWeight: 700,
  textShadow: `
    -0.72px -0.72px 0 #000000,
     0.72px -0.72px 0 #000000,
    -0.72px  0.72px 0 #000000,
     0.72px  0.72px 0 #000000
  `,
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
});

const SafetyRotatedText = styled(Box)({
  position: 'absolute',
  top: '-15.6px',
  left: '-16.8px',
  fontSize: '7.2px',
  transform: 'rotate(-31deg)',
  color: '#fff',
  fontWeight: 700,
  textShadow: `
    -0.72px -0.72px 0 #000000,
     0.72px -0.72px 0 #000000,
    -0.72px  0.72px 0 #000000,
     0.72px  0.72px 0 #000000
  `,
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
});

// Trust-specific MiniStrokeHexagon
const TrustMiniStrokeHexagon = styled(Box)({
  width: '8.4px',
  height: '7.2px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'absolute',
  top: -0.6,
  left: -0.6,
  zIndex: 0,
});

// Trust-specific MiniHexagon
const TrustMiniHexagon = styled(Box)({
  width: '7.2px',
  height: '6px',
  backgroundColor: '#3e2723',
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'relative',
  zIndex: 1,
  marginRight: '0.6px',
});

// Quality-specific MiniStrokeHexagon
const QualityMiniStrokeHexagon = styled(Box)({
  width: '8.4px',
  height: '7.2px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'absolute',
  top: -0.6,
  left: -0.6,
  zIndex: 0,
});

// Quality-specific MiniHexagon
const QualityMiniHexagon = styled(Box)({
  width: '7.2px',
  height: '6px',
  backgroundColor: '#f50057',
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'relative',
  zIndex: 1,
  marginRight: '1.2px',
});

// Safety-specific MiniStrokeHexagon
const SafetyMiniStrokeHexagon = styled(Box)({
  width: '8.4px',
  height: '7.2px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'absolute',
  top: -0.6,
  left: -0.6,
  zIndex: 0,
});

// Safety-specific MiniHexagon
const SafetyMiniHexagon = styled(Box)({
  width: '7.2px',
  height: '6px',
  backgroundColor: '#ffab00',
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'relative',
  zIndex: 1,
  marginRight: '1.2px',
});

const TrustText = styled(Typography)(({ textColor }) => ({
  fontSize: '18px',
  fontWeight: 800,
  color: textColor || '#E5E5E5',
  textShadow: `
    -1.2px -1.2px 0 #000000,
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  zIndex: 2,
}));

const QualityText = styled(Typography)(({ textColor }) => ({
  fontSize: '18px',
  fontWeight: 800,
  color: textColor || '#E5E5E5',
  textShadow: `
    -1.2px -1.2px 0 #000000,
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  zIndex: 2,
}));

const SafetyText = styled(Typography)(({ textColor }) => ({
  fontSize: '18px',
  fontWeight: 800,
  color: textColor || '#E5E5E5',
  textShadow: `
    -1.2px -1.2px 0 #000000,
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  zIndex: 2,
}));

const LogoContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingBottom: '19.2px',
});

export default function MyJeevanLogo() {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <LogoContainer mt={1.2}>
        {/* TOP ROW: Trust + Quality */}
        <Box display="flex" justifyContent="center" mb={-1.2}>
          {/* Trust Hexagon */}
          <RotatedHexagonWrapper>
            <StrokeHexagon />
            <Hexagon color={galacticPalette.trust}>
              <InnerContent>
                <TrustLeadingPlate />
                <TrustRotatedText>
                  <Box position="relative" display="inline-flex" alignItems="center">
                    <TrustMiniStrokeHexagon />
                    <TrustMiniHexagon />
                  </Box>
                  Empowering
                </TrustRotatedText>
                <TrustText textColor="#FFFFFF">Trust</TrustText>
              </InnerContent>
            </Hexagon>
          </RotatedHexagonWrapper>

          {/* Quality Hexagon */}
          <RotatedHexagonWrapper sx={{ marginLeft: '-12px' }}>
            <StrokeHexagon />
            <Hexagon color={galacticPalette.quality}>
              <InnerContent>
                <QualityLeadingPlate />
                <QualityRotatedText>
                  <Box position="relative" display="inline-flex" alignItems="center">
                    <QualityMiniStrokeHexagon />
                    <QualityMiniHexagon />
                  </Box>
                  Enriching
                </QualityRotatedText>
                <QualityText textColor="#fff">Quality</QualityText>
              </InnerContent>
            </Hexagon>
          </RotatedHexagonWrapper>
        </Box>

        {/* BOTTOM HEX: Safety */}
        <Box display="flex" justifyContent="center" mt={-0.3036}>
          <RotatedHexagonWrapper>
            <StrokeHexagon />
            <Hexagon color={galacticPalette.safety}>
              <InnerContent>
                <SafetyLeadingPlate />
                <SafetyRotatedText>
                  <Box position="relative" display="inline-flex" alignItems="center">
                    <SafetyMiniStrokeHexagon />
                    <SafetyMiniHexagon />
                  </Box>
                  Ensuring
                </SafetyRotatedText>
                <SafetyText textColor="#fff">Safety</SafetyText>
              </InnerContent>
            </Hexagon>
          </RotatedHexagonWrapper>
        </Box>

        {/* SVG Definitions for Filters */}
        <svg style={{ height: 0 }}>
          <defs>
            {/* Galactic Stroke for Hexagons */}
            <linearGradient id="silverAshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b0bec5" />
              <stop offset="25%" stopColor="#90a4ae" />
              <stop offset="50%" stopColor="#cfd8dc" />
              <stop offset="75%" stopColor="#eceff1" />
              <stop offset="100%" stopColor="#607d8b" />
            </linearGradient>
            <filter id="galacticStroke">
              <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="1.5" />
              <feFlood floodColor="url(#silverAshGradient)" result="GRADIENT" />
              <feComposite in="GRADIENT" in2="DILATED" operator="in" result="OUTLINE" />
              <feMerge>
                <feMergeNode in="OUTLINE" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Fiery Lava Gradient and Filter for TDIL */}
            <linearGradient id="fieryLavaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4500" /> {/* Fiery red */}
              <stop offset="30%" stopColor="#ff8c00" /> {/* Orange */}
              <stop offset="60%" stopColor="#ffff00" /> {/* Yellow */}
              <stop offset="100%" stopColor="#ffeb3b" /> {/* Bright yellow */}
            </linearGradient>
            <filter id="fieryLavaStroke">
              <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="0.9" />
              <feFlood floodColor="url(#fieryLavaGradient)" result="GRADIENT" />
              <feComposite in="GRADIENT" in2="DILATED" operator="in" result="OUTLINE" />
              <feMerge>
                <feMergeNode in="OUTLINE" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Galactic Shine Gradient and Filter for The Dubey Industries Limited */}
            <linearGradient id="galacticShineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" /> {/* Cyan */}
              <stop offset="30%" stopColor="#9d00ff" /> {/* Purple */}
              <stop offset="60%" stopColor="#ffffff" /> {/* White */}
              <stop offset="100%" stopColor="#00ff85" /> {/* Bright cyan-green */}
            </linearGradient>
            <filter id="galacticShineStroke">
              <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="0.9" />
              <feFlood floodColor="url(#galacticShineGradient)" result="GRADIENT" />
              <feComposite in="GRADIENT" in2="DILATED" operator="in" result="OUTLINE" />
              <feMerge>
                <feMergeNode in="OUTLINE" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Branding Text: Fiery Lava Effect */}
        <Typography
          mt={1.8}
          fontSize="1.5rem"
          fontWeight="900"
          letterSpacing="0.09em"
          sx={{
            color: "#ff4500", // Fiery red-orange base
            textShadow: `
              0 0 12px #ff4500, // Red glow
              0 0 18px #ff8c00, // Orange glow
              0 0 36px #ffff00 // Yellow glow
            `,
            filter: "url(#fieryLavaStroke)",
            fontFamily: `'Orbitron', 'Audiowide', 'Space Mono', sans-serif`,
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}
        >
          TDIL
        </Typography>

        {/* Branding Text: Galactic Shine Effect */}
        <Typography
          fontSize="0.6rem"
          fontStyle={'italic'}
          fontWeight="600"
          letterSpacing="0.06em"
          sx={{
            color: "#ffffff", // White for starlight
            textShadow: `
              0 0 3px #00f0ff, // Cyan glow
              0 0 6px #9d00ff, // Purple glow
              0 0 9px #ffffff // White glow
            `,
            filter: "url(#galacticShineStroke)",
            fontFamily: `'Orbitron', 'Saira', 'Roboto Condensed', sans-serif`,
            textTransform: 'uppercase',
            animation: 'subtlePulse 6s ease-in-out infinite',
          }}
        >
          The Dubey Industries Limited
        </Typography>
      </LogoContainer>
    </Box>
  );
}
