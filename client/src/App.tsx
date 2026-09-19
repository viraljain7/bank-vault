import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { VaultGate } from './components/vault/VaultGate';
import { ProtectedRoute } from './app/ProtectedRoute';
import { SignInPage } from './pages/SignIn';
import { SignUpPage } from './pages/SignUp';
import { DashboardPage } from './pages/Dashboard';
import { BankAccountsPage } from './pages/BankAccounts';
import { BankFormPage } from './pages/BankFormPage';
import { BankDetailPage } from './pages/BankDetail';
import { CardsPage } from './pages/Cards';
import { CardFormPage } from './pages/CardFormPage';
import { CardDetailPage } from './pages/CardDetail';
import { FavoritesPage } from './pages/Favorites';
import { SearchPage } from './pages/Search';
import { ActivityPage } from './pages/Activity';
import { SecurityPage } from './pages/Security';
import { SettingsPage } from './pages/Settings';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<VaultGate />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/banks" element={<BankAccountsPage />} />
            <Route path="/banks/new" element={<BankFormPage mode="create" />} />
            <Route path="/banks/:id" element={<BankDetailPage />} />
            <Route path="/banks/:id/edit" element={<BankFormPage mode="edit" />} />

            <Route path="/cards" element={<CardsPage />} />
            <Route path="/cards/new" element={<CardFormPage mode="create" />} />
            <Route path="/cards/:id" element={<CardDetailPage />} />
            <Route path="/cards/:id/edit" element={<CardFormPage mode="edit" />} />

            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}