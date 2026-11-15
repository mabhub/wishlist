import React from 'react';
import { Alert, Container, Typography } from '@mui/material';

/**
 * Error Boundary pour capturer les erreurs React et afficher un fallback UI.
 * Empêche le crash complet de l'application en cas d'erreur dans un composant enfant.
 *
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants à surveiller
 * @returns {JSX.Element} Children ou fallback UI en cas d'erreur
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log volontaire : seule trace d'une erreur React capturée, en attendant
    // un service de monitoring. Le retirer rendrait les crashes silencieux.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Container sx={{ py: 4 }}>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              Une erreur est survenue
            </Typography>
            <Typography variant="body2">{error?.message || 'Erreur inconnue'}</Typography>
          </Alert>
        </Container>
      );
    }

    return children;
  }
}

ErrorBoundary.displayName = 'ErrorBoundary';

export default ErrorBoundary;
