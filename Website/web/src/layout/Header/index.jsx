import AccountMenu from './AccountMenu';
import { Stack } from "@mui/material";
import { useLocation } from 'react-router-dom';

const HeaderContent = () => {
    const location = useLocation();
    const hideHeader = location.pathname === "/" || location.pathname === "/register" || location.pathname === "/login";

    return (
        <> 
        {!hideHeader && (
            <Stack 
                direction="row" 
                alignItems="center" 
                justifyContent="space-between" 
                width="100%" 
                    sx={{
                        backgroundColor: "white",
                        height: "65px",
                        position: "fixed",
                        top: 0,
                        left: 0, 
                        zIndex: 1001,
                        padding: "0 20px",
                        justifyContent: "flex-end",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)"
                    }}
            >
            <div style={{ paddingRight: "40px" }}>
                <AccountMenu />
            </div>
            </Stack>
        )}
    </>
    )
}

export default HeaderContent; 