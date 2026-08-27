import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout';
import {
  Login,
  Registration,
  Dashboard,
  Profile,
  TranscriptApplication,
  Payment,
  PaymentSuccess,
  PaymentFailed,
  CourseCompletion,
  PaymentHistory,
} from './pages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isRegistered) {
    return <Navigate to="/registration" replace />;
  }

  return <>{children}</>;
}

function RegistrationRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isRegistered) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (!user?.isRegistered) {
      return <Navigate to="/registration" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Registration Route */}
      <Route
        path="/registration"
        element={
          <RegistrationRoute>
            <Registration />
          </RegistrationRoute>
        }
      />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="transcript" element={<TranscriptApplication />} />
        <Route path="course-completion" element={<CourseCompletion />} />
        <Route path="payment-history" element={<PaymentHistory />} />
      </Route>

      {/* Payment Routes (Full Page) */}
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-failed"
        element={
          <ProtectedRoute>
            <PaymentFailed />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
