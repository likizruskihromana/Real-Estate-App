import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute as Protected } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';

const PropertyDetailPage=lazy(()=>import('./pages/PropertyDetailPage').then(m=>({default:m.PropertyDetailPage})));
const LoginPage=lazy(()=>import('./pages/AuthPages').then(m=>({default:m.LoginPage})));
const RegisterPage=lazy(()=>import('./pages/AuthPages').then(m=>({default:m.RegisterPage})));
const ListingEditorPage=lazy(()=>import('./pages/ListingEditorPage').then(m=>({default:m.ListingEditorPage})));
const ComparePage=lazy(()=>import('./pages/ComparePage').then(m=>({default:m.ComparePage})));
const CategoryLandingPage=lazy(()=>import('./pages/SeoPages').then(m=>({default:m.CategoryLandingPage}))),GuidePage=lazy(()=>import('./pages/SeoPages').then(m=>({default:m.GuidePage})));
const workspace=(name:keyof typeof import('./pages/WorkspacePages'))=>lazy(()=>import('./pages/WorkspacePages').then(m=>({default:m[name] as ComponentType<any>})));
const admin=(name:keyof typeof import('./pages/AdminPages'))=>lazy(()=>import('./pages/AdminPages').then(m=>({default:m[name] as ComponentType<any>})));
const AgenciesPage=workspace('AgenciesPage'),AgencyPage=workspace('AgencyPage'),AppointmentsPage=workspace('AppointmentsPage'),ConversationPage=workspace('ConversationPage'),InboxPage=workspace('InboxPage'),MyListingsPage=workspace('MyListingsPage'),NotificationsPage=workspace('NotificationsPage'),OffersPage=workspace('OffersPage'),OrganizationPage=workspace('OrganizationPage'),ProfilePage=workspace('ProfilePage'),SavedPage=workspace('SavedPage');
const ActivityPage=admin('ActivityPage'),AdminDashboard=admin('AdminDashboard'),AnalyticsPage=admin('AnalyticsPage'),ModerationPage=admin('ModerationPage'),UserDetailPage=admin('UserDetailPage'),UsersPage=admin('UsersPage');

export function App(){return <AuthProvider><Suspense fallback={<div className="container page"><div className="skeleton detail-skeleton"/></div>}><Routes><Route element={<Layout/>}>
 <Route index element={<HomePage/>}/><Route path="nekretnine" element={<ListingsPage/>}/><Route path="nekretnine/grad/:grad" element={<CategoryLandingPage kind="grad"/>}/><Route path="nekretnine/tip/:tip" element={<CategoryLandingPage kind="tip"/>}/><Route path="nekretnine/:slug" element={<PropertyDetailPage/>}/><Route path="vodici/:slug" element={<GuidePage/>}/><Route path="uporedi" element={<ComparePage/>}/><Route path="prijava" element={<LoginPage/>}/><Route path="registracija" element={<RegisterPage/>}/><Route path="agencije" element={<AgenciesPage/>}/><Route path="agencije/:slug" element={<AgencyPage/>}/>
 <Route path="sacuvano" element={<Protected><SavedPage/></Protected>}/><Route path="inbox" element={<Protected><InboxPage/></Protected>}/><Route path="inbox/:id" element={<Protected><ConversationPage/></Protected>}/><Route path="termini" element={<Protected><AppointmentsPage/></Protected>}/><Route path="ponude" element={<Protected><OffersPage/></Protected>}/><Route path="moji-oglasi" element={<Protected><MyListingsPage/></Protected>}/><Route path="moji-oglasi/novi" element={<Protected><ListingEditorPage/></Protected>}/><Route path="moji-oglasi/:id/uredi" element={<Protected><ListingEditorPage/></Protected>}/><Route path="profil" element={<Protected><ProfilePage/></Protected>}/><Route path="organizacija" element={<Protected><OrganizationPage/></Protected>}/><Route path="obavijesti" element={<Protected><NotificationsPage/></Protected>}/>
 <Route path="admin" element={<Protected admin><AdminDashboard/></Protected>}/><Route path="admin/analitika" element={<Protected admin><AnalyticsPage/></Protected>}/><Route path="admin/korisnici" element={<Protected admin><UsersPage/></Protected>}/><Route path="admin/korisnici/:id" element={<Protected admin><UserDetailPage/></Protected>}/><Route path="admin/oglasi" element={<Protected admin><ModerationPage kind="nekretnine"/></Protected>}/><Route path="admin/agencije" element={<Protected admin><ModerationPage kind="organizacije"/></Protected>}/><Route path="admin/moderacija" element={<Protected admin><ModerationPage/></Protected>}/><Route path="admin/aktivnosti" element={<Protected admin><ActivityPage/></Protected>}/>
 <Route path="*" element={<Navigate to="/" replace/>}/>
</Route></Routes></Suspense></AuthProvider>}
