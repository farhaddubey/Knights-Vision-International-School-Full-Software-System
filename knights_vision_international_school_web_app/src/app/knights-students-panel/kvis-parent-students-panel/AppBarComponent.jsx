import React, { useEffect, useState } from 'react';
import { AppBar, Avatar, Box, Button, Chip, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { PowerSettingsNew, Security } from '@mui/icons-material';
import KnightsIcon from '../../(kvis)/components/KnightsIcon';
import Image from 'next/image';
import FullscreenToggleButton from "@/components/sure-success-point-school/controls/PanelFullscreenToggleButton";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
const drawerWidth = 280;

function AppBarComponent({ handleReload, handleLogout, handleDrawerToggle}) {
    const [user, setUser] = useState(null);
    const fetchUserDepartment=async()=>{
          const token = Cookies.get("student_token");
          const decoded = jwtDecode(token);
          console.log(decoded, "is decoded.")
          console.log("Dep is", decoded?.firstName); 
          setUser(decoded);
    }
  useEffect(()=>{
    fetchUserDepartment(); 
  }, [])
  function toTitleCase(str) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
}

  return (
    <AppBar position="fixed" sx={{ 
    background: "rgba(0, 0, 0, 0)",
    backdropFilter: "blur(0px)",
            position: "fixed",
        left: `${drawerWidth}px`,
        width: `calc(100vw - ${drawerWidth}px)`,
}}>
      <Toolbar>

      <Box>
              <Image width={60} height={60}
                src={"/knights.png"}
                alt="TDIL | The Dubey Industries Limited"
              />
            </Box>
        <KnightsIcon/>
        <Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: { xs: "center", md: "space-between" },
    background: "rgba(0, 0, 0, 0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.66)",
    p: 1,
    pl: 2,
    pr: 2,
    ml: "20px",
  }}
>

</Box>

<Box flexGrow={1} />
        <Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: { xs: "center", md: "space-between" },
    background: "#3e2723",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    boxShadow: "0 4px 4px rgba(0, 0, 0, 0.76)",
    p:1,
    px:2.5, 
    ml:2
  }}
>
  <Typography
    variant="h4"
    sx={{
      fontWeight: "bold",
      color: "#1de9b6",
      display: { xs: "none", md: "block" },
      fontFamily: "roboto",
      fontSize:"16px"
    }}
  >
  Department of Academic Development
    </Typography>
</Box>
        <FullscreenToggleButton/>
              <IconButton onClick={handleReload} color="error">
        <PowerSettingsNew fontSize="large" />
      </IconButton>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ ml: 0.2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Button variant="contained" color="error" onClick={handleLogout}>
          <Typography sx={{ fontSize: { xs: 12, md: 16 } }}>Logout</Typography>
          <Security sx={{ fontSize: { xs: 16, md: 24 } }} />
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default AppBarComponent;
