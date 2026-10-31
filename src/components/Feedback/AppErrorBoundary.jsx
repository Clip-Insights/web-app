import { Component } from 'react';
import PropTypes from 'prop-types';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import RecoveryScreen from './RecoveryScreen';

export default class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('Application error:', error, info.componentStack); }
  render() {
    return this.state.failed ? <RecoveryScreen title="Something interrupted your workspace." description="We couldn’t display this page. Try loading it again, or return to sign in." retry={() => window.location.reload()} /> : this.props.children;
  }
}
AppErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

export function RouteErrorScreen() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return <RecoveryScreen title={missing ? 'This page couldn’t be found.' : 'Something interrupted this page.'} description={missing ? 'The link may be incomplete, or the page may have moved.' : 'Try loading the page again. If the problem continues, contact us and we’ll help.'} retry={missing ? undefined : () => window.location.reload()} />;
}
