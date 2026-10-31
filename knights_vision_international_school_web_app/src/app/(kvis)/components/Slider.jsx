"use client";

import { useState, useEffect } from "react";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";

export default function Home() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch images from API
    axios
      .get("http://localhost:3000/api/site-homepage-carousel-web")
      .then((response) => {
        const fetchedImages = response.data.map((item) => item.img_url);
        setImages(fetchedImages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [images]);

  return (
    <Box sx={{ position: "relative", width: "100vw", height: "40vh", overflow: "hidden" }}>
      {/* Skeleton Loader or Image Slider */}
      {loading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ position: "absolute", top: 0, left: 0 }}
        />
      ) : (
        <AnimatePresence mode="sync">
          {images.length > 0 && (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.5, scale: 1.1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ position: "absolute", width: "100vw", height: "100vh" }}
            >
              <Image
                src={images[index]}
                alt="Background"
                layout="fill"
                objectFit="cover"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Box>
  );
}