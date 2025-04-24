import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type AuthContextType = {
  loggedIn: boolean;
  data: any;
};

const AuthContext = createContext({
  loggedIn: false,
  data: {},
  loading: true,
  setLoggedIn: (value: boolean) => {},
  setData: (value: any) => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await AsyncStorage.getItem('userData');
        console.log('Stored user:',user);
        setData(user);
        setLoggedIn(!!user);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false); // <--- important
      }
    };

    checkLogin();
  }, [data]);

  return (
    <AuthContext.Provider value={{ loggedIn, data, setLoggedIn, setData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
