import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import NotFound from './components/NotFound';
import FullScreenLoader from './components/FullScreenLoader';

const ChatApp = lazy(() => import('./components/ChatApp'));
const HowItWorksPage = lazy(() => import('./components/HowItWorksPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./components/TermsOfUsePage'));
const LegalNoticePage = lazy(() => import('./components/LegalNoticePage'));

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onGetStarted={() => navigate('/chat')}
                onShowHow={() => navigate('/how-it-works')}
                onShowAbout={() => navigate('/about')}
                onShowExample={() => navigate('/chat?example=sample')}
              />
            }
          />
          <Route path="/chat" element={<ChatApp onBack={() => navigate('/')} />} />
          <Route path="/how-it-works" element={<HowItWorksPage onBack={() => navigate('/')} />} />
          <Route path="/about" element={<AboutPage onBack={() => navigate('/')} />} />
          <Route path="/privacy" element={<PrivacyPolicyPage onBack={() => navigate('/')} />} />
          <Route path="/terms" element={<TermsOfUsePage onBack={() => navigate('/')} />} />
          <Route path="/legal" element={<LegalNoticePage onBack={() => navigate('/')} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return <AppRoutes />;
}

