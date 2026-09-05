import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages publiques
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import PublicPromotions from './pages/PublicPromotions';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages client
import ClientDashboard from './pages/client/ClientDashboard';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import ClientOrders from './pages/client/ClientOrders';
import ClientOrderDetail from './pages/client/ClientOrderDetail';
import ClientSettings from './pages/client/ClientSettings';
import NotificationsPage from './pages/client/NotificationsPage';
import MessagesPage from './pages/client/MessagesPage';

// Pages fournisseur
import SupplierDashboard from './pages/fournisseur/SupplierDashboard';
import SupplierProducts from './pages/fournisseur/SupplierProducts';
import SupplierNewProduct from './pages/fournisseur/SupplierNewProduct';
import SupplierSales from './pages/fournisseur/SupplierSales';
import SupplierSettings from './pages/fournisseur/SupplierSettings';

// Pages employe
import EmployeeDashboard from './pages/employe/EmployeeDashboard';
import ProductValidation from './pages/employe/ProductValidation';
import OrderManagement from './pages/employe/OrderManagement';
import PromotionManagement from './pages/employe/PromotionManagement';

// Pages admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminProducts from './pages/admin/AdminProducts';
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminSettings from './pages/admin/AdminSettings';

// Pages logistique
import LogisticsDashboard from './pages/logistique/LogisticsDashboard';
import AvailableDeliveries from './pages/logistique/AvailableDeliveries';
import MyDeliveries from './pages/logistique/MyDeliveries';
import DeliveryHistory from './pages/logistique/DeliveryHistory';

import './styles/tokens.css';
import './styles/components.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Zone publique */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/produits/:id" element={<ProductDetail />} />
              <Route path="/promotions" element={<PublicPromotions />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
            </Route>

            {/* Espace client */}
            <Route element={<ProtectedRoute roles={['client']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/client/tableau-de-bord" element={<ClientDashboard />} />
              <Route path="/client/panier" element={<Cart />} />
              <Route path="/client/commander" element={<Checkout />} />
              <Route path="/client/commandes" element={<ClientOrders />} />
              <Route path="/client/commandes/:id" element={<ClientOrderDetail />} />
              <Route path="/client/notifications" element={<NotificationsPage />} />
              <Route path="/client/messages" element={<MessagesPage />} />
              <Route path="/client/parametres" element={<ClientSettings />} />
            </Route>

            {/* Espace fournisseur */}
            <Route element={<ProtectedRoute roles={['fournisseur']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/fournisseur/tableau-de-bord" element={<SupplierDashboard />} />
              <Route path="/fournisseur/produits" element={<SupplierProducts />} />
              <Route path="/fournisseur/produits/nouveau" element={<SupplierNewProduct />} />
              <Route path="/fournisseur/ventes" element={<SupplierSales />} />
              <Route path="/fournisseur/notifications" element={<NotificationsPage />} />
              <Route path="/fournisseur/messages" element={<MessagesPage />} />
              <Route path="/fournisseur/parametres" element={<SupplierSettings />} />
            </Route>

            {/* Espace employe */}
            <Route element={<ProtectedRoute roles={['employe', 'admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/employe/tableau-de-bord" element={<EmployeeDashboard />} />
              <Route path="/employe/validation-produits" element={<ProductValidation />} />
              <Route path="/employe/commandes" element={<OrderManagement />} />
              <Route path="/employe/commandes/:id" element={<ClientOrderDetail />} />
              <Route path="/employe/promotions" element={<PromotionManagement />} />
              <Route path="/employe/messages" element={<MessagesPage />} />
            </Route>

            {/* Espace administrateur */}
            <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/admin/tableau-de-bord" element={<AdminDashboard />} />
              <Route path="/admin/utilisateurs" element={<UserManagement />} />
              <Route path="/admin/produits" element={<AdminProducts />} />
              <Route path="/admin/commandes" element={<OrderManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/promotions" element={<PromotionManagement />} />
              <Route path="/admin/parametres" element={<AdminSettings />} />
            </Route>

            {/* Espace partenaire logistique */}
            <Route element={<ProtectedRoute roles={['partenaire_logistique']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/logistique/tableau-de-bord" element={<LogisticsDashboard />} />
              <Route path="/logistique/disponibles" element={<AvailableDeliveries />} />
              <Route path="/logistique/mes-livraisons" element={<MyDeliveries />} />
              <Route path="/logistique/historique" element={<DeliveryHistory />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<PublicLayout />}>
              <Route path="*" element={<div className="container" style={{ padding: 'var(--space-12)' }}><h1>Page introuvable</h1></div>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
