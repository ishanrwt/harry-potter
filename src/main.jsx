import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { LumaSpin } from './components/ui/LumaSpin'
import { PageTransitionProvider } from './components/PageTransition'
import CustomCursor from './components/CustomCursor'

import Story from './Story.jsx'

const App = lazy(() => import('./App.jsx'))
const Character = lazy(() => import('./Character.jsx'))
const Book = lazy(() => import('./Book.jsx'))

const Loader = () => (
  <div className="w-full h-screen bg-black flex items-center justify-center">
    <LumaSpin />
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function AppRoutes() {
  return (
    <PageTransitionProvider>
      <CustomCursor />
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/story" element={<Story />} />
          <Route path="/character" element={<Character />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </Suspense>
    </PageTransitionProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
