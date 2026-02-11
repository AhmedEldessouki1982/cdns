import type { UserType } from '@/types/UserType';
import React, { useContext, useReducer } from 'react';

interface AuthState {
  token: string;
  isPending: boolean;
  user: UserType;
}

type AuthAction =
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_IS_PENDING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserType };

interface AuthContextType {
  authState: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

export const authContext = React.createContext<AuthContextType | null>(null);

const initAuthState: AuthState = {
  token: '',
  isPending: false,
  user: {
    id: '',
    name: '',
    email: '',
    mobile: '',
  },
};

const reducer = (authState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_TOKEN':
      return { ...authState, token: action.payload };

    case 'SET_IS_PENDING':
      return { ...authState, isPending: action.payload };

    case 'SET_USER':
      return { ...authState, user: action.payload };
    default:
      return authState;
  }
};

export default function AuthContextProvider(props: {
  children: React.ReactNode;
}) {
  const [authState, dispatch] = useReducer(reducer, initAuthState);

  const contextValue: AuthContextType = {
    authState,
    dispatch,
  };
  return (
    <authContext.Provider value={contextValue}>
      {props.children}
    </authContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthContextProvider'
    );
  }
  return context;
};
