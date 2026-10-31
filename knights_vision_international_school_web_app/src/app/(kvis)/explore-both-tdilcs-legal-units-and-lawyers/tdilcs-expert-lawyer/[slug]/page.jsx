"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { motion } from 'framer-motion';

const placeholderImage =
  "https://img.freepik.com/premium-photo/business-woman_946538-537.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740";

const LawyerProfilePage = () => {
  const [lawyerData, setLawyerData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedImages = useRef(new Set());

  const searchParams = useSearchParams();
  const router = useRouter();
  const lawyerId = searchParams.get('lawyer_id');

  const mockFAQs = [
    { question: 'Are your lawyers certified?', answer: 'Yes, all our lawyers are certified by the Bar Council.' },
    { question: 'Can I book offline appointments?', answer: 'Yes, we accept both online and offline appointments.' },
    { question: 'Do you handle court appearances?', answer: 'Our legal team can represent you in court as needed.' },
  ];

  useEffect(() => {
    const fetchLawyerData = async () => {
      if (!lawyerId) {
        setError('Invalid lawyer ID.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/users/lawyers_site_page/${lawyerId}`);
        const data = response.data;
        const hasMismatch = data.LawyerReview.some(
          (review) => review.rating <= 2 && review.feedback.toLowerCase().includes('strong')
        );
        const processedData = {
          ...data,
          img_url: data.img_url || placeholderImage,
          rating: data.LawyerReview?.length
            ? (data.LawyerReview.reduce((sum, r) => sum + r.rating, 0) / data.LawyerReview.length).toFixed(1)
            : "4.7",
          ratingMismatch: hasMismatch,
        };
        setLawyerData(processedData);
      } catch (err) {
        console.error(`Error fetching lawyer ${lawyerId}:`, err);
        setError('Failed to load lawyer data.');
        toast.error('Failed to load lawyer data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLawyerData();
  }, [lawyerId]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredServices = lawyerData?.LawyerServiceMapping?.filter((mapping) =>
    [mapping.service.name, ...lawyerData.LawyerProfileSpecializationTag.map((tag) => tag.tag.name)]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const formatUsername = (username) =>
    username
      ? username
          .replace("adv_", "")
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Unknown Lawyer";

  const handleImageError = (e, id) => {
    if (!loadedImages.current.has(id)) {
      loadedImages.current.add(id);
      e.target.src = placeholderImage;
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', bgcolor: '#121212' }}>
        <CircularProgress size={60} sx={{ color: '#fff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!lawyerData) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          Lawyer not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          bgcolor: '#000',
          minHeight: '90vh',
          color: '#fff',
          display: {xs:'block', sm:'block', md:'flex'},
          flexDirection: 'row',
          px: 2,
          py: 1,
        }}
      >
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {/* Left side: Fixed Lawyer Info */}
        <Box
          sx={{
            width: {xs:'95vw', sm:'95vw', md:'18vw'},
            height: '90vh',
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pr: 2,
            borderRight: '1px solid #333',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: '0px' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '60px',
                height: '60px',
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #00c853',
              }}
            >
              <Image
                src={lawyerData.img_url}
                alt={formatUsername(lawyerData.user?.username)}
                fill
                style={{ objectFit: 'cover' }}
                sizes="60px"
                onError={(e) => handleImageError(e, lawyerData.id)}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatUsername(lawyerData.user?.username)}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            {lawyerData.specialization} Specialist
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: '#bbb', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              {lawyerData.city_or_block}, {lawyerData.district}, {lawyerData.state}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
            {lawyerData.bio}
          </Typography>
          <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 500 }}>
            ★ {lawyerData.rating}/5 ({lawyerData.LawyerReview.length} reviews)
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mt: 2, bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
            onClick={() => toast.info(`Booking consultation with ${formatUsername(lawyerData.user?.username)}`)}
          >
            Book Consultation
          </Button>
          <Divider sx={{ my: 2, borderColor: '#333' }} />
          <Typography variant="h6" sx={{ color: '#fff' }}>
            About
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Education:</strong> {lawyerData.highest_degree} ({lawyerData.highest_marks}) from {lawyerData.clg_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Experience:</strong> {lawyerData.years_experience} years
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Languages:</strong> {lawyerData.languages_known}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Bar Registration:</strong> {lawyerData.bar_registration_no}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Aadhar Verified:</strong> {lawyerData.aadhar_verified ? '✅ Yes' : 'No'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Contact:</strong> {lawyerData.phone_display} | WhatsApp: {lawyerData.whatsapp}
          </Typography>
          {lawyerData.LawyerCompanyExperience?.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: '#333' }} />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Work Experience
              </Typography>
              {lawyerData.LawyerCompanyExperience.map((exp, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    <strong>{exp.position}</strong> at {exp.company_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    {new Date(exp.start_date).toLocaleDateString()} – {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    {exp.description}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </Box>

        {/* Right side: Hero Image, Navigation, and Content */}
        <Box
          sx={{
            width: {xs:'95vw', sm:'95vw', md:'82vw'},
            flexGrow: 1,
            pl: {xs:0, md:2},
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: '0px' },
          }}
        >
          {/* Hero Image */}
          <Box
            sx={{
              height: '300px',
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <Image
              src={lawyerData.img_url}
              alt="Lawyer Profile Hero"
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
              onError={(e) => handleImageError(e, lawyerData.id)}
              priority
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0,0,0,0.6)',
                p: 1,
                color: '#fff',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatUsername(lawyerData.user?.username)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#bbb' }}>
                {lawyerData.specialization} | {lawyerData.years_experience} Years Experience
              </Typography>
            </Box>
          </Box>

          {/* Navigation Strip */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              bgcolor: '#000',
              zIndex: 10,
              display: 'flex',
              gap: 2,
              py: 1,
              borderBottom: '1px solid #333',
              mb: 2,
              display:{xs:'none', md:'block'}
            }}
          >
            {['Overview', 'About', 'Work Experience', 'Certifications', 'Services Offered', 'Reviews', 'Case Records', 'FAQs', 'Book Now'].map((item) => (
              <Button
                key={item}
                variant="text"
                sx={{ color: '#fff', '&:hover': { bgcolor: '#333' } }}
                onClick={() => {
                  document.getElementById(item.toLowerCase().replace(/ /g, '-')).scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Overview */}
          <motion.div id="overview" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Overview
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#1c1c1c', borderRadius: 2, display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box
                sx={{
                  width: '200px',
                  height: '200px',
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '3px solid #00c853',
                }}
              >
                <Image
                  src={lawyerData.img_url}
                  alt={formatUsername(lawyerData.user?.username)}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="200px"
                  onError={(e) => handleImageError(e, lawyerData.id)}
                />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ color: '#bbb', mb: 2 }}>
                  {lawyerData.bio} Specializing in {lawyerData.specialization}, with {lawyerData.years_experience} years of experience in {lawyerData.district}, {lawyerData.state}.
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFD700' }}>
                  ★ {lawyerData.rating}/5 ({lawyerData.LawyerReview.length} reviews)
                </Typography>
              </Box>
            </Paper>
          </motion.div>

          {/* About */}
          <motion.div id="about" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              About
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#1c1c1c', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Education:</strong> {lawyerData.highest_degree} ({lawyerData.highest_marks}) from {lawyerData.clg_name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Experience:</strong> {lawyerData.years_experience} years
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Languages:</strong> {lawyerData.languages_known}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Bar Registration:</strong> {lawyerData.bar_registration_no}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Aadhar Verified:</strong> {lawyerData.aadhar_verified ? '✅ Yes' : 'No'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                <strong>Department:</strong> {lawyerData.department}
              </Typography>
            </Paper>
          </motion.div>

          {/* Work Experience */}
          <motion.div id="work-experience" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Work Experience
            </Typography>
            {lawyerData.LawyerCompanyExperience?.length > 0 ? (
              <Grid container spacing={3}>
                {lawyerData.LawyerCompanyExperience.map((exp, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#1c1c1c',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff' }}>
                        {exp.position}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Company:</strong> {exp.company_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Period:</strong> {new Date(exp.start_date).toLocaleDateString()} – {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        {exp.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                No work experience available.
              </Typography>
            )}
          </motion.div>

          {/* Certifications */}
          <motion.div id="certifications" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Certifications
            </Typography>
            {lawyerData.LawyerCertification?.length > 0 ? (
              <Grid container spacing={3}>
                {lawyerData.LawyerCertification.map((cert, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#1c1c1c',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff' }}>
                        {cert.cert_title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Issued By:</strong> {cert.issued_by}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Issue Date:</strong> {new Date(cert.issue_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Expiry Date:</strong> {new Date(cert.expiry_date).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                No certifications available.
              </Typography>
            )}
          </motion.div>

          {/* Services Offered */}
          <motion.div id="services-offered" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
                Services Offered
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search services..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  width: '100%',
                  maxWidth: '400px',
                  bgcolor: '#1c1c1c',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#00c853' },
                  },
                  '& .MuiInputAdornment-root': { color: '#bbb' },
                  '& .MuiInputBase-input': { color: '#fff' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Grid container spacing={3}>
              {filteredServices.length > 0 ? (
                filteredServices.map((mapping, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#1c1c1c',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff' }}>
                        {mapping.service.name}
                      </Typography>
                      <Chip
                        label={
                          lawyerData.LawyerProfileSpecializationTag[
                            index % lawyerData.LawyerProfileSpecializationTag.length
                          ].tag.name
                        }
                        size="small"
                        sx={{ bgcolor: '#00c853', color: '#fff' }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mt: 1, bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
                        onClick={() => router.push(`/book-services/${mapping.service.slug}`)}
                      >
                        Request Service
                      </Button>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    No services match your search.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </motion.div>

          {/* Reviews & Ratings */}
          <motion.div id="reviews" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Reviews & Ratings
            </Typography>
            <Typography variant="body2" sx={{ color: '#FFD700', mb: 2 }}>
              Average Rating: ★ {lawyerData.rating}/5 ({lawyerData.LawyerReview.length} reviews)
              {lawyerData.ratingMismatch && (
                <Typography variant="caption" sx={{ color: '#ff5252', ml: 1 }}>
                  (Potential mismatch: Positive feedback with low ratings detected)
                </Typography>
              )}
            </Typography>
            {lawyerData.LawyerReview?.length > 0 ? (
              <Grid container spacing={3}>
                {lawyerData.LawyerReview.map((review, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#1c1c1c',
                        borderRadius: 2,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        "{review.feedback}"
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFD700' }}>
                        - {review.client_name} (★ {review.rating}/5)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#bbb', display: 'block' }}>
                        Reviewed on {new Date(review.reviewed_at).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                No reviews available.
              </Typography>
            )}
          </motion.div>

          {/* Case Records */}
          <motion.div id="case-records" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Case Records
            </Typography>
            {lawyerData.LawyerCaseRecord?.length > 0 ? (
              <Grid container spacing={3}>
                {lawyerData.LawyerCaseRecord.map((caseRecord, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#1c1c1c',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff' }}>
                        {caseRecord.case_title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Type:</strong> {caseRecord.case_type}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Court:</strong> {caseRecord.court_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        <strong>Year:</strong> {caseRecord.year}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            caseRecord.result === 'Won'
                              ? '#00c853'
                              : caseRecord.result === 'Settled'
                              ? '#FFD700'
                              : caseRecord.result === 'Ongoing'
                              ? '#2196f3'
                              : '#ff5252',
                        }}
                      >
                        <strong>Result:</strong> {caseRecord.result}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        {caseRecord.summary}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                No case records available.
              </Typography>
            )}
          </motion.div>

          {/* FAQs */}
          <motion.div id="faqs" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Frequently Asked Questions
            </Typography>
            <Grid container spacing={2}>
              {mockFAQs.map((faq, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#1c1c1c',
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' },
                    }}
                  >
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {faq.question}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      {faq.answer}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Contact & Booking */}
          <motion.div id="book-now" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Contact & Booking
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#1c1c1c', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                <strong>Address:</strong> {lawyerData.city_or_block}, {lawyerData.district}, {lawyerData.state}, {lawyerData.pincode}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                <strong>Contact:</strong> {lawyerData.phone_display}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                <strong>WhatsApp:</strong> {lawyerData.whatsapp}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
                  onClick={() => toast.info(`Booking consultation with ${formatUsername(lawyerData.user?.username)}`)}
                >
                  Book Consultation
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
                  onClick={() => toast.info('Connecting to lawyer...')}
                >
                  Talk to Lawyer Now
                </Button>
              </Box>
            </Paper>
          </motion.div>

          {/* Sticky Booking Footer */}
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              bgcolor: '#000',
              p: 2,
              borderTop: '1px solid #333',
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
              onClick={() => toast.info(`Booking consultation with ${formatUsername(lawyerData.user?.username)}`)}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LawyerProfilePage;