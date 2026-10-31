import { Tooltip, Box, Typography } from "@mui/material";
import MyJeevanLogo from "./SureSuccessPointSchoolCompactLogo";

const galacticPalette = {
  trust: '#0091ea',        // Royal Cosmic Blue
  quality: '#f39c12',      // Solar Flare Gold
  safety: '#f50057',       // Quantum Neon Violet
  energyCore: '#9d00ff',
  quantumPulse: '#00ffe5',
  starNebula: '#f8ff00',
  intellect: '#1de9b6'
};

const LogoWithGalacticTooltip = () => {
  return (
<Tooltip
  placement="right"
  arrow
  PopperProps={{
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [80, -50], // Keep X offset; we’ll center vertically manually
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
        },
      },
      {
        name: 'computeStyles',
        options: {
          adaptive: false,
        },
      },
      {
        name: 'customVerticalCentering',
        enabled: true,
        phase: 'main',
        fn: ({ state }) => {
          const reference = state.elements.reference.getBoundingClientRect();
          const tooltip = state.elements.popper;
          const tooltipHeight = tooltip.offsetHeight;
          tooltip.style.top = `${reference.top + reference.height / 2 - tooltipHeight / 2}px`;
        }
      }
    ]
  }}
  componentsProps={{
    tooltip: {
      sx: {
        bgcolor: "#000",
        borderRadius: 3,
        p: 1.5,
        maxWidth: 560
      }
    }
  }}
  title={
     <Box sx={{ p: 2, maxWidth: 560, bgcolor: "#000", borderRadius: 5, boxShadow: "0 0 30px rgba(255,255,255,0.1)", border: '1px solid #222', maxHeight:"95vh", overflowY:"scroll"}}>
<Typography sx={{ fontSize: "18px", fontWeight: 'bold', color: galacticPalette.energyCore }}>
  🌌 Where Ethics Meet Empire — TDIL-Hexagons: The Galactic Crest of Administrative Sovereignty
</Typography>


  <Typography sx={{ fontSize: "16px", color: galacticPalette.trust, mt: 1.5 }}>
    🔷 <strong>Universal Trust</strong><br />
    The Blue Hexagon is not just a color — it’s a planetary oath. From boardrooms in Tokyo to nanolabs in Zurich, it radiates unshakable integrity, the core pillar behind every transaction, decision, and bond.
  </Typography>

  <Typography sx={{ fontSize: "16px", color: galacticPalette.quality, mt: 1.5 }}>
    🟡 <strong>Supremacy in Quality</strong><br />
    The Golden Hexagon is a forge of excellence — where benchmarks are melted, recast, and launched as global standards across FMCG, aerospace, nuclear, and quantum sectors.
  </Typography>

  <Typography sx={{ fontSize: "16px", color: galacticPalette.safety, mt: 1.5 }}>
    💗 <strong>Absolute Safety</strong><br />
    The Pink Hexagon is a shield — protecting every life and asset with systemic compassion and procedural obsession. Every node, byte, bolt is secured with world-class accountability.
  </Typography>

  <Typography sx={{ fontSize: "16px", color: galacticPalette.intellect, mt: 1.5 }}>
    🧠 <strong>Galactic Intellect</strong><br />
    A tribute to the eternal quest for innovation — AI, deep tech, and the atomic frontier bow to our obsidian standard. Our logo is known in research centers from CERN to Andromeda-class data clusters.
  </Typography>

<Typography sx={{ fontSize: "20px", fontWeight: 900, color: galacticPalette.energyCore, my: 2 }}>
  🚀 TDIL Global Empire: The Supreme Multi-Industry Force Shaping Civilizations
</Typography>

<Typography sx={{ fontSize: "18px", fontWeight:800, color: galacticPalette.trust, mb: 1 }}>
  TDIL - The Dubey Industries Limited | The World’s Most Dominant Entity Across:
</Typography>

<Box sx={{ fontSize: "16px", mb: 2 }}>
  <Typography sx={{ color: galacticPalette.trust }}>
    🛒 FMCG & Consumer Goods, ⚡ Energy & Renewable Power, 🤖 Artificial Intelligence & Advanced IT,
  </Typography>
  <Typography sx={{ color: galacticPalette.trust }}>
    🌾 Food & Agriculture, 💊 Healthcare & Pharmaceuticals, 🚚 Transport & Hyperlogistics,
  </Typography>
  <Typography sx={{ color: galacticPalette.quality }}>
    🌌 Space, Aerospace & Satellite Systems, 💰 Finance, Fintech & Digital Economy,
  </Typography>
  <Typography sx={{ color: galacticPalette.quality }}>
    🏭 Manufacturing & Industrial Automation, 🏗️ Infrastructure & Smart Cities,
  </Typography>
  <Typography sx={{ color: galacticPalette.safety }}>
    🏦 Banking & Global Capital Markets, 🛰️ Defense & Strategic Intelligence,
  </Typography>
  <Typography sx={{ color: galacticPalette.safety }}>
    🧪 Biotechnology & Genomics, 🌊 Maritime & Port Engineering, 🔋Battery & EV Technologies,
  </Typography>
  <Typography sx={{ color: galacticPalette.trust }}>
    🛠️ Robotics & Mechatronics, 🧠 Neurotech & Deep Learning, 🧱 Real Estate & Habitat Engineering,
  </Typography>
  <Typography sx={{ color: galacticPalette.trust }}>
    🎮 Entertainment Tech & Immersive Media, ☁️ Cloud, Cybersecurity & Quantum Networks,
  </Typography>
  <Typography sx={{ color: galacticPalette.quality }}>
    ⛏️ Mining, Rare Earths & Geosciences, 📡 Telecommunications & 6G, 🚢 Ocean Trade & Marine Sciences,
  </Typography>
  <Typography sx={{ color: galacticPalette.quality }}>
    🏥 Hospital Networks & MedTech, 🌐 Education, Language & Interplanetary Culture.
  </Typography>
</Box>


<Typography sx={{ fontSize: "18px", fontWeight: 'bold', color: galacticPalette.starNebula, mt: 2 }}>
  🌟 TDIL | The Dubey Industries Limited — Not Just a Company. A Civilization in Motion.
</Typography>
<Typography sx={{ fontSize: "18px", fontWeight: 700, color: galacticPalette.intellect, mt: 3 }}>
  🛡️ The TDIL “P.A.C.E.” Protocol – Born for Employees of Galactic Standards:
</Typography>

<Typography sx={{ fontSize: "16px", mt: 2 }}>
  <span style={{ color: galacticPalette.energyCore }}>🔹 <strong>P – Precision</strong></span>: Execute every duty with atomic accuracy. Mediocrity is betrayal.<br/>
  <span style={{ color: galacticPalette.trust }}>🔹 <strong>A – Accountability</strong></span>: Own every result. Victory or fault, your honor is in integrity.<br/>
  <span style={{ color: galacticPalette.quantumPulse }}>🔹 <strong>C – Creativity</strong></span>: Innovate relentlessly. From the smallest byte to the largest battalion, evolve everything.<br/>
  <span style={{ color: galacticPalette.safety }}>🔹 <strong>E – Excellence</strong></span>: Your baseline is the world’s pinnacle. Push beyond stars, even when unseen.
</Typography>

<Typography sx={{ fontSize: "16px", color: galacticPalette.quantumPulse, mt: 2 }}>
  🌌 You don’t just work at TDIL. You serve under a legacy that builds empires and empowers galaxies.
</Typography>

<Typography sx={{ fontSize: "15px", color: galacticPalette.trust, fontStyle: 'italic', mt: 2 }}>
  🧭 Carry the Crest. Breathe the Ethos. Expand the Frontier. <br/>#WeAreTDIL #GalacticIndustries
</Typography>


  <Typography sx={{ fontSize: "15px", mt: 2, fontStyle: 'italic', color: galacticPalette.trust }}>
    🔗 One symbol. One force. One future. #Galactic TDIL Legacy
  </Typography>
</Box>

      }
    >
      <Box sx={{ p: 0, m: 0, cursor: "pointer" }}>
        <MyJeevanLogo />
      </Box>
       <Box sx={{ 
            textAlign: 'left',
            borderRadius: '8px', // Rounded corners for style
            display: 'inline-block', // Keeps box size to content
          }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                display: 'block',
                lineHeight: '1.3',
                background: 'linear-gradient(37deg, #0016ff, #ff0000, #fff100)', // Blue to pink to purple gradient
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent', // Makes text transparent to show gradient
                WebkitTextStroke: '1px #000', // Dark pink stroke
                textStroke: '1px #000', // Standard property for future compatibility
                marginBottom:"-2px",
              }}
            >
              Empowering tdilcs
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: '5.2rem',
                fontWeight: 'bold',
                display: 'block',
                lineHeight: '1',
                background: 'linear-gradient(37deg, #0016ff, #ff0000, #fff100)', // Blue to pink to purple gradient
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent', // Makes text transparent to show gradient
                WebkitTextStroke: '1px #000', // Dark pink stroke
                textStroke: '1px #000', // Standard property for future compatibility
                marginBottom:"-2px",
              }}
            >
              Legal Department
            </Typography>
          </Box>
    </Tooltip>
  );
};

export default LogoWithGalacticTooltip;
