import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TableComponent from './components/Table/Table';
import ChartComponent from './components/Chart/Chart';
import { Layout } from './layout/Layout';
import LoginForm from './components/login/loginForm';
import AuthContextProvider from './context/authContext';
import RegisterForm from './components/register/registerForm';
import ProtectedRoute from './api/ProtectedRoute';
import UserProfile from './components/profile/UserProfile';
import { useQuery } from '@tanstack/react-query';
import { createTODQueryOptions } from '@/queryOptions/createTODQueryOptions';
import { useState } from 'react';
import AiAnalyzer from './components/ai/aiAnalyzer';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('1');
  const { data: cdns, isPending } = useQuery(
    createTODQueryOptions({ page: currentPage })
  );

  const todData = cdns ?? { todCount: 0, openTod: 0, data: [] };

  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/*"
            element={
              <div className="w-screen">
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/chart" replace />}
                      />
                      <Route
                        path="/table"
                        element={
                          <TableComponent
                            todCount={todData.todCount}
                            data={todData.data}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            isPending={isPending}
                            description={'List of CDNs and punchs'}
                            openTod={todData.openTod}
                          />
                        }
                      />
                      <Route
                        path="/chart"
                        element={
                          <ChartComponent
                            todCount={todData.todCount}
                            openTod={todData.openTod}
                          />
                        }
                      />
                      <Route path="/ai" element={<AiAnalyzer />} />
                      <Route path="/profile" element={<UserProfile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              </div>
            }
          />
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
