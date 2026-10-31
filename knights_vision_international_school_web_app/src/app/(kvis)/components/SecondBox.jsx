"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

export default function VisionPage() {
  return (
    <Box
      sx={{
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#101010",
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
         <Image width={50} height={50}
                        src={"/tdil/tdil-96x96.png"}
                        alt="TDIL | The Dubey Industries Limited"
                      />
        <Typography variant="h5" sx={{fontSize:{xs:15, md:25}, fontWeight: "bold", lineHeight: 1.2 }}>
        Engineering the Future, Expanding the Universe.
        </Typography>
        <Typography variant="h4" sx={{fontSize:{xs:20, md:35}, marginTop: "20px", maxWidth: "1300px", mx: "auto" }}>
        <b>The Dubey Industries Limited</b> is <strong>not</strong> a <b>Fortune 500® company</b> and is
        </Typography>
        <Typography variant="h4" sx={{fontSize:{xs:18, md:35},  maxWidth: "1400px", mx: "auto" }}>
          <strong> not the largest private sector corporation in the World.</strong>
        </Typography>
      </motion.div>
    </Box>
  );
}
