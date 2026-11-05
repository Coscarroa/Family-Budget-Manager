import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StorageService } from './services/storage';

// Automatically request persistent storage to safeguard local data when app is installed
if (typeof window !== 'undefined') {
  StorageService.requestPersistentStorage().then((isPersisted) => {
    if (isPersisted) {
      console.log('Family Budget: Persistent storage successfully enabled on device.');
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);

