import React, { useState, useEffect } from "react";
import {
    Stack,
    Switch,
    FormControlLabel,
    Tooltip,
    Box
} from "@mui/material";
import httpClient from "../pages/httpClient";
import Expandable from './Expandable.jsx';
import { showSuccess, showError } from "./ToastUtils";

const NotificationSettings = ({ contact }) => {
    const [settings, setSettings] = useState({
        pistolDetection: contact?.settings?.pistolDetection || false,
        personDetection: contact?.settings?.personDetection || false,
        packageDetection: contact?.settings?.packageDetection || false,
    });

    useEffect(() => {
        setSettings({
            pistolDetection: contact?.settings?.pistolDetection || false,
            personDetection: contact?.settings?.personDetection || false,
            packageDetection: contact?.settings?.packageDetection || false,
        });
    }, [contact]);

    const handleToggle = async (setting) => {
        const updatedSettings = { ...settings, [setting]: !settings[setting] };
        setSettings(updatedSettings);

        try {
            await httpClient.put("http://localhost:8080/update_contact_settings", {
                email: contact.email,
                settings: updatedSettings,
            });
            showSuccess("Contact settings updated successfully!");
        } catch (e) {
            console.error("Failed to update settings", e);
            showError("Failed to update settings.");
        }   
    };

    return (
        <Expandable preview='Contact Notification Settings' content={
            <Stack spacing={3} sx={{ width: "100%", color: "#333" }}>
                <Box display="flex" flexDirection="column" alignItems="flex-start" gap={3} sx={{ width: "100%" }}>
                    <FormControlLabel
                        control={
                            <Tooltip title="Alert emergency contacts when a firearm is detected">
                                <Switch
                                    checked={settings.pistolDetection}
                                    // onChange={() => handleToggle("pistolDetection")}
                                    color="primary"
                                />
                            </Tooltip>
                        }
                        label="Pistol Detection"
                        sx={{
                            color: "#333",
                            marginLeft: 0,  
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "auto" 
                        }}
                    />

                    <FormControlLabel
                        control={
                            <Tooltip title="Alert emergency contacts when a person is detected">
                                <Switch
                                    checked={settings.personDetection}
                                    onChange={() => handleToggle("personDetection")}
                                    color="primary"
                                />
                            </Tooltip>
                        }
                        label="Person Detection"
                        sx={{
                            color: "#333",
                            marginLeft: 0,
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "auto"
                        }}
                    />

                    <FormControlLabel
                        control={
                            <Tooltip title="Alert emergency contacts for package deliveries">
                                <Switch
                                    checked={settings.packageDetection}
                                    onChange={() => handleToggle("packageDetection")}
                                    color="primary"
                                />
                            </Tooltip>
                        }
                        label="Package Detection"
                        sx={{
                            color: "#333",
                            marginLeft: 0,
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "auto"
                        }}
                    />
                </Box>

            </Stack>
        }
            style={{ minWidth: '760px' }}
        >
        </Expandable>
    );
};

export default NotificationSettings;
