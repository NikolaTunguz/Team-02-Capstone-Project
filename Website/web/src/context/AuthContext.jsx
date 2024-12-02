import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("http://localhost:8080/@me", { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    setIsLoggedIn(true);
                    setUser(data);
                } else {
                    setIsLoggedIn(false);
                }
            } catch {
                setIsLoggedIn(false);
            }
        };
        fetchCurrentUser();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, firstName, setFirstName, lastName, setLastName}}>
            {children}
        </AuthContext.Provider>
    );
};
