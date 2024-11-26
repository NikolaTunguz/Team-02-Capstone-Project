import React from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import httpClient from '../../pages/httpClient';
import { useAuth } from "../../context/AuthContext";

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    const logout = async () => {
        try {
            const resp = await httpClient.post("http://localhost:8080/logout");
            if (resp.status === 200) {
                handleMenuClose();
                setIsLoggedIn(false);
                navigate('/home')
            }
        } catch (e) {
            console.error("Error logging out", e);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton onClick={handleMenuOpen}>
                <AccountCircleIcon fontSize="large" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                    "& .MuiPaper-root": {
                        minWidth: "200px",
                        padding: "10px",
                        borderRadius: "8px",
                    },
                }}
            >
                <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider style={{ margin: "10px 0" }} />
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </div>
    );
};

export default AccountMenu;
