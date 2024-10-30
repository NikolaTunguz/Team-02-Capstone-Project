import { Box, Grid2, Stack } from "@mui/material";
import AuthLogin from './AuthLogin';
import '../App.css';
import templogo from '../assets/images/templogo.png';

const Login = () => (
    <Grid2 
        container 
        justifyContent="center" 
        alignItems="center" 
        style={{ minHeight: '100vh' }} 
    >
        <Grid2 xs={12} sm={8} md={4}>
            <Box 
                sx={{ 
                    padding: 4, 
                    borderRadius: 2, 
                    boxShadow: 3,
                    backgroundColor: '#fff', 
                    width: '100%',
                    maxWidth: '500px', 
                }}
            >
                <Stack direction="column" spacing={2} alignItems="center">
                    <img alt={'logo'} src={templogo} style={{ width: "350px" }} />
                    <AuthLogin />
                </Stack>
            </Box>
        </Grid2>
    </Grid2>
);

export default Login;
