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
const animationSpeed = "20s";

// Static fallback data
const defaultResults = [
  {
    id: 1,
    img_url:
      "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fstudent1.jpg?alt=media",
    title: "Aarav Sharma",
    position: "1st Rank",
    marks: "98%",
    pass_year: "2023",
    college: "IIT Delhi",
    designation: "Software Engineer",
    qualified_profession_year: "2024",
    highest_awards: "National Science Award",
    highest_respect: "Top Innovator",
  },
  {
    id: 2,
    img_url:
      "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fstudent2.jpg?alt=media",
    title: "Priya Patel",
    position: "2nd Rank",
    marks: "95%",
    pass_year: "2023",
    college: "AIIMS",
    designation: "Medical Intern",
    qualified_profession_year: "2024",
    highest_awards: "Medical Excellence Award",
    highest_respect: "Community Leader",
  },
];

const BrowseStudentResultsContent = () => {
  const [results, setResults] = useState(defaultResults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 40;
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("results_page") || "1", 10);

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("results_page", pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch student results
  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/feature-students-results", {
        params: { page, pageSize },
      });
      const resultData = response.data.results.map((item) => ({
        id: item.id,
        img_url: item.img_url,
        title: item.title || "Student",
        position: item.position || "N/A",
        marks: item.marks || "N/A",
        pass_year: item.pass_year || "N/A",
        college: item.college || "N/A",
        designation: item.designation || "N/A",
        qualified_profession_year: item.qualified_profession_year || "N/A",
        highest_awards: item.highest_awards || "N/A",
        highest_respect: item.highest_respect || "N/A",
      }));
      setResults(resultData.length > 0 ? resultData : defaultResults);
      setTotalPages(Math.ceil(response.data.total / pageSize));
      setError(null);
    } catch (err) {
      console.error("Error fetching student results:", err);
      setError("Failed to fetch student results.");
      toast.error("Failed to fetch student results.");
      setResults(defaultResults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page]);

  // Split results into two rows
  const row1Results = results.filter((_, index) => index % 2 === 0);
  const row2Results = results.filter((_, index) => index % 2 !== 0);

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

    if (row1Ref.current) handleDrag(row1Ref);
    if (row2Ref.current) handleDrag(row2Ref);
  }, [results]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    updateUrlParams(newPage);
  };

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ background: "#121212", color: "#fff", p: 3, mb: 5 }}>
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
        <Box sx={{ flex: 1, maxHeight: "80vh" }}>
          {/* Row 1 skeleton */}
          <Box
            className="carousel"
            sx={{ mb: 4, position: "relative", py: 1, overflow: "visible" }}
          >
            <Box className="carousel-track" sx={{ display: "flex" }}>
              {[...Array(6)].map((_, index) => (
                <Box className="carousel-slide" key={`row1-${index}`}>
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
          {/* Row 2 skeleton */}
          <Box
            className="carousel"
            sx={{ position: "relative", py: 1, overflow: "visible" }}
          >
            <Box className="carousel-track" sx={{ display: "flex" }}>
              {[...Array(6)].map((_, index) => (
                <Box className="carousel-slide" key={`row2-${index}`}>
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
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#121212", color: "#fff", p: 3, mb: 5 }}>
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: "40vw",
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
            Sure Success Point School Top Achievers
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push("/explore-student-results")}
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
            transform: translateX(
              calc(270px * ${Math.max(row1Results.length, row2Results.length)})
            );
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
      <Box sx={{ flex: 1, maxHeight: "80vh" }}>
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
        {!loading && results.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ color: "#888", textAlign: "center", mt: 6, fontWeight: 500 }}
          >
            No student results found.
          </Typography>
        ) : (
          <Box>
            {/* Row 1 with Pagination */}
            <Box
              className="carousel"
              ref={row1Ref}
              sx={{ mb: 4, position: "relative", py: 1, overflow: "visible" }}
            >
              <Box className="carousel-track">
                {[...row1Results, ...row1Results].map((result, index) => (
                  <Box
                    className="carousel-slide"
                    key={`${result.id}-row1-${index}`}
                  >
                    <Fade in timeout={500}>
                      <Link href={`/explore-student-results/${result.id}`}>
                        <Paper
                          elevation={6}
                          sx={{
                            height: 330,
                            width: 270,
                            background: "#000",
                            borderRadius: 3,
                            border: "1px solid #444",
                            p: 3,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                              borderColor: greenAccent,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              height: 90,
                              borderRadius: 2,
                              overflow: "hidden",
                              mb: 2,
                            }}
                          >
                            <img
                              src={
                                result.img_url ||
                                "/images/student-placeholder.png"
                              }
                              alt={result.title}
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
                            {result.title?.substring(0, 30)}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <School
                              sx={{ color: "#ff0000", fontSize: 18, mr: 0.5 }}
                            />
                            <Typography variant="body2" sx={{ color: "#bbb" }}>
                              {result.position}, {result.marks},{" "}
                              {result.pass_year}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "#bbb", mb: 1, lineHeight: 1.6 }}
                          >
                            {result.college?.substring(0, 50)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#bbb", mb: 2, lineHeight: 1.6 }}
                          >
                            {result.designation} (
                            {result.qualified_profession_year})
                          </Typography>
                          <Button
                            component={Link}
                            href={`/explore-student-results/${result.id}`}
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
                        page === 1
                          ? "rgba(51,51,51,0.5)"
                          : "rgba(28,28,28,0.7)",
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
            {/* Row 2 */}
            <Box
              className="carousel"
              ref={row2Ref}
              sx={{ position: "relative", py: 1, overflow: "visible" }}
            >
              <Box className="carousel-track">
                {[...row2Results, ...row2Results].map((result, index) => (
                  <Box
                    className="carousel-slide"
                    key={`${result.id}-row2-${index}`}
                  >
                    <Fade in timeout={500}>
                      <Link href={`/explore-student-results/${result.id}`}>
                        <Paper
                          elevation={6}
                          sx={{
                            height: 330,
                            width: 270,
                            background: "#000",
                            borderRadius: 3,
                            border: "1px solid #444",
                            p: 3,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                              borderColor: greenAccent,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              height: 90,
                              borderRadius: 2,
                              overflow: "hidden",
                              mb: 2,
                            }}
                          >
                            <img
                              src={
                                result.img_url ||
                                "/images/student-placeholder.png"
                              }
                              alt={result.title}
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
                            {result.title?.substring(0, 30)}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <School
                              sx={{ color: "#ff0000", fontSize: 18, mr: 0.5 }}
                            />
                            <Typography variant="body2" sx={{ color: "#bbb" }}>
                              {result.position}, {result.marks},{" "}
                              {result.pass_year}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "#bbb", mb: 1, lineHeight: 1.6 }}
                          >
                            {result.college?.substring(0, 50)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#bbb", mb: 2, lineHeight: 1.6 }}
                          >
                            {result.designation} (
                            {result.qualified_profession_year})
                          </Typography>
                          <Button
                            component={Link}
                            href={`/explore-student-results/${result.id}`}
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
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Wrapper component to handle Suspense
export default function BrowseStudentResultsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ background: "#121212", color: "#fff", p: 3, mb: 5 }}>
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
          <Box sx={{ flex: 1, maxHeight: "80vh" }}>
            <Box
              className="carousel"
              sx={{ mb: 4, position: "relative", py: 1, overflow: "visible" }}
            >
              <Box className="carousel-track" sx={{ display: "flex" }}>
                {[...Array(6)].map((_, index) => (
                  <Box className="carousel-slide" key={`row1-${index}`}>
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
            <Box
              className="carousel"
              sx={{ position: "relative", py: 1, overflow: "visible" }}
            >
              <Box className="carousel-track" sx={{ display: "flex" }}>
                {[...Array(6)].map((_, index) => (
                  <Box className="carousel-slide" key={`row2-${index}`}>
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
        </Box>
      }
    >
      <BrowseStudentResultsContent />
    </Suspense>
  );
}
