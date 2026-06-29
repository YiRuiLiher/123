/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { VideoDetail } from './pages/VideoDetail';
import { SpeedTest } from './pages/SpeedTest';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SpeedTest />} />
          <Route element={<Layout />}>
            <Route path="videos" element={<Home />} />
            <Route path="videos/:categoryId" element={<Home />} />
            <Route path="video/:id" element={<VideoDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

