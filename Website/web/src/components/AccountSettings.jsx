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
import { useAuth } from '../context/AuthContext';
import Expandable from './Expandable.jsx'
import { showSuccess, showError } from "./ToastUtils";

const AccountSettings = () => {
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfPassword, setShowConfPassword] = React.useState(false);
    const [currentEmail, setCurrentEmail] = React.useState("");
    const [currentPhoneNumber, setCurrentPhoneNumber] = React.useState("");
    const { firstName, lastName, setFirstName, setLastName } = useAuth();

    const handleToggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
    const handleToggleNewPassword = () => setShowNewPassword(!showNewPassword);
    const handleToggleConfPassword = () => setShowConfPassword(!showConfPassword);

    React.useEffect(() => {
        const fetchCurrentEmail = async () => {
            try {
                const response = await httpClient.get("/api/@me");
                setCurrentEmail(response.data.email);
            } catch (error) {
                console.error("Failed to fetch current email:", error);
            }
        };
        fetchCurrentEmail();
    }, []);

    React.useEffect(() => {
        const fetchCurrentPhoneNumber = async () => {
            try {
                const response = await httpClient.get("/api/current_phone_number");
                setCurrentPhoneNumber(response.data.phone_number);
            } catch (error) {
                console.error("Failed to fetch current phone number:", error);
            }
        };
        fetchCurrentPhoneNumber();
    }, []);

    const updateEmail = async (email) => {
        try {
            const resp = await httpClient.post("/api/update_email", { email });
            if (resp.status === 200) {
                setCurrentEmail(email);
                showSuccess("Account updated successfully!");
            } else {
                showError("Email could not be updated.");
            }
        } catch (error) {
            if (error.response?.status === 409) {
                showError("Email is already registered with SeeThru.");
            } else {
                showError("Failed to update account.");
            }
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            const resp = await httpClient.post("/api/update_password", {
                current_password: currentPassword,
                new_password: newPassword,
            });
            if (resp.status === 200) {
                showSuccess("Password updated successfully!");
            } else {
                showError("Password could not be updated.");
            }
        } catch (e) {
            if (e.response?.status === 403) {
                showError("Current password is incorrect.");
            } else {
                showError("Failed to update password.");
            }
        }
    };

    const updateFirstName = async (first_name) => {
        try {
            const resp = await httpClient.post("/api/update_first_name", { first_name });
            setFirstName(first_name)
            if (resp.status === 200) {
                showSuccess("First name updated successfully!");
            }
        } catch {
            showError("Last name to update account.");
        }
    };

    const updateLastName = async (last_name) => {
        try {
            const resp = await httpClient.post("/api/update_last_name", { last_name });
            setLastName(last_name)
            if (resp.status === 200) {
                showSuccess("Last name updated successfully!");
            }
        } catch {
            showError("Failed to update last name.");
        }
    };

    const updatePhoneNumber = async (phone_number) => {
        try {
            const resp = await httpClient.post("/api/update_phone_number", { phone_number });
            setCurrentPhoneNumber(phone_number)
            if (resp.status === 200) {
                showSuccess("Phone number updated successfully!");
            }
        } catch {
            showError("Failed to update phone number.");
        }
    }

    const getPasswordRequirements = (password) => {
        return [
            { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
            { label: "1 number or special character", valid: /[\d@$!%*?&]/.test(password) },
            { label: "10 characters", valid: password.length >= 10 },
        ];
    };


    return (
        <>
            <Expandable preview='Personal Information' content={
                <div>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            formFirstName: firstName,
                            formLastName: lastName,
                            phoneNumber: currentPhoneNumber,
                        }}
                        validationSchema={Yup.object().shape({
                            formFirstName: Yup.string().max(25),
                            formLastName: Yup.string().max(25),
                            phoneNumber: Yup.string()
                                .matches(/^\d{10,15}$/, "Phone number is not valid")
                                .required('Phone number is required'),
                        })}
                        onSubmit={async (values, { resetForm }) => {
                            const { formFirstName, formLastName, phoneNumber } = values;
                            if (formFirstName && formFirstName !== firstName) await updateFirstName(formFirstName);
                            if (formLastName && formLastName !== lastName) await updateLastName(formLastName);
                            if (phoneNumber && phoneNumber !== currentPhoneNumber) await updatePhoneNumber(phoneNumber);
                            resetForm();
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
                                <Stack spacing={2} sx={{ width: "100%", color: "#333", paddingBottom: 2 }}>
                                    <InputLabel>First Name</InputLabel>
                                    <OutlinedInput
                                        type="text"
                                        name="formFirstName"
                                        value={values.formFirstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        fullWidth
                                        placeholder="New First Name"
                                        error={Boolean(touched.formFirstName && errors.formFirstName)}
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
                                    />
                                    {touched.formFirstName && errors.formFirstName && (
                                        <FormHelperText error>{errors.formFirstName}</FormHelperText>
                                    )}

                                    <InputLabel>Last Name</InputLabel>
                                    <OutlinedInput
                                        type="text"
                                        name="formLastName"
                                        value={values.formLastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        fullWidth
                                        placeholder="New Last Name"
                                        error={Boolean(touched.formLastName && errors.formLastName)}
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
                                    />
                                    {touched.formLastName && errors.formLastName && (
                                        <FormHelperText error>{errors.formLastName}</FormHelperText>
                                    )}

                                    <InputLabel>Phone Number</InputLabel>
                                    <OutlinedInput
                                        type="text"
                                        name="phoneNumber"
                                        value={values.phoneNumber}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        fullWidth
                                        placeholder="New Phone Number"
                                        error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
                                    />
                                    {touched.phoneNumber && errors.phoneNumber && (
                                        <FormHelperText error>{errors.phoneNumber}</FormHelperText>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled={
                                            !(isValid && dirty)
                                        }
                                        sx={{
                                            mt: 2,
                                            backgroundColor: "#007bff",
                                            color: "#fff"
                                        }}
                                    >
                                        Update
                                    </Button>
                                </Stack>
                            </Form>
                        )}
                    </Formik>
                </div>
            }
                style={{ minWidth: '760px' }}
            >

            </Expandable>

            <Expandable preview='Login Credentials' content={
                <div>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            email: currentEmail,
                            currentPassword: "",
                            newPassword: "",
                            confPassword: "",
                        }}
                        validationSchema={Yup.object().shape({
                            email: Yup.string().email("Must be a valid email").max(255),
                            newPassword: Yup.string(),
                            confPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match')

                        })}
                        onSubmit={async (values, { resetForm }) => {
                            const { email, currentPassword, newPassword } = values;
                            if (email && email !== currentEmail) await updateEmail(email);
                            if (currentPassword && newPassword) await updatePassword(currentPassword, newPassword);
                            resetForm();
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
                                <Stack spacing={2} sx={{ width: "100%", color: "#333", paddingBottom: 2 }}>
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
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
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
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
                                        endAdornment={
                                            values.currentPassword.length > 0 && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleToggleCurrentPassword}
                                                        edge="end"
                                                        size="large"
                                                    >
                                                        {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
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
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
                                        endAdornment={
                                            values.newPassword.length > 0 && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleToggleNewPassword}
                                                        edge="end"
                                                        size="large"
                                                    >
                                                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    />
                                    {touched.newPassword && errors.newPassword && (
                                        <FormHelperText error>{errors.newPassword}</FormHelperText>
                                    )}
                                    {touched.newPassword && values.newPassword && <ul style={{
                                        display: 'grid',
                                        gap: '10px',
                                        paddingLeft: '20px',
                                        fontSize: '13px',
                                        marginTop: '10px',
                                    }}>
                                        {getPasswordRequirements(values.newPassword).map((req, index) => (
                                            <li key={index} style={{ color: req.valid ? 'green' : '#d32f2f' }}>
                                                {req.label}
                                            </li>
                                        ))}
                                    </ul>}

                                    <InputLabel>Confirm New Password</InputLabel>
                                    <OutlinedInput
                                        name="confPassword"
                                        type={showConfPassword ? "text" : "password"}
                                        value={values.confPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        fullWidth
                                        placeholder="Confirm New Password"
                                        error={Boolean(touched.confPassword && errors.confPassword)}
                                        sx={{
                                            backgroundColor: "#fff",
                                            borderRadius: "4px",
                                            width: "700px",
                                        }}
                                        endAdornment={
                                            values.confPassword.length > 0 && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleToggleConfPassword}
                                                        edge="end"
                                                        size="large"
                                                    >
                                                        {showConfPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    />
                                    {touched.confPassword && errors.confPassword && (
                                        <FormHelperText error>{errors.confPassword}</FormHelperText>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled={!!(
                                            !(isValid && dirty) ||
                                            (!(values.currentPassword && values.newPassword && values.confPassword) &&
                                                (values.currentPassword || values.newPassword || values.confPassword))
                                        )}
                                        sx={{
                                            mt: 2,
                                            backgroundColor: "#007bff",
                                            color: "#fff"
                                        }}
                                    >
                                        Update
                                    </Button>
                                </Stack>
                            </Form>
                        )}
                    </Formik>
                </div>
            }
                style={{ minWidth: '760px' }}
            >
            </Expandable>
        </>
    );
};

export default AccountSettings;
