import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { SignalRProvider } from './services/signalr';
import { SupportProvider } from './context/SupportProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SignalRProvider>
      <SupportProvider>
        <App />
        <ToastContainer position="top-right" autoClose={4500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </SupportProvider>
    </SignalRProvider>
  </React.StrictMode>
);