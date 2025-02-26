import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/public/Login";
import Cameras from './pages/cameras/index';
import Notifications from './pages/notifications/index';
import Account from './pages/account/index'
import Register from './pages/public/Register';
import { useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import AppLayout from "./AppLayout"
import AboutUs from './pages/about_us'
import NotFound from './pages/public/not_found/index.jsx'

const Router = () => {
    const { isLoggedIn } = useAuth();

    return (
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
                    element={
                        isLoggedIn
                            ? <AppLayout> <AboutUs /> </AppLayout>
                            : <AboutUs />
                    }
                />
                <Route
                    path="*"
                    element={<NotFound />}
                />
                {isLoggedIn && <>
                    <Route
                        path="/cameras"
                        element={<AppLayout> <Cameras /> </AppLayout>}
                    />
                    <Route
                        path="/notifications"
                        element={<AppLayout> <Notifications /></AppLayout>}
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
