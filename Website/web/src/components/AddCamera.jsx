import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    OutlinedInput,
    InputLabel,
    FormHelperText,
    Button,
    Typography,
    Box,
    IconButton,
    Modal,
    Tooltip,
    FormControl,
} from "@mui/material";
import { Cancel, Add } from "@mui/icons-material";
import httpClient from "../pages/httpClient";
import { showSuccess, showError } from "./ToastUtils";
import CancelIcon from '@mui/icons-material/Cancel';

const AddCamera = ({ onCameraAdded }) => {
    const [open, setOpen] = useState(false);

    const resetModal = () => {
        setOpen(false);
    };

    const handleAddCamera = async (values, { resetForm }) => {
        try {
            await httpClient.post("/api/add_user_camera", values);
            resetForm();
            resetModal();
            if (onCameraAdded) onCameraAdded();
            showSuccess("Camera successfully added!");
        } catch (e) {
            showError(e.response?.data?.error || "Failed to add camera.");
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
            >
                Add Camera
            </Button>
            <Modal
                open={open}
                onClose={resetModal}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 3,
                        borderRadius: 3,
                        width: 400,
                    }}
                >
                    <Tooltip title="Close">
                        <IconButton
                            onClick={resetModal}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                            <CancelIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6" mb={2}>
                        Add New Camera
                    </Typography>
                    <Formik
                        initialValues={{
                            device_id: "",
                            device_name: ""
                        }}
                        validationSchema={Yup.object({
                            device_id: Yup.string()
                                .required("Device ID is required")
                                .matches(/^\d+$/, "Device ID must be a number"),
                            device_name: Yup.string()
                                .required("Device name is required")
                                .min(3, "Device name must be at least 3 characters"),
                        })}
                        onSubmit={(values, { resetForm }) => {
                            handleAddCamera(values, { resetForm });
                        }}
                    >
                        {({
                            errors,
                            handleBlur,
                            handleChange,
                            touched,
                            values,
                            isValid,
                            dirty,
                        }) => (
                            <Form>
                                <FormControl
                                    fullWidth
                                    error={Boolean(touched.device_name && errors.device_name)}
                                    sx={{ mb: 2 }}
                                >

                                    <InputLabel htmlFor="device_name">Device Name</InputLabel>
                                    <OutlinedInput
                                        label="Device Name"
                                        name="device_name"
                                        value={values.device_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.device_name && errors.device_name && (
                                        <FormHelperText>{errors.device_name}</FormHelperText>
                                    )}
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    error={Boolean(touched.device_id && errors.device_id)}
                                    sx={{ mb: 2 }}
                                >
                                    <InputLabel htmlFor="device_id">Device ID</InputLabel>
                                    <OutlinedInput
                                        label="Device ID"
                                        name="device_id"
                                        value={values.device_id}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.device_id && errors.device_id && (
                                        <FormHelperText>{errors.device_id}</FormHelperText>
                                    )}
                                </FormControl>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!isValid || !dirty}
                                    fullWidth
                                >
                                    Add Camera
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Modal>
        </>
    );
};

export default AddCamera;