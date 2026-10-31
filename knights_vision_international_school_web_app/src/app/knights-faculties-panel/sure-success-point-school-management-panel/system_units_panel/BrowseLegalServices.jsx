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
} from "@mui/material";
import { Inventory, Add, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseLegalServicesDialog from "./dialogs/BrowseLegalServicesDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const BrowseLegalServices = () => {
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[BrowseLegalServices] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchServices = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get("/api/legal-services", {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchServices] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.services)) {
        throw new Error('Invalid response format: services array missing');
      }

      setServices(response.data.services);
      setFilteredServices(response.data.services);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchServices] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.response?.data?.error || "Failed to fetch services.");
      toast.error("Failed to fetch services.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Fetch services when page changes
  useEffect(() => {
    console.log('[BrowseLegalServices] Fetching services for page:', page);
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
      availability: service.availability ?? "BOTH",
      uploadMode: service.uploadMode ?? "DIRECT_UPLOAD",
      isWhatsAppEnabled: service.isWhatsAppEnabled ?? false,
      isOnlinePayEnabled: service.isOnlinePayEnabled ?? true,
      isD2DEnabled: service.isD2DEnabled ?? false,
      prerequisiteServiceId: service.prerequisiteServiceId ?? null,
      slaDays: service.slaDays ?? "",
      tags: Array.isArray(service.tags) ? service.tags : [],
      customFormSchema: Array.isArray(service.customFormSchema) ? service.customFormSchema : [],
      popularityScore: service.popularityScore ?? 0,
      averageRating: service.averageRating ?? 0,
      ratingCount: service.ratingCount ?? 0,
      currencyCode: service.currencyCode ?? "INR",
      regionRules: service.regionRules ?? {},
      visibilityScope: service.visibilityScope ?? "PUBLIC",
      thumbnailUrl: service.thumbnailUrl ?? "",
      introVideoUrl: service.introVideoUrl ?? "",
      documents: Array.isArray(service.documents) ? service.documents : [],
      aiSupportLevel: service.aiSupportLevel ?? "BASIC",
    });
    setOpenInsertion(true);
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseLegalServices] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
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
        <ListItemText primary="Browse Legal Services" />
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

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
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
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold" }}>Visibility</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>Type</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>Tags</Typography>
          <Typography variant="body2" sx={{ flex: 0.4, fontWeight: "bold" }}>Actions</Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflowY: "auto",
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 1,
          }}
        >
          <List>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <ListItem
                  key={service.id}
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
                  <Typography variant="body2" sx={{ flex: 0.8 }}>{service.visibilityScope ?? "Null"}</Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{service.type ?? "Docs"}</Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {Array.isArray(service.tags) && service.tags.length ? service.tags.join(", ") : "None"}
                  </Typography>
                  <Button
                    sx={{ flex: 0.4 }}
                    variant="contained"
                    color="primary"
                    onClick={() => handleInsertionOpenModal(service)}
                  >
                    Edit
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No services found.
              </Typography>
            )}
          </List>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, bgcolor: '#181818' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
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
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>

      <BrowseLegalServicesDialog
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

export default BrowseLegalServices;