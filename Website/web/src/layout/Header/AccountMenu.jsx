import React from 'react';
import { Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListItemIcon from '@mui/material/ListItemIcon';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import httpClient from '../../pages/httpClient';
import { useAuth } from "../../context/AuthContext";

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const { setIsLoggedIn, setIsAdmin, isAdmin } = useAuth();
    const { firstName, lastName, setFirstName, setLastName } = useAuth();

    React.useEffect(() => {
        const fetchFirstLast = async () => {
            try {
                const response = await httpClient.get('/api/first_last');
                setFirstName(response.data['first'])
                setLastName(response.data['last'])
            } catch (error) {
                console.error("Failed to fetch user name:", error);
            }
        };
        fetchFirstLast()
    }, []);


    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    const logout = async () => {
        try {
            const resp = await httpClient.post("/api/logout");
            if (resp.status === 200) {
                handleMenuClose();
                setIsLoggedIn(false);
                setIsAdmin(false);
                navigate('/')
            }
        } catch (e) {
            console.error("Error logging out", e);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton onClick={handleMenuOpen}>
                <AccountCircleIcon fontSize="large" />
                <div style={{ fontSize: "medium", color: "black", marginLeft: "10px" }}>
                    {firstName}
                    {" "}
                    {lastName}
                </div>
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
                {!isAdmin && <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>}
                {!isAdmin && <Divider style={{ margin: "10px 0" }} />}
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
