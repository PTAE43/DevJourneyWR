import 'rsuite/dist/rsuite-no-reset.min.css';
import { CustomProvider } from 'rsuite';
import App from './App.jsx';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <CustomProvider theme="light">
            <App />
        </CustomProvider>
    </React.StrictMode>
);


// import { useToaster, Message } from 'rsuite';
// const toaster = useToaster();
// toaster.push(<Message type="error" closable>ข้อความผิดพลาด</Message>, { placement: 'bottomCenter', duration: 4000 });