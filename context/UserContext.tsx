// context/UserContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [mongoUser, setMongoUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/me");
        setMongoUser(res.data);
      } catch (e) {
        setMongoUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ mongoUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
