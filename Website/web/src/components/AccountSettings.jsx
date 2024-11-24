import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    Stack,
    OutlinedInput,
    InputLabel,
    FormHelperText,
    Button,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import httpClient from '../pages/httpClient';

const AccountSettings = () => {
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [formStatus, setFormStatus] = React.useState(null);
    const [currentEmail, setCurrentEmail] = React.useState("");
    const [error, setError] = React.useState("");

    const handleToggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
    const handleToggleNewPassword = () => setShowNewPassword(!showNewPassword);

    React.useEffect(() => {
        const fetchCurrentEmail = async () => {
            try {
                const response = await httpClient.get("http://localhost:8080/@me");
                setCurrentEmail(response.data.email);
            } catch (error) {
                console.error("Failed to fetch current email:", error);
            }
        };
        fetchCurrentEmail();
    }, []);

    const updateEmail = async (email) => {
        try {
            const resp = await httpClient.post("http://localhost:8080/update_email", { email });
            if (resp.status === 200) {
                setCurrentEmail(email);
                setFormStatus({ success: true, message: "Account updated successfully!" });
            } else {
                setFormStatus({ success: false, message: "Could not update email." });
            }
        } catch (error) {
            if(error.response?.status === 409) {
                setFormStatus({ success: false, message: "Email is already registered" });
            } else {
                setFormStatus({ success: false, message: "Failed to update account" });
            }
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            const resp = await httpClient.post("http://localhost:8080/update_password", {
                current_password: currentPassword,
                new_password: newPassword,
            });
            if (resp.status === 200) {
                setFormStatus({ success: true, message: "Account updated successfully!" });
            } else {
                setFormStatus({ success: false, message: "Could not update password." });
            }
        } catch (e) {
            if (e.response?.status === 403) {
                setFormStatus({ success: false, message: "Current password is incorrect." });
            } else {
                setFormStatus({ success: false, message: "Failed to update account." });
            }
        }
    };

    return (
        <>
            <Formik
                enableReinitialize
                initialValues={{
                    email: currentEmail,
                    currentPassword: "",
                    newPassword: ""
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email("Must be a valid email").max(255),
                    newPassword: Yup.string().min(8, "Password must be at least 8 characters"),
                })}
                onSubmit={async (values, { resetForm }) => {
                    const { email, currentPassword, newPassword } = values;
                    if (email && email !== currentEmail) await updateEmail(email);
                    if (currentPassword && newPassword) await updatePassword(currentPassword, newPassword);
                    resetForm();
                    setError("");
                }}
            >
                {({
                    errors,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    isValid,
                    dirty,
                    touched,
                    values
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <Stack spacing={2} sx={{ width: "100%", color: "#333" }}>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fullWidth
                                placeholder="New Email"
                                error={Boolean(touched.email && errors.email)}
                                sx={{ backgroundColor: "#fff", borderRadius: "4px" }}
                            />
                            {touched.email && errors.email && (
                                <FormHelperText error>{errors.email}</FormHelperText>
                            )}

                            <InputLabel>Current Password</InputLabel>
                            <OutlinedInput
                                name="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={values.currentPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fullWidth
                                placeholder="Current Password"
                                error={Boolean(touched.currentPassword && errors.currentPassword)}
                                sx={{ backgroundColor: "#fff", borderRadius: "4px" }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleToggleCurrentPassword}
                                            edge="end"
                                            size="large"
                                        >
                                            {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                            {touched.currentPassword && errors.currentPassword && (
                                <FormHelperText error>{errors.currentPassword}</FormHelperText>
                            )}

                            <InputLabel>New Password</InputLabel>
                            <OutlinedInput
                                name="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={values.newPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                fullWidth
                                placeholder="New Password"
                                error={Boolean(touched.newPassword && errors.newPassword)}
                                sx={{ backgroundColor: "#fff", borderRadius: "4px" }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleToggleNewPassword}
                                            edge="end"
                                            size="large"
                                        >
                                            {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                            {touched.newPassword && errors.newPassword && (
                                <FormHelperText error>{errors.newPassword}</FormHelperText>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={
                                    !(isValid && dirty) ||
                                    !(values.currentPassword && values.newPassword) &&
                                    (values.currentPassword || values.newPassword)
                                }
                                sx={{
                                    mt: 2,
                                    backgroundColor: "#007bff",
                                    color: "#fff"
                                }}
                            >
                                Update Account
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
            {formStatus && (
                <FormHelperText error={!formStatus.success} sx={{ mt: 2, textAlign: "center", color: formStatus.success ? "green" : "red" }}>
                    {formStatus.message}
                </FormHelperText>
            )}
            {error && (
                <FormHelperText error sx={{ mt: 2, textAlign: "center", color: "red" }}>
                    {error}
                </FormHelperText>
            )}
        </>
    );
};

export default AccountSettings;
