import React, { useState, useEffect } from "react";
import {
    Stack,
    Switch,
    FormControlLabel,
    Tooltip,
    Box,
    CircularProgress,
} from "@mui/material";
import httpClient from "../pages/httpClient";
import Expandable from './Expandable.jsx';
import { showSuccess, showError } from "./ToastUtils";
import NotificationInfo from "./NotificationInfo";

const NotificationSettings = () => {
    const [values, setValues] = useState({
        notify_pistol: false,
        notify_person: false,
        notify_package: false,
        notify_fire: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        httpClient.get("/api/notification_settings")
            .then(response => {
                setValues(response.data);
            })
            .catch(error => {
                console.error("Failed to fetch user settings", error);
                showError("Failed to load notification settings.");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = async (event) => {
        const { name, checked } = event.target;
        const updatedValues = { ...values, [name]: checked };
        setValues(updatedValues);

        try {
            await httpClient.post("/api/notification_settings", updatedValues);
            showSuccess("Notification settings updated successfully!");
        } catch (e) {
            console.error("Failed to update settings", e);
            showError("Failed to update settings.");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Expandable preview='Notification Settings' style={{ minWidth: '760px' }} content={
            <Box sx={{ position: "relative", paddingBottom: "60px" }}>
                <Stack spacing={3} sx={{ width: "100%", color: "#333" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControlLabel
                            control={
                                <Tooltip title="Alert this contact when a firearm is detected">
                                    <Switch
                                        name="notify_pistol"
                                        checked={values.notify_pistol}
                                        onChange={handleChange}
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
                        <Box sx={{ width: 100 }} />
                        <FormControlLabel
                            control={
                                <Tooltip title="Alert this contact when a person is detected">
                                    <Switch
                                        name="notify_person"
                                        checked={values.notify_person}
                                        onChange={handleChange}
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
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControlLabel
                            control={
                                <Tooltip title="Alert this contact when a package is detected">
                                    <Switch
                                        name="notify_package"
                                        checked={values.notify_package}
                                        onChange={handleChange}
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
                        <Box sx={{ width: 77 }} />
                        <FormControlLabel
                            control={
                                <Tooltip title="Alert this contact when a fire is detected">
                                    <Switch
                                        name="notify_fire"
                                        checked={values.notify_fire}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                </Tooltip>
                            }
                            label="Fire Detection"
                            sx={{
                                color: "#333",
                                marginLeft: 0,
                                alignItems: "center",
                                justifyContent: "flex-start",
                                width: "auto"
                            }}
                        />
                    </Stack>
                </Stack>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 590,
                    }}
                >
                    <NotificationInfo />
                </Box>
            </Box>
        }>
        </Expandable>
    );
};

export default NotificationSettings;
