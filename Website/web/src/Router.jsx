import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from './pages/NotFound';
import Dashboard from './pages/dashboard/index';
import Notifications from './pages/notifications/index';
import Account from './pages/account/index'
import Register from './pages/Register';
import { useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";

import Home from './pages/home'

const Router = () => {
    const { isLoggedIn } = useAuth();

    return (
        <>
        <BrowserRouter>
            {isLoggedIn && <NavBar />}
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
                    path="*"
                    element={<NotFound />}
                />
                {isLoggedIn && <>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />
                    <Route
                        path="/notifications"
                        element={<Notifications />}
                    />
                    <Route
                        path="/account"
                        element={<Account />}
                    />
                </>}
            </Routes>
        </BrowserRouter>
        </>
    );
};
export default Router;
