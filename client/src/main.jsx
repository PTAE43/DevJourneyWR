import 'rsuite/dist/rsuite-no-reset.min.css';
import { CustomProvider } from 'rsuite';
import App from './App.jsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from "@/contexts/AuthContext";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <CustomProvider theme="light">
                <App />
            </CustomProvider>
        </AuthProvider>
    </React.StrictMode>
);