"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { AccountBalance, Apartment, Group, Refresh, School, TaskAlt } from "@mui/icons-material";

function amount(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

function MetricCard({ label, value, detail, icon, tone = "#3b82f6" }) {
  return (
    <Card sx={{ height: "100%", bgcolor: "#151515", color: "#f5f5f5", border: `1px solid ${tone}55` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ color: "#a8a8a8", lineHeight: 1.2 }}>{label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: tone }}>{value}</Typography>
          </Box>
          <Box sx={{ color: tone }}>{icon}</Box>
        </Stack>
        {detail && <Typography variant="body2" sx={{ color: "#c7c7c7", mt: 1 }}>{detail}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function CentralCommandCenter() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/administration/command-center", { credentials: "same-origin" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Unable to load the Central Administration summary.");
      setSummary(body);
    } catch (requestError) {
      setError(requestError.message || "Unable to load the Central Administration summary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, color: "#f5f5f5", minHeight: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>Sure Success Point School</Typography>
          <Typography variant="h6" sx={{ color: "#bdbdbd" }}>Central Administration Command Center</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading} sx={{ color: "#74e39a", borderColor: "#3e8056", textTransform: "none" }}>Refresh summary</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && !summary ? <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}><CircularProgress /></Box> : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={3}><MetricCard label="Institutions" value={summary?.institution?.schools ?? 0} detail={`${summary?.institution?.branches ?? 0} branches`} icon={<Apartment fontSize="large" />} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><MetricCard label="Academic structure" value={summary?.institution?.classes ?? 0} detail={`${summary?.institution?.students ?? 0} enrolled students`} icon={<School fontSize="large" />} tone="#8f7af8" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><MetricCard label="Open central work" value={(summary?.approvals?.pendingPolicies ?? 0) + (summary?.approvals?.openOperations ?? 0)} detail={`${summary?.approvals?.pendingPolicies ?? 0} policy exceptions, ${summary?.approvals?.openOperations ?? 0} operational requests`} icon={<TaskAlt fontSize="large" />} tone="#e4ad39" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><MetricCard label="School staff accounts" value={summary?.institution?.staffAccounts ?? "Restricted"} detail="Visible only where staff-read authority is assigned" icon={<Group fontSize="large" />} tone="#49a8e8" /></Grid>
          </Grid>

          {summary?.finance ? <>
            <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Bank-credit confirmations awaiting Central Administration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><MetricCard label="Monthly fee daily settlement" value={summary.finance.monthlyBankSubmitted.count} detail={`${amount(summary.finance.monthlyBankSubmitted.amount)} submitted by COEF and awaiting final bank-credit confirmation`} icon={<AccountBalance fontSize="large" />} tone="#55c982" /></Grid>
              <Grid item xs={12} md={6}><MetricCard label="Admission fee confirmation" value={summary.finance.admissionBankSubmitted.count} detail={`${amount(summary.finance.admissionBankSubmitted.amount)} awaiting admission-fee bank-credit confirmation`} icon={<AccountBalance fontSize="large" />} tone="#55c982" /></Grid>
            </Grid>
          </> : <Alert severity="info" sx={{ mt: 3 }}>Financial totals are visible only to roles with finance-read authority. Other Central roles retain their own scoped operational and approval information.</Alert>}

          <Card sx={{ mt: 3, bgcolor: "#151515", color: "#f5f5f5", border: "1px solid #333" }}>
            <CardContent>
              <Typography variant="h6">Central workflow boundary</Typography>
              <Typography sx={{ color: "#c7c7c7", mt: 1 }}>Headquarters configures institutions and policy; Faculty executes school work. Fee custody never becomes a student-ledger receipt until COEF has submitted funds and an authorized Central role records the independently verified bank credit.</Typography>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
