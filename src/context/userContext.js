import React, {createContext,useContext, useState} from 'react';
import app from "../firebaseConfig";
import {getAuth,signOut} from "firebase/auth";
const UserContext = createContext();

export const UserProvider = ({children}) => {

    const auth = getAuth(app);
    const [user,setUser] = useState(null);
    //so in user is the user data and setUser is the function to set the user data
    const login =(userData) => {//this login function is used to set the user data
        setUser(userData);
    }
    const logout = () => {
        signOut(auth).then(() => {
            setUser(null);
        }).catch((error) => {
            console.log(error);
        });
    }
    //usercontext.provider is used to provide the user data to the components and the value it provides is the user data and the login and logout functions

    //{children} is the components that are using the user data
    return (
        <UserContext.Provider value={{user,login,logout}}>
            {children}
        </UserContext.Provider>
    );
}
export const useUser = () => useContext(UserContext);//this is used to access the user data from the component

//useContext is used to access the user data from the component