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
    // Log l'erreur pour debugging (peut être envoyé à un service de monitoring)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ py: 4 }}>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              Une erreur est survenue
            </Typography>
            <Typography variant="body2">
              {this.state.error?.message || 'Erreur inconnue'}
            </Typography>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.displayName = 'ErrorBoundary';

export default ErrorBoundary;
