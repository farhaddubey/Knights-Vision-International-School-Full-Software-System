"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;

const BiWeeklyReviewDialog = ({
  open,
  onClose,
  selectedClassSubject,
  biWeeklyReviews,
  reviewLoading,
  handleOpenCreateReviewDialog,
  className,
}) => {
  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={open}
      onClose={onClose}
      fullScreen
    >
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
        }}
      >
        <ListItemIcon>
          <CalendarToday />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`Bi-Weekly Homework Reviews for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`}
        />
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateReviewDialog}
            sx={{ mr: 1, bgcolor: "#00c757" }}
          >
            Create Review
          </Button>
          <Button
            onClick={onClose}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
            {reviewLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} />
              </Box>
            ) : (
              <>
                {biWeeklyReviews.map((review) => (
                  <Box key={review.id} sx={{ mb: 4 }}>
                    <Typography variant="h6">
                      Review Period: {new Date(review.startDate).toLocaleDateString()} -{" "}
                      {new Date(review.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography>General Remarks: {review.generalRemarks || "N/A"}</Typography>
                    <Typography>Suggestions: {review.suggestions || "N/A"}</Typography>
                    <Typography>Reviewed By: {review.reviewedBy.name}</Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Student Reviews
                    </Typography>
                    {review.studentReviews.some((sr) => sr.completionRate < 50 || sr.status === "NEEDS_IMPROVEMENT") && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Warning: Some students have low completion rates or need improvement.
                      </Alert>
                    )}
                    <Table sx={{ bgcolor: "#181818" }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#333" }}>
                          <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                          <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Topics</TableCell>
                          <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Completed</TableCell>
                          <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Completion Rate (%)</TableCell>
                          <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                          <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {review.studentReviews.length > 0 ? (
                          review.studentReviews.map((sr) => (
                            <TableRow key={sr.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                              <TableCell sx={{ color: "#fff" }}>{`${sr.student.firstName} ${sr.student.lastName}`}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{sr.totalTopicsReviewed}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{sr.totalHomeworkCompleted}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{sr.completionRate.toFixed(2)}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{sr.status}</TableCell>
                              <TableCell sx={{ color: "#fff" }}>{sr.remarks || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} sx={{ color: "#fff", textAlign: "center" }}>
                              No student reviews found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                ))}
                {biWeeklyReviews.length === 0 && (
                  <Typography sx={{ textAlign: "center" }}>No bi-weekly reviews found.</Typography>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BiWeeklyReviewDialog;