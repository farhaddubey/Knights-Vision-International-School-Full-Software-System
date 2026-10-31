"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

const BrowseServiceFeatureGroupsPage = () => {
  const [featureGroups, setFeatureGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeatureGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/api_next_app/service_feature_groups");
      setFeatureGroups(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching feature groups:", err);
      setError("Failed to fetch feature groups.");
      toast.error("Failed to fetch feature groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureGroups();
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: "#000",
          color: "#fff",
          p: 1,
          overflowY: "auto",
        }}
      >
        <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
        <Grid container spacing={2} px={3}>
          {[...Array(6)].map((_, groupIndex) => (
            <Grid item xs={12} sm={6} lg={4} key={groupIndex}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '31vw',
                  backgroundColor: '#101010',
                  borderRadius: 2,
                  height: '400px', // Approximate height based on content
                }}
              >
                {/* Header skeleton */}
                <Skeleton
                  variant="rectangular"
                  sx={{
                    bgcolor: '#333',
                    height: '48px',
                    width: '100%',
                  }}
                />
                {/* Service cards skeleton */}
                <Box sx={{ p: 1 }}>
                  <Grid container spacing={0.3}>
                    {[...Array(4)].map((_, serviceIndex) => (
                      <Grid item xs={6} key={serviceIndex}>
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            bgcolor: '#000',
                            borderRadius: 2,
                            width: '14.9vw',
                            height: '180px', // Approximate service card height
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Skeleton>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4, bgcolor: "#121212", color: "#fff" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        p: 1,
        overflowY: "auto",
      }}
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      <Grid container spacing={2}>
        {featureGroups.map((group) => (
          <Grid item xs={12} sm={6} lg={4} key={group.id}>
            <Paper
              elevation={3}
              sx={{
                 width: {xs:"96vw", md:"32.2vw"},
                backgroundColor: '#101010',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  bgcolor: group.tagColor || '#333',
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontSize: {xs:'16px', md:'20px'}, color: '#000', fontWeight: 600 }}>
                  {group.title}
                </Typography>
                {group.label && (
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: '#3e2723',
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {group.label}
                  </Typography>
                )}
              </Box>

              {/* Service Cards */}
              <Box sx={{ p: 1, flexGrow: 1, alignItems: 'center' }}>
                <Grid container spacing={0.3}>
                  {group.services.slice(0, 4).map((mapping, index) => (
                    <Link key={mapping.service.id} href={`/book-services/${mapping.service.slug}`}>
                      <Grid item xs={12} sm={6} lg={4} key={mapping.service.id}>
                        <Paper
                          sx={{
                            p: 2,
                            py: 2,
                            bgcolor: '#000',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            height: '100%',
                            width: {xs:"44.7vw", md:"15.5vw"},
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                              border: '.4px solid #4caf50',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              aspectRatio: '1/1',
                              borderRadius: 2,
                              overflow: 'hidden',
                              mb: 1.5,
                              backgroundColor: mapping.service.image ? 'transparent' : '#444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {mapping.service.image ? (
                              <img
                                src={mapping.service.image}
                                alt={mapping.service.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Typography color="#888">No Image</Typography>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                            {mapping.service.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#00c853',}}>
                            ₹{mapping.service.price}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Link>
                  ))}

                  {group.services.length === 0 && (
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        No services mapped.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BrowseServiceFeatureGroupsPage;