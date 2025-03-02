import React from 'react';
import './index.css';
import httpClient from "../httpClient";
import  { Box, Typography } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react'; 
import HeaderContent from "../../layout/Header";

const ManageUsers = () => {
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState({});
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
            const response = await httpClient.get("http://localhost:8080/get_users");
            setUsers( response.data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    
    const gridSelect = (event) => {
        if (event?.api?.getSelectedNodes?.().length > 0){
            var node = event.api.getSelectedNodes()[0];
            setSelectedUser(node?.data);
        }
        else{
            setSelectedUser({})
        }
    }

    return (
        <>
            <HeaderContent />
            <div style={{ height: 500, marginTop: '7%'}}>
            <Typography variant="h4" gutterBottom> Current Users </Typography>
                <Box sx = {{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ width: '67%' }}>
                        <AgGridReact
                                rowData={users}
                                columnDefs={colDefs}
                                domLayout = 'autoHeight'
                                rowSelection="multiple"
                                // suppressRowClickSelection={true}
                                onCellClicked = {gridSelect}
                            />
                    </Box>

                    <Box sx={{width: '32%', backgroundColor: "white", borderRadius: '8px'}}>
                        <p>
                        Email: {selectedUser.email} <br/> 
                        First Name: {selectedUser.first_name} <br/> 
                        Last Name: {selectedUser.last_name} <br/> 
                        Phone Number: {selectedUser.phone} <br/> 
                        Account Type: {selectedUser.account_type} <br/> 
                        </p>

                    </Box>
                </Box>
            </div>
        </>
        
    );
};

export default ManageUsers;