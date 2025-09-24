import React, { createContext, FC, ReactNode, useEffect, useMemo, useState } from 'react';

export interface IUserData {
	id: string;
	email: string;
	name: string;
	role?: string;
	actions?: {
		[key: string]: number;
	};
}

export interface IAuthContextProps {
	user: IUserData | null;
	setUser?: (user: IUserData | null) => void;
	userData: IUserData | null;
	isLoading: boolean;
}
const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

interface IAuthContextProviderProps {
	children: ReactNode;
}
export const AuthContextProvider: FC<IAuthContextProviderProps> = ({ children }) => {
	const [user, setUser] = useState<IUserData | null>(null);
	const [userData, setUserData] = useState<IUserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// Carregar dados do usuário do localStorage na inicialização
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedUser = localStorage.getItem('user_data');
			if (savedUser) {
				try {
					const userData = JSON.parse(savedUser);
					setUser(userData);
					setUserData(userData);
					setIsLoading(false);
				} catch (error) {
					console.error('Erro ao carregar dados do usuário:', error);
					localStorage.removeItem('user_data');
					setIsLoading(false);
				}
			}
			setIsLoading(false);
		}
	}, []);

	// Salvar dados do usuário no localStorage quando mudar
	useEffect(() => {
		if (user) {
			localStorage.setItem('user_data', JSON.stringify(user));
		} else {
			localStorage.removeItem('user_data');
		}
	}, [user]);

	// Atualizar userData quando user mudar
	useEffect(() => {
		setUserData(user);
	}, [user]);

	const value = useMemo(
		() => ({
			user,
			setUser,
			userData,
			isLoading,
		}),
		[user, userData, isLoading],
	);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
