import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AgentListPage from './pages/AgentListPage.jsx';
import AgentFormPage from './pages/AgentFormPage.jsx';
import AgentDetailPage from './pages/AgentDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/', element: <AgentListPage /> },
      { path: '/agents/new', element: <AgentFormPage key="new" /> },
      { path: '/agents/:id', element: <AgentDetailPage /> },
      { path: '/agents/:id/edit', element: <AgentFormPage key="edit" /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);