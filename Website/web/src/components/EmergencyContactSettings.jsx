import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    Stack,
    OutlinedInput,
    InputLabel,
    FormHelperText,
    Button,
    Typography,
    Box,
    IconButton,
    Modal,
    FormControl,
    Grid2,
} from "@mui/material";
import { 
    Delete, 
    Edit, 
    Cancel 
} from "@mui/icons-material";
import httpClient from "../pages/httpClient";

const EmergencyContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [editingContact, setEditingContact] = useState(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);

    const resetModal = () => {
        setError("");
        setEditingContact(null);
        setOpen(false);
        getContacts();
    }

    const getContacts = async () => {
        try {
            const response = await httpClient.get("http://localhost:8080/get_emergency_contacts");
            setContacts(response.data.contacts || []);
        } catch (e) {
            console.error("Failed to fetch contacts:", e);
        }
    };

    const handleAddOrUpdate = async (values, { resetForm }) => {
        try {
            if (editingContact) {
                await httpClient.put("http://localhost:8080/update_emergency_contact", {
                    ...values,
                    previous_email: editingContact.email,
                });
            } else {
                await httpClient.post("http://localhost:8080/create_emergency_contact", values);
            }
            resetForm();
            resetModal();
        } catch (e) {
            if(e.response.status === 409) setError("Contact already exists")
            else setError(e.response?.data?.error || "Failed to save contact.");
        }
    };

    const deleteContact = async (email) => {
        try {
            await httpClient.post("http://localhost:8080/delete_emergency_contact", { email });
            getContacts();
        } catch (e) {
            console.error("Failed to delete contact:", e);
            setError("Could not delete contact.");
        }
    };

    useEffect(() => {
        getContacts();
    }, []);

    return (
        <>
            {contacts.length > 0 && (
                <Box>
                    <Stack
                        direction="row"
                        spacing={4}
                        sx={{ width: "100%"}}
                    >
                        {contacts.map((contact) => (
                            <Stack
                                key={contact.email}
                                direction="row"
                                spacing={3}
                                alignItems="center"
                                sx={{
                                    p: 3,
                                    borderRadius: "8px",
                                    backgroundColor: "white",
                                    minWidth: "335px", 
                                    justifyContent: "space-between",
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        {contact.first_name} {contact.last_name}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                        {contact.email}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                                        {contact.phone}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <IconButton
                                        onClick={() => {
                                            setEditingContact(contact);
                                            setOpen(true);
                                        }}
                                    > <Edit sx={{ fontSize: 28 }} />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => deleteContact(contact.email)}>
                                        <Delete sx={{ fontSize: 28 }} />
                                    </IconButton>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            )}
            <br/>
            {contacts.length !== 2 && (
                <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={() => setOpen(true)}
                > Add Contact
                </Button>
            )}
            <Modal
                open={open}
                onClose={() => {
                    resetModal();
                    setEditingContact(null);
                }}
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
                        width: 600,
                    }}
                >
                <IconButton
                    onClick={() => {
                    setOpen(false);
                    setEditingContact(null);
                    }}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <Cancel/>
                </IconButton>

                <Typography id="modal-title" variant="h6" mb={2}>
                    {editingContact ? "Edit Contact" : "Add New Contact"}
                </Typography>

                <Formik
                    enableReinitialize
                    initialValues={{
                        first_name: editingContact?.first_name || "",
                        last_name: editingContact?.last_name || "",
                        email: editingContact?.email || "",
                        phone: editingContact?.phone || "",
                    }}

                    validationSchema={Yup.object({
                        first_name: Yup.string().required("First name is required"),
                        last_name: Yup.string().required("Last name is required"),
                        email: Yup.string().email("Invalid email").required("Email is required"),
                        phone: Yup.string()
                            .matches(/^\d{10,15}$/, "Phone number is not valid")
                            .required("Phone number is required"),
                        })}
                    onSubmit={(values, { resetForm }) => {
                    handleAddOrUpdate(values, { resetForm });
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
                        <Stack spacing={2}>
                            <Grid2 container spacing={2} sx={{ width: '100%' }}>
                                <Grid2 xs={6}>
                                    <FormControl fullWidth error={Boolean(touched.first_name && errors.first_name)}>
                                    <InputLabel>First Name</InputLabel>
                                    <OutlinedInput
                                        id="first_name"
                                        name="first_name"
                                        value={values.first_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.first_name && errors.first_name && (
                                        <FormHelperText>{errors.first_name}</FormHelperText>
                                    )}
                                    </FormControl>
                                </Grid2>
                                <Grid2 xs={6}>
                                    <FormControl fullWidth error={Boolean(touched.last_name && errors.last_name)}>
                                    <InputLabel>Last Name</InputLabel>
                                    <OutlinedInput
                                        id="last_name"
                                        name="last_name"
                                        value={values.last_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.last_name && errors.last_name && (
                                        <FormHelperText>{errors.last_name}</FormHelperText>
                                    )}
                                    </FormControl>
                                </Grid2>
                            </Grid2>

                            <FormControl error={Boolean(touched.email && errors.email)}>
                                <InputLabel>Email</InputLabel>
                                <OutlinedInput
                                id="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                />
                                {touched.email && errors.email && (
                                <FormHelperText>{errors.email}</FormHelperText>
                                )}
                            </FormControl>

                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box flexGrow={1}>
                                    <FormControl fullWidth error={Boolean(touched.phone && errors.phone)}>
                                        <InputLabel>Phone</InputLabel>
                                        <OutlinedInput
                                        id="phone"
                                        name="phone"
                                        value={values.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        />
                                        {touched.phone && errors.phone && (
                                        <FormHelperText>{errors.phone}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                                <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!isValid || !dirty}
                                >
                                {editingContact ? "Update" : "Add"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Form>
                    )}
                </Formik>
                <br/>
                {error && (
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                </Box>
            </Modal>
        </>
    );
    };

    export default EmergencyContacts;
