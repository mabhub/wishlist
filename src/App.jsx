import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router';

import Home from './components/Home';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Composant racine de l'application.
 * Gère le routing principal avec React Router.
 *
 * @returns {JSX.Element} Application avec routing
 */
const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list/:listId" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);

App.displayName = 'App';

export default App;
