import React, { useState } from 'react';
import { IconButton, Popover, Box, Typography, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';


const NotificationInfo = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'info-popover' : undefined;

    return (
        <div>
            <Tooltip title="Notification Info">

                <IconButton onClick={handleClick}>
                    <InfoIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Tooltip >

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ maxWidth: 500, padding: 3, maxHeight: 160 }}>
                    <Typography variant="body4" paragraph>
                        These notification settings determine which events will trigger email alerts.
                        While our detection models are designed to identify potential events,
                        they may not always be 100% accurate.
                    </Typography>
                    <Typography variant="body4" paragraph>
                        We encourage you to be prepared to receive notifications and emails from <strong>seethrucapstone@gmail.com</strong>.
                        We recommend that you review and confirm your settings to ensure the right people are notified in case of an emergency.
                    </Typography>
                </Box>
            </Popover>
        </div>
    );
};

export default NotificationInfo;
