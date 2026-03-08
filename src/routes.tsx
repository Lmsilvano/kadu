import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import AttendancePage from './pages/AttendancePage';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/scan" element={<ScannerPage />} />
                <Route path="/list/:id" element={<AttendancePage />} />
            </Routes>
        </BrowserRouter>
    );
}
