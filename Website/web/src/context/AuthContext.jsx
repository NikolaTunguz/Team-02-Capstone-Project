import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("http://localhost:8080/@me", { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    if (data.account_type){
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                        setIsLoggedIn(true);
                    }
                    setUser(data);
                    
                } else {
                    setIsAdmin(false);
                    setIsLoggedIn(false);
                }
            } catch {
                setIsAdmin(false);
                setIsLoggedIn(false);
            }
        };
        fetchCurrentUser();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, firstName, setFirstName, lastName, setLastName, isAdmin, setIsAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
