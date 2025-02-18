// pages/_app.js
import '../styles/globals.css'; // Import global styles (Tailwind CSS)
import { AuthProvider } from '../utils/auth'; // Custom context provider

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
