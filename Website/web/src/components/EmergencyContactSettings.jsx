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
    Switch,
    FormControlLabel,
    Tooltip,
    List,
    ListItem,
    ListItemIcon,
} from "@mui/material";
import {
    Delete,
    Edit,
    Cancel,
    Check,
} from "@mui/icons-material";
import httpClient from "../pages/httpClient";
import NotificationInfo from "./NotificationInfo";
import { showSuccess, showError } from "./ToastUtils";

const EmergencyContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [editingContact, setEditingContact] = useState(null);
    const [open, setOpen] = useState(false);

    const resetModal = () => {
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
            showSuccess(`Contact ${editingContact ? "updated" : "added"} successfully!`);
            resetForm();
            resetModal();
        } catch (e) {
            if (e.response.status === 409) {
                showError("Contact already exists");
            }
            else {
                showError(e.response?.data?.error || "Failed to save contact.");
            }
        }
    };

    const deleteContact = async (email) => {
        try {
            await httpClient.post("http://localhost:8080/delete_emergency_contact", { email });
            getContacts();
            showSuccess("Contact deleted successfully!");
        } catch (e) {
            console.error("Failed to delete contact:", e);
            showError("Could not delete contact.");
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
                        sx={{ width: "100%" }}
                    >
                        {contacts.map((contact) => (
                            <Stack
                                key={contact.email}
                                direction="row"
                                spacing={3}
                                alignItems="flex-start"
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
                                    <List dense>
                                        {contact.notify_pistol && (
                                            <ListItem>
                                                <ListItemIcon>
                                                    <Check color="success" />
                                                </ListItemIcon>
                                                Pistol Detection
                                            </ListItem>
                                        )}
                                        {contact.notify_person && (
                                            <ListItem>
                                                <ListItemIcon>
                                                    <Check color="success" />
                                                </ListItemIcon>
                                                Person Detection
                                            </ListItem>
                                        )}
                                        {contact.notify_package && (
                                            <ListItem>
                                                <ListItemIcon>
                                                    <Check color="success" />
                                                </ListItemIcon>
                                                Package Detection
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                                <Box sx={{ gap: 2, }}>
                                    <Tooltip title="Edit Contact">
                                        <IconButton
                                            onClick={() => {
                                                setEditingContact(contact);
                                                setOpen(true);
                                            }}
                                        > <Edit sx={{ fontSize: 28 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Contact">
                                        <IconButton color="error" onClick={() => deleteContact(contact.email)}>
                                            <Delete sx={{ fontSize: 28 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            )}
            <br />
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
                        <Cancel />
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
                            notify_pistol: editingContact?.notify_pistol || false,
                            notify_person: editingContact?.notify_person || false,
                            notify_package: editingContact?.notify_package || false,
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
                                <Typography id="modal-title" variant="h7" mb={2}>
                                    Contact Information
                                </Typography>
                                <Stack spacing={2} sx={{ marginTop: "6px" }}>
                                    <Box display="flex" gap={2} width="100%" sx={{ pt: 1.25 }}>
                                        <Box flex={1} >
                                            <FormControl fullWidth error={Boolean(touched.first_name && errors.first_name)}>
                                                <InputLabel htmlFor="first_name">First Name</InputLabel>
                                                <OutlinedInput
                                                    label="First Name"
                                                    name="first_name"
                                                    value={values.first_name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {touched.first_name && errors.first_name && (
                                                    <FormHelperText>{errors.first_name}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Box>
                                        <Box flex={1}>
                                            <FormControl fullWidth error={Boolean(touched.last_name && errors.last_name)}>
                                                <InputLabel htmlFor="last_name">Last Name</InputLabel>
                                                <OutlinedInput
                                                    label="Last Name"
                                                    name="last_name"
                                                    value={values.last_name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {touched.last_name && errors.last_name && (
                                                    <FormHelperText>{errors.last_name}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={2} width="100%" sx={{ pt: 1.25 }}>
                                        <Box flex={1} >
                                            <FormControl fullWidth error={Boolean(touched.email && errors.email)}>
                                                <InputLabel htmlFor="email">Email</InputLabel>
                                                <OutlinedInput
                                                    label="email"
                                                    name="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {touched.email && errors.email && (
                                                    <   FormHelperText>{errors.email}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Box>
                                        <Box>
                                            <FormControl error={Boolean(touched.phone && errors.phone)}>
                                                <InputLabel htmlFor="last_name">Phone</InputLabel>
                                                <OutlinedInput
                                                    label="phone"
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
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography id="modal-title" variant="h7" mb={2} sx={{ pt: 1 }}>
                                            Notification Settings
                                        </Typography>
                                        <NotificationInfo />
                                    </Box>
                                    <Stack direction="row" spacing={2} alignItems="center" >
                                        <FormControlLabel
                                            control={
                                                <Tooltip title="Alert this contact when a firearm is detected">
                                                    <Switch
                                                        label="notify_pistol"
                                                        name="notify_pistol"
                                                        checked={values.notify_pistol}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
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
                                                <Tooltip title="Alert this contact when a person is detected">
                                                    <Switch
                                                        label="notify_person"
                                                        name="notify_person"
                                                        checked={values.notify_person}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
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
                                                <Tooltip title="Alert this contact when a package is detected">
                                                    <Switch
                                                        label="notify_package"
                                                        name="notify_package"
                                                        checked={values.notify_package}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
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
                                    </Stack>
                                </Stack>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!isValid || !dirty}
                                    size="large"
                                    fullWidth
                                    sx={{ mt: 3 }}
                                >
                                    {editingContact ? "Update" : "Add"}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                    <br />
                </Box>
            </Modal>
        </>
    );
};

export default EmergencyContacts;
