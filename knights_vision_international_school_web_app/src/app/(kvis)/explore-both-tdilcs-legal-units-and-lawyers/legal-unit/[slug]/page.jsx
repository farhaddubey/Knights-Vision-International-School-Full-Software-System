"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { Search as SearchIcon, LocationOn, Map as MapIcon } from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { motion } from 'framer-motion';

const placeholderImage = 'https://picsum.photos/200/200?random=6';
const placeholderMapImage = '/placeholder-map.jpg'; // Fallback image for missing map

const LegalUnitPage = () => {
  const [legalUnitData, setLegalUnitData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const router = useRouter();
  const legalUnitSlug = pathname.split('/').pop();

  // Mock data for services, experts, work experience, case records, and FAQs
  const mockServices = [
    { id: 1, name: 'Tax Consultation', slug: 'tax-consultation', price: '$500', tag: 'Tax Law', cta: 'Get Help' },
    { id: 2, name: 'Visa Applications', slug: 'visa-applications', price: '$800', tag: 'Immigration', cta: 'Request Now' },
    { id: 3, name: 'Legal Compliance Audit', slug: 'legal-compliance-audit', price: '$1200', tag: 'Corporate', cta: 'View Details' },
  ];

  const mockExperts = [
    { id: 1, name: 'John Doe', specialization: 'Tax Law', experience: 10, rating: 4.8, photo: 'https://picsum.photos/100/100?random=2' },
    { id: 2, name: 'Jane Smith', specialization: 'Immigration', experience: 8, rating: 4.7, photo: 'https://picsum.photos/100/100?random=3', isFemale: true },
    { id: 3, name: 'Michael Brown', specialization: 'Corporate Law', experience: 12, rating: 4.9, photo: 'https://picsum.photos/100/100?random=4' },
  ];

  const mockWorkExperience = [
    { id: 1, position: 'Senior Legal Consultant', company_name: 'Central Legal Advisory', start_date: '2018-01-01', end_date: null, description: 'Led tax and immigration cases.' },
    { id: 2, position: 'Associate Lawyer', company_name: 'Global Law Firm', start_date: '2015-06-01', end_date: '2017-12-31', description: 'Handled compliance audits.' },
  ];

  const mockCaseRecords = [
    { id: 1, case_title: 'Tax Evasion Case', case_type: 'Tax', court_name: 'Central District Court', year: 2023, result: 'Won', summary: 'Successfully defended client against tax evasion charges.' },
    { id: 2, case_title: 'Visa Dispute', case_type: 'Immigration', court_name: 'Immigration Tribunal', year: 2024, result: 'Settled', summary: 'Resolved visa application dispute.' },
  ];

  const mockFAQs = [
    { question: 'Are your lawyers certified?', answer: 'Yes, all our lawyers are certified by the Bar Council.' },
    { question: 'Can I book offline appointments?', answer: 'Yes, we accept both online and offline appointments.' },
    { question: 'Do you handle court appearances?', answer: 'Our legal team can represent you in court as needed.' },
  ];

  useEffect(() => {
    const fetchLegalUnitData = async () => {
      if (!legalUnitSlug) {
        setError('Invalid legal unit slug.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/legal-service-centers/by_slug?slug=${legalUnitSlug}`);
        setLegalUnitData(response.data);
      } catch (err) {
        console.error(`Error fetching legal unit ${legalUnitSlug}:`, err);
        setError('Failed to load legal unit data.');
        toast.error('Failed to load legal unit data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLegalUnitData();
  }, [legalUnitSlug]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredServices = mockServices.filter((service) =>
    [service.name, service.tag]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  if (!legalUnitData || !legalUnitData.data) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          Legal unit not found.
        </Typography>
      </Box>
    );
  }

  const { data: legalUnit } = legalUnitData;

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
        {/* Left side: Legal Unit Info */}
        <Box
          sx={{
            width: {xs:'95vw', sm:'95vw', md:'18vw'},
            height: '90vh',
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
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={legalUnit.logoUrl || placeholderImage}
                alt={legalUnit.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="60px"
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {legalUnit.name}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            Your Local Legal Shield | Trusted. Verified. Affordable.
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            {legalUnit.city}, {legalUnit.stateId ? `State ID: ${legalUnit.stateId}` : 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
            Resolving Land, Civil, Family, Corporate & Criminal Legal Matters Swiftly.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            href={legalUnit.bookingUrl}
            sx={{ mt: 2, bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
          >
            Book Consultation
          </Button>
          <Divider sx={{ my: 2, borderColor: '#333' }} />
          <Typography variant="h6" sx={{ color: '#fff' }}>
            About {legalUnit.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            {legalUnit.description}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Years of Experience:</strong> Established in {new Date(legalUnit.createdAt).getFullYear()}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Legal Areas:</strong> {legalUnit.specializations.join(', ')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Service Region:</strong> {legalUnit.city}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Accreditation:</strong> {legalUnit.complianceCertificates.join(', ')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            <strong>Success Stories:</strong>
            <ul>
              <li>Solved 280+ land encroachment cases in under 45 days.</li>
              <li>Resolved ₹2 Cr worth property disputes.</li>
            </ul>
          </Typography>
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
                src={legalUnit.logoUrl || placeholderImage}
                alt={legalUnit.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="60px"
              />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0,0,0,0.6)',
                p: 2,
                color: '#fff',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {legalUnit.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#bbb' }}>
                {legalUnit.specializations.join(', ')} | Established {new Date(legalUnit.createdAt).getFullYear()}
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
            <Paper sx={{ p: 3, bgcolor: '#1c1c1c', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: '#bbb', mb: 2 }}>
                {legalUnit.description} We are a trusted legal service provider in {legalUnit.city}, offering comprehensive solutions in {legalUnit.specializations.join(', ')}.
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFD700' }}>
                ★ {legalUnit.avgRatingScore}/5 ({legalUnit.userRatingsCount} reviews)
              </Typography>
            </Paper>
          </motion.div>

          {/* About */}
          <motion.div id="about" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              About
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#1c1c1c', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Legal Entity:</strong> {legalUnit.legalEntityName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Established:</strong> {new Date(legalUnit.createdAt).getFullYear()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Languages Spoken:</strong> {legalUnit.languagesSpoken.join(', ')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Registration Number:</strong> {legalUnit.registrationNumber}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Tax ID:</strong> {legalUnit.taxId}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Verified:</strong> {legalUnit.isVerified ? '✅ Yes' : 'No'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                <strong>Operational:</strong> {legalUnit.isOperational ? 'Yes' : 'No'}
              </Typography>
            </Paper>
          </motion.div>

          {/* Work Experience */}
          <motion.div id="work-experience" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Work Experience
            </Typography>
            {mockWorkExperience.length > 0 ? (
              <Grid container spacing={3}>
                {mockWorkExperience.map((exp, index) => (
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
            {legalUnit.complianceCertificates?.length > 0 ? (
              <Grid container spacing={3}>
                {legalUnit.complianceCertificates.map((cert, index) => (
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
                        {cert}
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
                filteredServices.map((service) => (
                  <Grid item xs={12} sm={6} lg={4} key={service.id}>
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
                        {service.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        Price: {service.price}
                      </Typography>
                      <Chip label={service.tag} size="small" sx={{ bgcolor: '#00c853', color: '#fff' }} />
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mt: 1, bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
                        onClick={() => router.push(`/book-services/${service.slug}`)}
                      >
                        {service.cta}
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
              Average Rating: ★ {legalUnit.avgRatingScore}/5 ({legalUnit.userRatingsCount} reviews)
            </Typography>
            {legalUnit.testimonials?.length > 0 ? (
              <Grid container spacing={3}>
                {legalUnit.testimonials.map((testimonial, index) => (
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
                        "{testimonial.text}"
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#bbb' }}>
                        - {testimonial.name}
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
            {mockCaseRecords.length > 0 ? (
              <Grid container spacing={3}>
                {mockCaseRecords.map((caseRecord, index) => (
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

          {/* Location & Contact */}
          <motion.div id="book-now" variants={sectionVariants} initial="hidden" animate="visible" style={{ marginBottom: '32px' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Location & Contact
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#1c1c1c', borderRadius: 2 }}>
              <Box
                sx={{
                  height: '200px',
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  mb: 2,
                  bgcolor: '#1c1c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {legalUnit.mapUrl ? (
                  <iframe
                    src={legalUnit.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1c1c1c', width: '100%', height: '100%' }}>
                    <MapIcon sx={{ fontSize: 60, color: '#ff5252' }} />
                  </Box>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Address:</strong> {legalUnit.address}, {legalUnit.city}, {legalUnit.postalCode}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Landmark:</strong> {legalUnit.landmark || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Contact:</strong> {legalUnit.contactInfo}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Receptionist:</strong> {legalUnit.receptionistName} ({legalUnit.receptionistContact})
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Email:</strong> {legalUnit.email}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Website:</strong>{' '}
                <a href={legalUnit.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00c853' }}>
                  {legalUnit.websiteUrl}
                </a>
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Social Links:</strong>{' '}
                {Object.entries(legalUnit.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#00c853', marginRight: '8px' }}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                ))}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>Walk-in Hours:</strong> {legalUnit.liveChatHours} | {legalUnit.acceptsWalkins ? 'Walk-ins Welcome' : 'Appointment Required'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                <strong>AI Support:</strong> {legalUnit.aiSupportEnabled ? 'Available' : 'Not Available'} {legalUnit.aiSupportEnabled && (
                  <a href={legalUnit.aiSupportUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00c853' }}>
                    Access AI Assistant
                  </a>
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  href={legalUnit.bookingUrl}
                  sx={{ bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
                >
                  Book a Legal Service
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
                {legalUnit.aiSupportEnabled && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    href={legalUnit.aiSupportUrl}
                    sx={{ bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
                  >
                    Ask AI Legal Assistant
                  </Button>
                )}
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
              href={legalUnit.bookingUrl}
              sx={{ bgcolor: '#00c853', '&:hover': { bgcolor: '#00a846' } }}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LegalUnitPage;