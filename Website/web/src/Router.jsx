import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/public/Login";
import NotFound from './pages/public/NotFound';
import Dashboard from './pages/dashboard/index';
import Notifications from './pages/notifications/index';
import Account from './pages/account/index'
import Register from './pages/public/Register';
import { useAuth } from "./context/AuthContext";
import HeaderContent from "./layout/Header";
import NavBar from "./components/NavBar";
import AppLayout from "./AppLayout"

import Home from './pages/home'
import HomeNavBar from './components/HomeNavBar'

const Router = () => {
    const { isLoggedIn } = useAuth();

    return (
        <BrowserRouter>
            {isLoggedIn && <NavBar/>}
            {isLoggedIn && <HeaderContent/>}
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route
                    path="/"
                    element={<Home />}
                />
                <Route
                    path="/Home"
                    element={<Home />}
                />
                <Route
                    path="*"
                    element={<NotFound />}
                />
                {isLoggedIn && <>
                    <Route
                        path="/dashboard"
                        element={<AppLayout> <Dashboard /> </AppLayout>}
                    />
                    <Route
                        path="/notifications"
                        element={<AppLayout> <Notifications /></AppLayout> }
                    />
                    <Route
                        path="/account"
                        element={<AppLayout> <Account /> </AppLayout>}
                    />
                </>}
            </Routes>
        </BrowserRouter>
    );
};
export default Router;
