import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import AttendancePage from './pages/AttendancePage';
import SettingsPage from './pages/SettingsPage';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScannerPage />} />
            <Route path="/list/:id" element={<AttendancePage />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Routes>
    );
}
