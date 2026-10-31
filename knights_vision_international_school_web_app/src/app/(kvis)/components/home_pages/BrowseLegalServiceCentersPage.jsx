'use client';

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
import { LocationOn, ChevronLeft, ChevronRight } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const greenAccent = "#00c853";
const animationSpeed = "30s";

const BrowseLegalServiceCentersContent = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [countrySlug, setCountrySlug] = useState(null);
  const pageSize = 20;
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('centers_page') || '1', 10);

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('centers_page', pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch user's country via IP
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const countryName = response.data.country_name?.toLowerCase().replace(/\s+/g, '-');
        setCountrySlug(countryName || 'united-states'); // Fallback
        console.log('Detected country:', countryName);
      } catch (err) {
        console.error('Error detecting country:', err);
        setCountrySlug('united-states'); // Fallback
      }
    };
    fetchCountry();
  }, []);

  // Fetch centers
  const fetchCenters = async () => {
    if (!countrySlug) return;
    setLoading(true);
    try {
      const response = await axios.get("/api/api_next_app/legal-service-centers/home_page", {
        params: {
          page,
          pageSize,
          countrySlug,
        },
      });
      setCenters(response.data.centers || []);
      setTotalPages(Math.ceil(response.data.total / pageSize));
      setError(null);
      console.log('Fetched centers:', response.data, { total: response.data.total, totalPages: Math.ceil(response.data.total / pageSize) });
    } catch (err) {
      console.error("Error fetching centers:", err);
      setError("Failed to fetch legal service centers.");
      toast.error("Failed to fetch legal service centers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, [page, countrySlug]);

  // Split centers into two rows
  const row1Centers = centers.filter((_, index) => index % 2 === 0);
  const row2Centers = centers.filter((_, index) => index % 2 !== 0);

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
  }, [centers]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    updateUrlParams(newPage);
  };

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          background: "#121212",
          color: "#fff",
          p: 3,
          mb: 5,
        }}
      >
        <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
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
          <Skeleton variant="rectangular" sx={{ width: "100px", height: "36px" }} />
        </Box>
        <Box sx={{ flex: 1, maxHeight: "80vh" }}>
          {/* Row 1 skeleton */}
          <Box className="carousel" sx={{ mb: 4, position: 'relative', py: 1, overflow: 'visible' }}>
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
          <Box className="carousel" sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
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
    <Box
      sx={{
        background: "#121212",
        color: "#fff",
        p: 3,
        mb: 5,
      }}
    >
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
            sx={{
              pl: 3,
              fontWeight: 500,
              letterSpacing: 0.5,
              color: "#fff",
            }}
          >
            Legal Service Centers
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() =>
            router.push(`/explore-both-tdilcs-legal-units-and-lawyers/${countrySlug || 'united-states'}?explore_state=user_state&explore_flag=tdilcs-legal-units`)
          }
        >
          View All
        </Button>
      </Box>
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(
              calc(-270px * ${Math.max(row1Centers.length, row2Centers.length)})
            );
          }
        }
        .carousel {
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        .carousel-track {
          display: flex;
          animation: slide ${animationSpeed} linear infinite;
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
          z-index: 2;
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
            sx={{ mt: 2, color: "#ff5252", fontWeight: 600, textAlign: "center" }}
          >
            {error}
          </Typography>
        )}
        {!loading && centers.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ color: "#888", textAlign: "center", mt: 6, fontWeight: 500 }}
          >
            No legal service centers found.
          </Typography>
        ) : (
          <Box>
            {/* Row 1 with Pagination */}
            <Box className="carousel" ref={row1Ref} sx={{ mb: 4, position: 'relative', py: 1, overflow: 'visible' }}>
              <Box className="carousel-track">
                {[...row1Centers, ...row1Centers].map((center, index) => (
                  <Box className="carousel-slide" key={`${center.id}-row1-${index}`}>
                    <Fade in timeout={500}>
                      <Link
                        href={`/explore-both-tdilcs-legal-units-and-lawyers/${
                          center?.country?.slug || ""
                        }?explore_state=${center?.state?.slug || ""}&explore_flag=tdilcs-legal-units`}
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
                                center.coverImageUrl ||
                                "/images/center-placeholder.png"
                              }
                              alt={center.name}
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
                              mb: 2,
                              fontSize: "16px",
                            }}
                          >
                            {center.name?.substring(0, 30)}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <LocationOn
                              sx={{ color: "#ff0000", fontSize: 18, mr: 0.5 }}
                            />
                            <Typography variant="body2" sx={{ color: "#bbb" }}>
                              {[
                                center.city,
                                center.state?.name,
                                center.country?.name,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "#bbb", mb: 2, lineHeight: 1.6 }}
                          >
                            {center.description?.substring(0, 120)}...
                          </Typography>
                          <Button
                            component={Link}
                            href={`/explore-both-tdilcs-legal-units-and-lawyers/legal-unit/${center.slug}`}
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
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <>
                  <IconButton
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    sx={{
                      position: 'absolute',
                      left: '0px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#fff',
                      bgcolor: page === 1 ? 'rgba(51,51,51,0.5)' : 'rgba(28,28,28,0.7)',
                      '&:hover': {
                        bgcolor: 'rgba(85,85,85,0.7)',
                      },
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      zIndex: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    sx={{
                      position: 'absolute',
                      right: '0px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#fff',
                      bgcolor: page === totalPages ? 'rgba(51,51,51,0.5)' : 'rgba(28,28,28,0.7)',
                      '&:hover': {
                        bgcolor: 'rgba(85,85,85,0.7)',
                      },
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      zIndex: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </IconButton>
                  <Typography
                    variant="body2"
                    sx={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: '#bbb',
                      fontSize: '0.8rem',
                    }}
                  >
                    Page {page} of {totalPages}
                  </Typography>
                </>
              )}
            </Box>
            {/* Row 2 */}
            <Box className="carousel" ref={row2Ref} sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
              <Box className="carousel-track">
                {[...row2Centers, ...row2Centers].map((center, index) => (
                  <Box className="carousel-slide" key={`${center.id}-row2-${index}`}>
                    <Fade in timeout={500}>
                      <Link
                        href={`/explore-both-tdilcs-legal-units-and-lawyers/${
                          center?.country?.slug || ""
                        }?explore_state=${center?.state?.slug || ""}&explore_flag=tdilcs-legal-units`}
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
                                center.coverImageUrl ||
                                "/images/center-placeholder.png"
                              }
                              alt={center.name}
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
                              mb: 2,
                              fontSize: "16px",
                            }}
                          >
                            {center.name?.substring(0, 30)}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <LocationOn
                              sx={{ color: "#ff0000", fontSize: 18, mr: 0.5 }}
                            />
                            <Typography variant="body2" sx={{ color: "#bbb" }}>
                              {[
                                center.city,
                                center.state?.name,
                                center.country?.name,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "#bbb", mb: 2, lineHeight: 1.6 }}
                          >
                            {center.description?.substring(0, 120)}...
                          </Typography>
                          <Button
                            component={Link}
                            href={`/explore-both-tdilcs-legal-units-and-lawyers/legal-unit/${center.slug}`}
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
import { Suspense } from 'react';

export default function BrowseLegalServiceCentersPage() {
  return (
    <Suspense fallback={ <Box
        sx={{
          background: "#121212",
          color: "#fff",
          p: 3,
          mb: 5,
        }}
      >
        <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
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
          <Skeleton variant="rectangular" sx={{ width: "100px", height: "36px" }} />
        </Box>
        <Box sx={{ flex: 1, maxHeight: "80vh" }}>
          {/* Row 1 skeleton */}
          <Box className="carousel" sx={{ mb: 4, position: 'relative', py: 1, overflow: 'visible' }}>
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
          <Box className="carousel" sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
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
      </Box>}>
      <BrowseLegalServiceCentersContent />
    </Suspense>
  );
}