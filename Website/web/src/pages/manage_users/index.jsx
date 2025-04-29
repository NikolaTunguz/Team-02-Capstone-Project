import React from 'react';
import './index.css';
import httpClient from "../httpClient";
import {
    Box,
    OutlinedInput,
    Button,
    InputLabel,
    FormHelperText,
    Stack,
    Modal,
    Typography,
    Tooltip,
    IconButton
} from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';
import HeaderContent from "../../layout/Header";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import "../../App.css";
import { Cancel } from "@mui/icons-material";

const ManageUsers = () => {
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [previousEmail, setPreviousEmail] = React.useState("");
    const [colDefs] = React.useState([
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,

            headerName: "Email",
            field: "email",
            floatingFilter: true,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "First Name",
            field: "first_name",
            floatingFilter: true,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Last Name",
            field: "last_name",
            floatingFilter: true,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Phone Number",
            field: "phone",
            floatingFilter: true,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Account Type",
            field: "account_type",
            floatingFilter: true,
            filter: "agTextColumnFilter",
        }
    ]);

    React.useEffect(() => {
        setSelectedUser({});
        getUsers();
    }, [])

    const getUsers = async () => {
        try {
            const response = await httpClient.get("/api/get_users");
            setUsers(response.data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDelete = () => {
        setOpenDeleteModal(true);
    };

    const deleteUser = async () => {
        if (!selectedUser) return;
        const email = selectedUser.email;
        try {
            await httpClient.post("/api/delete_user", { email });
            getUsers();
            setOpenDeleteModal(false);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }

    const updateUser = async (email, firstName, lastName, phone, accountType) => {
        try {
            await httpClient.put("/api/update_user", {
                previous_email: previousEmail,
                email: email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                account_type: accountType
            });
            getUsers();
        } catch (error) {
            console.error("Error updating contact: ", error);
        }
    };

    const gridSelect = (event) => {
        if (event?.api?.getSelectedNodes?.().length > 0) {
            var node = event.api.getSelectedNodes()[0];
            setSelectedUser(node?.data);
            setPreviousEmail(node?.data.email);
        }
        else {
            setSelectedUser({})
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <HeaderContent />
            <div style={{ marginTop: '4%' }}>
                <h2> SeeThru Users </h2>
            </div>
            <div style={{ height: 500 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ width: '73%' }}>
                        <AgGridReact
                            rowData={users}
                            columnDefs={colDefs}
                            domLayout='autoHeight'
                            rowSelection="multiple"
                            // suppressRowClickSelection={true}
                            onSelectionChanged={gridSelect}
                        />
                    </Box>
                    <Box sx={{ width: '25%', minHeight: 600, borderRadius: '8px' }}>
                        {selectedUser && Object.keys(selectedUser).length !== 0 &&
                            <Box sx={{ backgroundColor: "white", borderRadius: '8px', p: 3 }}>
                                <Formik
                                    enableReinitialize
                                    initialValues={{
                                        email: selectedUser.email,
                                        first_name: selectedUser.first_name,
                                        last_name: selectedUser.last_name,
                                        phone: selectedUser.phone,
                                        account_type: selectedUser.account_type
                                    }}
                                    validationSchema={Yup.object({
                                        first_name: Yup.string().required("First name is required"),
                                        last_name: Yup.string().required("Last name is required"),
                                        email: Yup.string().email("Invalid email").required("Email is required"),
                                        phone: Yup.string()
                                            .matches(/^\d{10,15}$/, "Phone number is not valid")
                                            .required("Phone number is required"),
                                        account_type: Yup.string()
                                            .oneOf(["admin", "user"], "Account type must be either 'admin' or 'user'")
                                            .required("Account type is required") 
                                    })}
                                    onSubmit={(values) => {
                                        updateUser(
                                            values.email,
                                            values.first_name,
                                            values.last_name,
                                            values.phone,
                                            values.account_type
                                        )
                                    }}
                                >
                                    {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
                                        <Form onSubmit={handleSubmit}>
                                            <Stack spacing={2}>
                                                <InputLabel>Email</InputLabel>
                                                <OutlinedInput
                                                    name="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                    error={Boolean(touched.email && errors.email)}
                                                />
                                                {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}

                                                <InputLabel>First Name</InputLabel>
                                                <OutlinedInput
                                                    name="first_name"
                                                    value={values.first_name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                    error={Boolean(touched.first_name && errors.first_name)}
                                                />
                                                {touched.first_name && errors.first_name && <FormHelperText error>{errors.first_name}</FormHelperText>}

                                                <InputLabel>Last Name</InputLabel>
                                                <OutlinedInput
                                                    name="last_name"
                                                    value={values.last_name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                    error={Boolean(touched.last_name && errors.last_name)}
                                                />
                                                {touched.last_name && errors.last_name && <FormHelperText error>{errors.last_name}</FormHelperText>}

                                                <InputLabel>Phone Number</InputLabel>
                                                <OutlinedInput
                                                    name="phone"
                                                    value={values.phone}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                    error={Boolean(touched.phone && errors.phone)}
                                                />
                                                {touched.phone && errors.phone && <FormHelperText error>{errors.phone}</FormHelperText>}

                                                <InputLabel>Account Type</InputLabel>
                                                <OutlinedInput
                                                    name="account_type"
                                                    value={values.account_type}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                    error={Boolean(touched.account_type && errors.account_type)}
                                                />
                                                {touched.account_type && errors.account_type && <FormHelperText error>{errors.account_type}</FormHelperText>}

                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    sx={{ mt: 2 }}
                                                > Update
                                                </Button>
                                                <Button
                                                    onClick={handleDelete}
                                                    variant="contained"
                                                    color="error"
                                                    sx={{ mt: 1 }}>Delete</Button>
                                            </Stack>
                                        </Form>
                                    )}
                                </Formik>
                            </Box>}
                    </Box>
                </Box>
            </div>
            <Modal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
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
                        onClick={() => setOpenDeleteModal(false)}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <Cancel />
                    </IconButton>
                    <Typography variant="h6"> Delete User </Typography>
                    <Typography sx={{ mt: 2 }}>Are you sure you want to delete this user?</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            onClick={deleteUser}
                            color="error"
                            fullWidth
                        >Confirm
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
};

export default ManageUsers;
