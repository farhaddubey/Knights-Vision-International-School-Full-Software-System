import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
  TextField,
  InputAdornment,
  Pagination,
  PaginationItem,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import { Inventory, Add, RotateRight, Search, ChevronLeft, ChevronRight, ExpandMore, ExpandLess } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseConsultationServicesDialog from "./dialogs/BrowseConsultationServicesDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';

const BrowseConsultationServices = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [slots, setSlots] = useState({});
  const [expandedService, setExpandedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-06-27').toISOString().split('T')[0]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchServices = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get("/api/legal-services/consultation", {
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !Array.isArray(response.data.services)) {
        throw new Error('Invalid response format: services array missing');
      }

      setServices(response.data.services);
      setFilteredServices(response.data.services);
      setTotalPages(response.data.totalPages || 1);

      response.data.services.forEach((service) => {
        if (service.hasSlot) {
          fetchSlots(service.id);
        }
      });
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.response?.data?.error || "Failed to fetch services.");
      toast.error("Failed to fetch services.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  const fetchSlots = async (serviceId) => {
    try {
      const response = await axios.get("/api/legal-services/consultation/slots/available", {
        params: { serviceId, date: selectedDate },
      });
      setSlots((prev) => ({ ...prev, [serviceId]: response.data }));
    } catch (err) {
      console.error("Error fetching slots:", err);
      toast.error("Failed to fetch slots.");
    }
  };

  useEffect(() => {
    fetchServices(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = services.filter((service) =>
      [service.name, service.description, service.category?.name, service.tags?.join(', '), service.availability, service.visibilityScope].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredServices(filtered);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close the modal? Unsaved changes will be lost."
    );
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchServices(page);
    setEditFields({});
  };

  const handleInsertionOpenModal = (service = {}) => {
    setEditFields({
      id: service.id ?? null,
      name: service.name ?? "",
      categoryId: service.categoryId ?? null,
      description: service.description ?? "",
      translations: service.translations ?? { en: "", hi: "" },
      price: service.price ?? "",
      hasSlot: service.hasSlot ?? false,
      lawyerProfileId: service.lawyerProfileId ?? null,
      daysOfWeek: service.LegalServiceSlot?.map(slot => slot.dayOfWeek) ?? [],
      startTime: service.LegalServiceSlot?.[0]?.startTime ?? "",
      endTime: service.LegalServiceSlot?.[0]?.endTime ?? "",
      durationMinutes: service.LegalServiceSlot?.[0]?.durationMinutes ?? "",
      availability: service.availability ?? "BOTH",
      uploadMode: service.uploadMode ?? "DIRECT_UPLOAD",
      isWhatsAppEnabled: service.isWhatsAppEnabled ?? false,
      isOnlinePayEnabled: service.isOnlinePayEnabled ?? true,
      isD2DEnabled: service.isD2DEnabled ?? false,
      tags: Array.isArray(service.tags) ? service.tags : [],
      customFormSchema: Array.isArray(service.customFormSchema) ? service.customFormSchema : [],
      regionRules: service.regionRules ?? {},
      visibilityScope: service.visibilityScope ?? "PUBLIC",
      thumbnailUrl: service.thumbnailUrl ?? "",
      introVideoUrl: service.introVideoUrl ?? "",
      documents: Array.isArray(service.documents) ? service.documents : [],
      aiSupportLevel: service.aiSupportLevel ?? "BASIC",
    });
    setOpenInsertion(true);
  };

  const handleBookSlot = async (slotId, serviceId, bookedById = 999) => {
    try {
      await axios.patch(`/api/legal-services/consultation/slots/${slotId}/book`, { bookedById });
      toast.success("Slot booked successfully!");
      fetchSlots(serviceId);
    } catch (err) {
      console.error("Error booking slot:", err);
      toast.error(err.response?.data?.error || "Failed to book slot.");
    }
  };

  const handleToggleExpand = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
    if (expandedService !== serviceId && services.find((s) => s.id === serviceId)?.hasSlot) {
      fetchSlots(serviceId);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100% - ${appBarHeight}px)`,
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ bgcolor: "#000", color: "#fff" }}>
        <Inventory sx={{ mr: 1 }} />
        <ListItemText primary="Browse Consultation Services" />
        <TextField
          placeholder='Search by Name, Description, Category, Tags, or Availability'
          value={searchQuery}
          onChange={handleSearch}
          size='small'
          sx={{
            width: '250px',
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: '#fff', mr: 1 }} />,
          }}
        />
        <TextField
          label="Select Date"
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            services.forEach((service) => {
              if (service.hasSlot) fetchSlots(service.id);
            });
          }}
          sx={{
            width: '150px',
            ml: 2,
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Service
        </Button>
        <Button
          onClick={() => fetchServices(page)}
          variant="outlined"
          color="primary"
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, position: 'relative' }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            color: "#fff",
            bgcolor: "#212121",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1.4, fontWeight: "bold" }}>Name</Typography>
          <Typography variant="body2" sx={{ flex: 1.4, fontWeight: "bold" }}>Category</Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold" }}>Price</Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold" }}>Availability</Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold" }}>Lawyer</Typography>
          <Typography variant="body2" sx={{ flex: 0.4, fontWeight: "bold" }}>Actions</Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflowY: "auto",
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 1,
            pb: 8,
          }}
        >
          <List>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <React.Fragment key={service.id}>
                  <ListItem
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 1,
                      bgcolor: "#000",
                      color: "#fff",
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1.4 }}>{service.name}</Typography>
                    <Typography variant="body2" sx={{ flex: 1.4 }}>{service.category?.name ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 0.8 }}>{service.price ? `${service.currencyCode} ${service.price}` : "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 0.8 }}>{service.availability ?? "Null"}</Typography>
                    <Typography variant="body2" sx={{ flex: 0.8 }}>{service.lawyerProfile?.user?.name ?? "N/A"}</Typography>
                    <Box sx={{ flex: 0.4, display: "flex", alignItems: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleInsertionOpenModal(service)}
                      >
                        Edit
                      </Button>
                      {service.hasSlot && (
                        <IconButton
                          onClick={() => handleToggleExpand(service.id)}
                          sx={{ color: "#fff" }}
                        >
                          {expandedService === service.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                  {service.hasSlot && (
                    <Collapse in={expandedService === service.id} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 4, pr: 2, pb: 2, bgcolor: "#1e1e1e", borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                          Slot Details:
                        </Typography>
                        {service.LegalServiceSlot?.map((slot, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            {slot.dayOfWeek} from {slot.startTime} to {slot.endTime} ({slot.durationMinutes} min)
                          </Typography>
                        ))}
                        <Typography variant="body2" sx={{ fontWeight: "bold", mt: 1 }}>Available Slots ({new Date(selectedDate).toLocaleDateString()}):</Typography>
                        {slots[service.id]?.length > 0 ? (
                          slots[service.id].map((slot) => (
                            <Box key={slot.id} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                              <Typography sx={{ flex: 1 }}>
                                {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()} on {new Date(slot.date).toLocaleDateString()}
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleBookSlot(slot.id, service.id)}
                              >
                                Book
                              </Button>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ color: "#888" }}>
                            No available slots for selected date.
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  )}
                </React.Fragment>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No services found.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: 'translateX(-50%)',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => {
              setPage(value);
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('page', value.toString());
              router.push(`?${newSearchParams.toString()}`);
            }}
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#fff',
                '&:hover': { bgcolor: '#333' },
                '&.Mui-selected': {
                  bgcolor: greenAccent,
                  color: '#000',
                  '&:hover': { bgcolor: greenAccent },
                },
              },
            }}
            renderItem={(e) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...e}
              />
            )}
          />
        </Box>
      </Box>

      <BrowseConsultationServicesDialog
        open={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchServices={fetchServices}
      />
    </Box>
  );
};

export default BrowseConsultationServices;