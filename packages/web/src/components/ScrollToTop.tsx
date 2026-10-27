import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top on route change.
 *
 * React Router does not reset scroll position on navigation by default,
 * so clicking a link while scrolled down leaves the new page at the old
 * scroll offset. This component fixes that.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
