import React from 'react';
import './index.css';
import httpClient from "../httpClient";
import  { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react'; 
import HeaderContent from "../../layout/Header";

const ManageUsers = () => {
    const [users, setUsers] = React.useState([]);
    const [colDefs] = React.useState([
        { 
            headerName: "First Name", 
            field: "first_name",
        },         
        { 
            headerName: "Last Name", 
            field: "last_name",
        },
        { 
            headerName: "Email", 
            field: "email",
        },         
        { 
            headerName: "Phone Number", 
            field: "phone",
        }
    ]);

    React.useEffect(() => {
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
    
    return (
        <>
            <HeaderContent />
            <div style={{ height: 500, marginTop: '7%'}}>
            <Typography variant="h4" gutterBottom> Current Users </Typography>

                <AgGridReact
                    rowData={users}
                    columnDefs={colDefs}
                />
            </div>
        </>
        
    );
};

export default ManageUsers;