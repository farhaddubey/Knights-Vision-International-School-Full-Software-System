"use client";
// Shared full-size Sure Success Point School logo.
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/system';

// Galactic palette
const galacticPalette = {
  trust: '#0d47a1', // Royal Cosmic Blue
  quality: '#f39c12', // Solar Flare Gold
  safety: '#f50057', // Quantum Neon Violet
  energyCore: '#9d00ff',
  quantumPulse: '#00ffe5',
  starNebula: '#f8ff00'
};

// Define glow animation
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 240, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.4);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 240, 255, 0.2);
  }
`;

// Trust-specific LeadingPlate
const TrustLeadingPlate = styled(Box)({
  position: 'absolute',
  top: '-30px', // Adjusted to position above the hexagon
  left: '-43px', // Adjusted for better alignment with "Empowering"
  width: '92px',
  transform: 'rotate(-30deg)',
  height: '20px',
  background: `linear-gradient(135deg, ${galacticPalette.trust}, #082F0D)`,
  border: '2px solid transparent',
  borderImage: `linear-gradient(135deg, 
    ${galacticPalette.energyCore}, 
    ${galacticPalette.quantumPulse}, 
    ${galacticPalette.starNebula}) 1`,
  clipPath: 'polygon(12.5% 0%, 100% 0%, 90% 100%, 0% 100%)',
  zIndex: -1,
  boxShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 14px #00f0ff55',
});

// Quality-specific LeadingPlate
const QualityLeadingPlate = styled(Box)({
  position: 'absolute',
  width: '92px',
  transform: 'rotate(-30deg)',  
  top: '-30px', // Adjusted to position above the hexagon
  left: '-31px', // Adjusted for "Enriching"
  height: '20px',
  background: `linear-gradient(135deg, ${galacticPalette.quality}, #082F0D)`,
  border: '2px solid transparent',
  borderImage: `linear-gradient(135deg, 
    ${galacticPalette.energyCore}, 
    ${galacticPalette.quantumPulse}, 
    ${galacticPalette.starNebula}) 1`,
  clipPath: 'polygon(12.5% 0%, 100% 0%, 90% 100%, 0% 100%)',
  zIndex: -1,
  boxShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 14px #00f0ff55',
});

// Safety-specific LeadingPlate
const SafetyLeadingPlate = styled(Box)({
  position: 'absolute',
  width: '92px',
  top: '-30px', // Adjusted to position above the hexagon
  left: '-36px', // Adjusted for "Ensuring"
  height: '20px',
  background: `linear-gradient(135deg, ${galacticPalette.safety}, #082F0D)`,
  border: '2px solid transparent',
  borderImage: `linear-gradient(135deg, 
    ${galacticPalette.energyCore}, 
    ${galacticPalette.quantumPulse}, 
    ${galacticPalette.starNebula}) 1`,
  clipPath: 'polygon(12.5% 0%, 100% 0%, 90% 100%, 0% 100%)',
  zIndex: -1,
  boxShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 14px #00f0ff55',
  transform: 'rotate(-30deg)',
});

const StrokeHexagon = styled(Box)(({ strokeColor = galacticPalette.quality }) => ({
  width: '162.5px', // was 162px
  height: '142.5px', // was 142px
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
    -1.2px -1.2px 0 #000000,        
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  top: 0,
  left: 0,
  zIndex: 0,
}));

const Hexagon = styled(Box)(({ color }) => ({
  width: '160px', // inner stays the same
  height: '140px',
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
  width: '162px',
  height: '142px',
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
  top: '-30px', // Adjusted to position below TrustLeadingPlate
  left: '-38px', // Fine-tuned for "Empowering"
  fontSize: '12px',
  transform: 'rotate(-31deg)',
  color: '#fff',
  fontWeight: 700,
  textShadow: `
    -1.2px -1.2px 0 #000000,
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
});

const QualityRotatedText = styled(Box)({
  position: 'absolute',
  top: '-26px', // Adjusted to position below QualityLeadingPlate
  left: '-24px', // Fine-tuned for "Enriching"
  fontSize: '12px',
  transform: 'rotate(-31deg)',
  color: '#fff',
  fontWeight: 700,
  textShadow: `
    -1.2px -1.2px 0 #000000,
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
});

const SafetyRotatedText = styled(Box)({
  position: 'absolute',
  top: '-26px', // Adjusted to position below SafetyLeadingPlate
  left: '-28px', // Fine-tuned for "Ensuring"
  fontSize: '12px',
  transform: 'rotate(-31deg)',
  color: '#fff',
  fontWeight: 700,
  textShadow: `
    -1.2px -1.2px 0 #000000,
     1.2px -1.2px 0 #000000,
    -1.2px  1.2px 0 #000000,
     1.2px  1.2px 0 #000000
  `,
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
});

// Trust-specific MiniStrokeHexagon
const TrustMiniStrokeHexagon = styled(Box)({
  width: '14px', // Slightly larger than MiniHexagon
  height: '12px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'absolute',
  top: -1,
  left: -1,
  zIndex: 0,
});

// Trust-specific MiniHexagon
const TrustMiniHexagon = styled(Box)({
  width: '12px',
  height: '10px',
  backgroundColor: '#3e2723',
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'relative',
  zIndex: 1,
  marginRight: '1px',
});

// Quality-specific MiniStrokeHexagon
const QualityMiniStrokeHexagon = styled(Box)({
  width: '14px', // Slightly larger than MiniHexagon
  height: '12px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'absolute',
  top: -1,
  left: -1,
  zIndex: 0,
});

// Quality-specific MiniHexagon
const QualityMiniHexagon = styled(Box)({
  width: '12px',
  height: '10px',
  backgroundColor: '#f50057',
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'relative',
  zIndex: 1,
  marginRight: '2px',
});

// Safety-specific MiniStrokeHexagon
const SafetyMiniStrokeHexagon = styled(Box)({
  width: '14px', // Slightly larger than MiniHexagon
  height: '12px',
  background: `linear-gradient(134deg,
    #8f00ff,    
    #00ffe5,    
    #00ff5e,    
    #00e5ff,    
    #ffffff20
  )`,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'absolute',
  top: -1,
  left: -1,
  zIndex: 0,
});

// Safety-specific MiniHexagon
const SafetyMiniHexagon = styled(Box)({
  width: '12px',
  height: '10px',
  backgroundColor: '#ffab00',
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  position: 'relative',
  zIndex: 1,
  marginRight: '2px',
});

const TrustText = styled(Typography)(({ textColor }) => ({
  fontSize: '30px',
  fontWeight: 800,
  color: textColor || '#E5E5E5',
  textShadow: `
    -2px -2px 0 #000000,
     2px -2px 0 #000000,
    -2px  2px 0 #000000,
     2px  2px 0 #000000
  `,
  zIndex: 2,
}));

const QualityText = styled(Typography)(({ textColor }) => ({
  fontSize: '30px',
  fontWeight: 800,
  color: textColor || '#E5E5E5',
  textShadow: `
    -2px -2px 0 #000000,
     2px -2px 0 #000000,
    -2px  2px 0 #000000,
     2px  2px 0 #000000
  `,
  zIndex: 2,
}));

const SafetyText = styled(Typography)(({ textColor }) => ({
  fontSize: '30px',
  fontWeight: 800,
  color: textColor || '#E5E5E5',
  textShadow: `
    -2px -2px 0 #000000,
     2px -2px 0 #000000,
    -2px  2px 0 #000000,
     2px  2px 0 #000000
  `,
  zIndex: 2,
}));

const LogoContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingBottom: '32px',
});

export default function MyJeevanLogo() {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <LogoContainer mt={2}>
        {/* TOP ROW: Trust + Quality */}
        <Box display="flex" justifyContent="center" mb={-2}>
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
          <RotatedHexagonWrapper sx={{ marginLeft: '-20px' }}>
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
        <Box display="flex" justifyContent="center" mt={-0.506}>
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
  {/* 💠 Galactic filter hidden in layout */}
     <svg style={{ height: 0 }}>
  <defs>
    <linearGradient id="silverAshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#b0bec5" />
      <stop offset="25%" stopColor="#90a4ae" />
      <stop offset="50%" stopColor="#cfd8dc" />
      <stop offset="75%" stopColor="#eceff1" />
      <stop offset="100%" stopColor="#607d8b" />
    </linearGradient>

    <filter id="galacticStroke">
      <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="2.5" />
      <feFlood floodColor="url(#silverAshGradient)" result="GRADIENT" />
      <feComposite in="GRADIENT" in2="DILATED" operator="in" result="OUTLINE" />
      <feMerge>
        <feMergeNode in="OUTLINE" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
</svg>

        {/* Branding Text */}
<Typography
  mt={3}
  fontSize="2.5rem"
  fontWeight="900"
  letterSpacing="0.15em"
  sx={{
    color: "#ffffff",
    stroke:"2px #000", 
    textShadow: `
      0 0 10px ${galacticPalette.energyCore},
      0 0 20px ${galacticPalette.quantumPulse},
      0 0 30px ${galacticPalette.starNebula}
    `,
    filter: "url(#galacticStroke)",
    fontFamily: `'Orbitron', 'Audiowide', 'Space Mono', sans-serif`,
    animation: 'pulseGlow 3s ease-in-out infinite',
  }}
>
  TDIL
</Typography>


<linearGradient id="celestialStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#00ff85" />
  <stop offset="20%" stopColor="#ffff00" />
  <stop offset="40%" stopColor="#ff66cc" />
  <stop offset="60%" stopColor="#ff1a1a" />
  <stop offset="100%" stopColor="#7df9ff" />
</linearGradient>

<filter id="celestialTextStroke">
  <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="1.5" />
  <feFlood floodColor="url(#celestialStrokeGradient)" result="GRADIENT" />
  <feComposite in="GRADIENT" in2="DILATED" operator="in" result="OUTLINE" />
  <feMerge>
    <feMergeNode in="OUTLINE" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
<Typography
  fontSize="1rem"
  fontStyle={'italic'}
  fontWeight="600"
  letterSpacing="0.1em"
  sx={{
    color: "#f8f8f8",
    textShadow: `
      0 0 5px #00ff85,
      0 0 10px #ff66cc,
      0 0 15px #ff1a1a
    `,
    filter: "url(#celestialTextStroke)",
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
