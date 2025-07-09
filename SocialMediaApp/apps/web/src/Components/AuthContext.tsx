import React, { createContext } from 'react';

interface IUser {
  _id: string;
  // add other user properties as needed
}

interface IAuthContext {
  user: IUser | null;
  // add other auth context properties as needed
}

export const AuthContext = createContext<IAuthContext>({
  user: null,
});