import "./App.css";
import Homepage from "./pages/home.page.jsx";
import AdminPage from "./pages/admin.page.jsx";
import LoginPage from "./pages/login.page.jsx";
import NotFoundPage from "./pages/notfound.page.jsx";
import RegisterPage from "./pages/register.page.jsx";
import ElectionsPage from "./pages/elections.page.jsx";
import VotePage from "./pages/vote.page.jsx";
import ResultsPage from "./pages/results.page.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <main className="min-h-screen min-w-full tracking-wider">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Homepage />
                </ProtectedRoute>
              }
            />

            {/* Elections List */}
            <Route
              path="/elections"
              element={
                <ProtectedRoute>
                  <ElectionsPage />
                </ProtectedRoute>
              }
            />

            {/* Vote Page */}
            <Route
              path="/elections/:id/vote"
              element={
                <ProtectedRoute>
                  <VotePage />
                </ProtectedRoute>
              }
            />

            {/* Results */}
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Auth */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#152040',
              color: '#F0EDE8',
              border: '1px solid rgba(220, 20, 60, 0.2)',
            },
          }}
        />
      </AuthProvider>
    </main>
  );
}

export default App;