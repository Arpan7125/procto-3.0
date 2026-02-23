import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import StudentSignup from './pages/StudentSignup';
import FacultySignup from './pages/FacultySignup';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuestionBankPage from './pages/QuestionBankPage';
import ExamBuilderPage from './pages/ExamBuilderPage';
import TakeExamPage from './pages/TakeExamPage';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/faculty/signup" element={<FacultySignup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Protected student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-exam/:examId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <TakeExamPage />
            </ProtectedRoute>
          }
        />

        {/* Protected faculty routes */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <QuestionBankPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <ExamBuilderPage />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy redirects */}
        <Route path="/login" element={<Navigate to="/student/login" replace />} />
        <Route path="/register" element={<Navigate to="/student/signup" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
