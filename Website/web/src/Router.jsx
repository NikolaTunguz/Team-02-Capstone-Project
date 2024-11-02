import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; 
import NotFound from './pages/NotFound';
import Dashboard from './pages/dashboard/index';
import Notifications from './pages/notifications/index'; 
import Account from './pages/account/index'
import Register from './pages/Register';

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route 
                    path="/login" 
                    element={<Login/>} 
                />
                <Route 
                    path="/register" 
                    element={<Register/>} 
                />
                <Route 
                    path="*" 
                    element={<Login/>}
                />
                <Route 
                    path="*" 
                    element={<NotFound/>}
                />
                <Route 
                    path="/dashboard" 
                    element={<Dashboard/>}
                />
                <Route 
                    path="/notifications" 
                    element={<Notifications/>} 
                />
                <Route 
                    path="/account" 
                    element={<Account/>} 
                />
            </Routes>
        </BrowserRouter>
    );
};
export default Router;
