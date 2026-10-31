"use client";
import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MainMenu from "./navbar_primary/mainmenu";
import TDILBrandIcon from "./SureSuccessBrandIcon";
import CustomDrawer from "../context/HomeDrawer";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import {
  Build,
  BuildCircle,
  Favorite,
  Gavel,
  Print,
} from "@mui/icons-material";
import axios from "axios";
import debounce from "lodash/debounce";
import FeeStructuresDropDown from "./autoDropDownIcons/FeeStructuresDropDown";
import CoursesDropDown from "./autoDropDownIcons/ResultsDropDown";
import KIBCSETDropDown from "./autoDropDownIcons/KIBCSETDropDown";
import NavbarHomePage from "./NavbarHomePage";
export default function PrimarySearchAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [showAppBar, setShowAppBar] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const { scrollY } = useScroll();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  React.useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) setShowAppBar(false);
      else setShowAppBar(true);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce(async (query) => {
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const response = await axios.get(
          "/api/api_next_app/services/name_slug",
          {
            params: { query }, // Pass query as a parameter
          },
        );
        const filteredResults = response.data
          .filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 8);
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching services:", error);
        setSearchResults([]);
      }
    }, 150),
    [],
  );

  React.useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar
        sx={{
          position: "fixed",
          top: 0,
          width: "100%",
          background: "rgba(0, 0, 0)",
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box>
            <Link href={"/"}>
              <Box
              //  sx={{display:{xs:"none", md:"block"}}}
              >
                <Image
                  width={60}
                  height={60}
                  src={"/knights.png"}
                  alt="Sure Success Point School"
                />
              </Box>
            </Link>
          </Box>

          {/* Brand Icon */}
          <Box>
            <Link href={"/"}>
              <TDILBrandIcon />
            </Link>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          {/* Course Buttons - visible only on medium and larger screens */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <FeeStructuresDropDown />
            <CoursesDropDown />
            <KIBCSETDropDown />
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <MainMenu />
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              onClick={() => setDrawerOpen(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <CustomDrawer
        drawerOpen={drawerOpen}
        handleDrawerToggle={() => setDrawerOpen(false)}
      />
      <Box
        sx={{
          marginTop: "64px",
          color: "#fafafa",
          position: "fixed",
          zIndex: 90,
        }}
      >
        <NavbarHomePage />
      </Box>
      {renderMenu}
      {renderMobileMenu}
    </>
  );
}
