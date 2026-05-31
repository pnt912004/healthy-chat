import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <ChatWidget />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
