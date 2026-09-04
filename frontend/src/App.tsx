import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import FloatingCopilot from './components/FloatingCopilot';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import ClaimsPage from './pages/ClaimsPage';
import AnomaliesPage from './pages/AnomaliesPage';
import PriorityPage from './pages/PriorityPage';
import EarlyWarningPage from './pages/EarlyWarningPage';
import SimulatorPage from './pages/SimulatorPage';
import CopilotPage from './pages/CopilotPage';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } }
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <WelcomePage />
            </motion.div>
          }
        />
        <Route
          path="/welcome"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <WelcomePage />
            </motion.div>
          }
        />
        <Route
          path="/overview"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/dashboard"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/claims"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ClaimsPage />
            </motion.div>
          }
        />
        <Route
          path="/anomalies"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AnomaliesPage />
            </motion.div>
          }
        />
        <Route
          path="/priority"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PriorityPage />
            </motion.div>
          }
        />
        <Route
          path="/early-warning"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <EarlyWarningPage />
            </motion.div>
          }
        />
        <Route
          path="/simulator"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <SimulatorPage />
            </motion.div>
          }
        />
        <Route
          path="/copilot"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <CopilotPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
        <Footer onOpenAbout={() => setIsAboutOpen(true)} />
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        <FloatingCopilot />
      </div>
    </BrowserRouter>
  );
}

export default App;
