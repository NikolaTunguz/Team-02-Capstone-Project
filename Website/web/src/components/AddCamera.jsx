import React, { useState, useEffect } from "react";
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
    FormControl,
} from "@mui/material";
import { Cancel, Add } from "@mui/icons-material";
import httpClient from "../pages/httpClient";

const AddCamera = ({ onCameraAdded }) => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    const resetModal = () => {
        setError("");
        setOpen(false);
    };

    const handleAddCamera = async (values, { resetForm }) => {
        try {
            await httpClient.post("http://localhost:8080/add_user_camera", values);
            resetForm();
            resetModal();
            if (onCameraAdded) onCameraAdded(); 
        } catch (e) {
            setError(e.response?.data?.error || "Failed to add camera.");
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
                    <IconButton
                        onClick={resetModal}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <Cancel />
                    </IconButton>
                    <Typography variant="h6" mb={2}>
                        Add New Camera
                    </Typography>
                    <Formik
                        initialValues={{
                            device_id: "",
                        }}
                        validationSchema={Yup.object({
                            device_id: Yup.string()
                                .required("Device ID is required")
                                .matches(/^\d+$/, "Device ID must be a number"),
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
                    {error && (
                        <Typography variant="body2" color="error" mt={2}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default AddCamera;