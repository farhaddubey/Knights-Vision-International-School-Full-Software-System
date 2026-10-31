"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import TDILLogoUIWithGalacticTooltip from '../../administration/adminPanelTDILCS/tdil_logo_with_galatic_tooltip'; 
export default function VisionPage() {
  return (
    <Box
      sx={{
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        border:"2px",
        borderColor:"#fff",
        color: "white",
        textAlign: "center",
        padding: "30px 20px",

      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
         <TDILLogoUIWithGalacticTooltip/>
      </motion.div>
    </Box>
  );
}
