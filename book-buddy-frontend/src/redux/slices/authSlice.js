import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from "jwt-decode";

const getUserFromToken = (token) => {
    try {
        if (!token) return null;
        const decoded = jwtDecode(token);
        
        // 1. Extract Name (Handles standard claims and .NET specific claims)
        let extractedName = decoded.given_name 
                         || decoded.unique_name 
                         || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
                         || "Admin User";

        // 2. Handle Array Case (Your token has unique_name: ['6', '6'])
        if (Array.isArray(extractedName)) {
            extractedName = extractedName[0]; // Takes "6"
        }

        // 3. Convert to String
        extractedName = String(extractedName);

        // 4. FIX: If the name is a NUMBER (like "6"), ignore it and use Role instead
        // We check if it contains only digits
        if (/^\d+$/.test(extractedName)) {
             extractedName = decoded.role === 'Admin' ? 'Administrator' : 'Library Member';
        }

        return { 
            name: extractedName,
            email: decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
            role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
            id: decoded.nameid || decoded.sub || (Array.isArray(decoded.unique_name) ? decoded.unique_name[0] : decoded.unique_name)
        };
    } catch (e) {
        return null;
    }
};

const initialState = {
  token: localStorage.getItem('token') || null,
  user: getUserFromToken(localStorage.getItem('token')),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.user = getUserFromToken(action.payload);
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;