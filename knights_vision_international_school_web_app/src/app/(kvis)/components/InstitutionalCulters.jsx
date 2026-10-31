"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Fade,
  Button,
  IconButton,
} from "@mui/material";
import { School, ChevronLeft, ChevronRight } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const greenAccent = "#00c853";
const animationSpeed = "30s";

// Static fallback data
const defaultPrograms = [
  {
    id: 1,
    img_url:
      "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fprogram1.jpg?alt=media",
    title: "STEM Excellence Program",
    description:
      "A program fostering innovation in Science, Technology, Engineering, and Mathematics.",
    type: "ACADEMIC",
  },
  {
    id: 2,
    img_url:
      "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fprogram2.jpg?alt=media",
    title: "Cultural Arts Festival",
    description:
      "Annual event celebrating student creativity through art, music, and drama.",
    type: "CULTURAL",
  },
];

const BrowseSchoolProgramsContent = () => {
  const [programs, setPrograms] = useState(defaultPrograms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const carouselRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("programs_page") || "1", 10);

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("programs_page", pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch school programs
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/feature-schools-programs", {
        params: { page, pageSize },
      });
      const programData = response.data.programs.map((item) => ({
        id: item.id,
        img_url: item.img_url || "/images/program-placeholder.png",
        title: item.title || "Program",
        description: item.description || "No description available",
        type: item.type || "N/A",
      }));
      setPrograms(programData.length > 0 ? programData : defaultPrograms);
      setTotalPages(Math.ceil(response.data.total / pageSize));
      setError(null);
    } catch (err) {
      console.error("Error fetching school programs:", err);
      setError("Failed to fetch school programs.");
      toast.error("Failed to fetch school programs.");
      setPrograms(defaultPrograms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [page]);

  // Drag functionality
  useEffect(() => {
    const handleDrag = (ref) => {
      let isDragging = false;
      let startX;
      let scrollLeft;

      const startDragging = (e) => {
        isDragging = true;
        startX = e.pageX || e.touches[0].pageX;
        scrollLeft = ref.current.scrollLeft;
        ref.current.style.cursor = "grabbing";
      };

      const stopDragging = () => {
        isDragging = false;
        ref.current.style.cursor = "grab";
      };

      const move = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX || e.touches[0].pageX;
        const walk = (x - startX) * 1.5;
        ref.current.scrollLeft = scrollLeft - walk;
      };

      ref.current.addEventListener("mousedown", startDragging);
      ref.current.addEventListener("touchstart", startDragging);
      ref.current.addEventListener("mousemove", move);
      ref.current.addEventListener("touchmove", move);
      ref.current.addEventListener("mouseup", stopDragging);
      ref.current.addEventListener("touchend", stopDragging);
      ref.current.addEventListener("mouseleave", stopDragging);

      return () => {
        ref.current.removeEventListener("mousedown", startDragging);
        ref.current.removeEventListener("touchstart", startDragging);
        ref.current.removeEventListener("mousemove", move);
        ref.current.removeEventListener("touchmove", move);
        ref.current.removeEventListener("mouseup", stopDragging);
        ref.current.removeEventListener("touchend", stopDragging);
        ref.current.removeEventListener("mouseleave", stopDragging);
      };
    };

    if (carouselRef.current) handleDrag(carouselRef);
  }, [programs]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    updateUrlParams(newPage);
  };

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ background: "#121212", color: "#fff", py: 3, my: 3 }}>
        <ToastContainer
          theme="dark"
          position="bottom-center"
          autoClose={5000}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            px: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: "30vw",
              height: "48px",
              bgcolor: "#000",
              borderRadius: 3,
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{ width: "100px", height: "36px" }}
          />
        </Box>
        <Box
          className="carousel"
          sx={{ position: "relative", py: 1, overflow: "visible", px: 2 }}
        >
          <Box className="carousel-track" sx={{ display: "flex" }}>
            {[...Array(6)].map((_, index) => (
              <Box className="carousel-slide" key={`carousel-${index}`}>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  sx={{
                    height: 320,
                    width: 270,
                    bgcolor: "#000",
                    borderRadius: 3,
                    m: "0 2px",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#121212", color: "#fff", py: 3, my: 3 }}>
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: "30vw",
            bgcolor: "#000",
            backdropFilter: "blur(8px)",
            color: "#fff",
            p: 1,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            border: "1px solid #444",
          }}
        >
          <Typography
            variant="h5"
            sx={{ pl: 3, fontWeight: 500, letterSpacing: 0.5, color: "#fff" }}
          >
            Sure Success Point School Programs
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/ourInstitutionCulturesAndPrograms"
          variant="outlined"
          sx={{
            color: greenAccent,
            borderColor: greenAccent,
            "&:hover": { bgcolor: "rgba(0,200,83,0.1)" },
          }}
        >
          View All
        </Button>
      </Box>
      <style jsx global>{`
        @keyframes slideRightToLeft {
          0% {
            transform: translateX(calc(270px * ${programs.length}));
          }
          100% {
            transform: translateX(0);
          }
        }
        .carousel {
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        .carousel-track {
          display: flex;
          animation: slideRightToLeft ${animationSpeed} linear infinite;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
        .carousel-slide {
          flex: 0 0 270px;
          margin-right: 2px;
        }
        .carousel::before,
        .carousel::after {
          content: "";
          position: absolute;
          top: 0;
          height: 100%;
          width: 80px;
          zindex: 2;
          pointer-events: none;
        }
        .carousel::before {
          left: 0;
          background: linear-gradient(to right, #121212, transparent);
        }
        .carousel::after {
          right: 0;
          background: linear-gradient(to left, #121212, transparent);
        }
        .carousel-slide {
          min-width: 280px;
          max-width: 320px;
        }
      `}</style>
      <Box sx={{ flex: 1, maxHeight: "80vh", px: 2 }}>
        {error && (
          <Typography
            sx={{
              mt: 2,
              color: "#ff5252",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {error}
          </Typography>
        )}
        {!loading && programs.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ color: "#888", textAlign: "center", mt: 6, fontWeight: 500 }}
          >
            No school programs found.
          </Typography>
        ) : (
          <Box
            className="carousel"
            ref={carouselRef}
            sx={{ position: "relative", py: 1, overflow: "visible" }}
          >
            <Box className="carousel-track">
              {[...programs, ...programs].map((program, index) => (
                <Box className="carousel-slide" key={`${program.id}-${index}`}>
                  <Fade in timeout={500}>
                    <Link
                      href={`/ourInstitutionCulturesAndPrograms/${program.id}`}
                    >
                      <Paper
                        elevation={6}
                        sx={{
                          height: 320,
                          width: 270,
                          background: "#000",
                          borderRadius: 3,
                          border: "1px solid #444",
                          p: 3,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                            borderColor: greenAccent,
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            height: 120,
                            borderRadius: 2,
                            overflow: "hidden",
                            mb: 2,
                          }}
                        >
                          <img
                            src={program.img_url}
                            alt={program.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#fff",
                            fontWeight: 700,
                            mb: 1,
                            fontSize: "16px",
                          }}
                        >
                          {program.title?.substring(0, 30)}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <School
                            sx={{ color: "#ff0000", fontSize: 18, mr: 0.5 }}
                          />
                          <Typography variant="body2" sx={{ color: "#bbb" }}>
                            {program.type}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#bbb",
                            mb: 2,
                            lineHeight: 1.6,
                            fontSize: "14px",
                          }}
                        >
                          {program.description?.substring(0, 100)}...
                        </Typography>
                        <Button
                          component={Link}
                          href={`/ourInstitutionCulturesAndPrograms/${program.id}`}
                          variant="outlined"
                          sx={{
                            color: greenAccent,
                            borderColor: greenAccent,
                            "&:hover": { bgcolor: "rgba(0,200,83,0.1)" },
                            width: "100%",
                          }}
                        >
                          View Details
                        </Button>
                      </Paper>
                    </Link>
                  </Fade>
                </Box>
              ))}
            </Box>
            {totalPages > 1 && (
              <>
                <IconButton
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  sx={{
                    position: "absolute",
                    left: "0px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                    bgcolor:
                      page === 1 ? "rgba(51,51,51,0.5)" : "rgba(28,28,28,0.7)",
                    "&:hover": { bgcolor: "rgba(85,85,85,0.7)" },
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    zIndex: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  sx={{
                    position: "absolute",
                    right: "0px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                    bgcolor:
                      page === totalPages
                        ? "rgba(51,51,51,0.5)"
                        : "rgba(28,28,28,0.7)",
                    "&:hover": { bgcolor: "rgba(85,85,85,0.7)" },
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    zIndex: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  aria-label="Next page"
                >
                  <ChevronRight />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    position: "absolute",
                    bottom: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#bbb",
                    fontSize: "0.8rem",
                  }}
                >
                  Page {page} of {totalPages}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Wrapper component to handle Suspense
export default function BrowseSchoolPrograms() {
  return (
    <Suspense
      fallback={
        <Box sx={{ background: "#121212", color: "#fff", py: 3, my: 3 }}>
          <ToastContainer
            theme="dark"
            position="bottom-center"
            autoClose={5000}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              px: 2,
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                width: "30vw",
                height: "48px",
                bgcolor: "#000",
                borderRadius: 3,
              }}
            />
            <Skeleton
              variant="rectangular"
              sx={{ width: "100px", height: "36px" }}
            />
          </Box>
          <Box
            className="carousel"
            sx={{ position: "relative", py: 1, overflow: "visible", px: 2 }}
          >
            <Box className="carousel-track" sx={{ display: "flex" }}>
              {[...Array(6)].map((_, index) => (
                <Box className="carousel-slide" key={`carousel-${index}`}>
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{
                      height: 320,
                      width: 270,
                      bgcolor: "#000",
                      borderRadius: 3,
                      m: "0 2px",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      }
    >
      <BrowseSchoolProgramsContent />
    </Suspense>
  );
}
