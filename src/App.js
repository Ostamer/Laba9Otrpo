import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainWindow from './components/MainWindow';
import WebWindow from './components/Web';
import { ToastContainer } from 'react-toastify';  // Импорт ToastContainer
import 'react-toastify/dist/ReactToastify.css';    // Импорт стилей для Toast

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainWindow />} />
          <Route path="/Web/" element={<WebWindow />} />
        </Routes>

        {/* Позиция для ToastContainer теперь: top-right */}
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;
