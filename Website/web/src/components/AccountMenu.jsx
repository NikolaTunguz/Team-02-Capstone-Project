import React from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import httpClient from '../pages/httpClient';

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();

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
                navigate('/login');
            }
        } catch (e) {
            console.error("Error logging out", e);
        }
    };

    return (
        <>
            <IconButton onClick={handleMenuOpen}>
                <AccountCircleIcon fontSize="large" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                    Settings
                </MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
        </>
    );
};

export default AccountMenu;
