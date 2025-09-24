import { useState, useEffect } from 'react';
import authService, { User } from '../services/authService';

export const useUser = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

	const fetchUser = async () => {
		try {
			setLoading(true);
			setError(null);

			// Verifica se há um token primeiro
			if (!authService.isAuthenticated()) {
				setUser(null);
				setHasCheckedAuth(true);
				setLoading(false);
				return;
			}

			// Se há token, tenta buscar os dados do usuário
			const userData = await authService.getMe();
			setUser(userData);
			setHasCheckedAuth(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
			setUser(null);
			setHasCheckedAuth(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	const isAdmin = () => {
		return authService.isAdmin(user || undefined);
	};

	return {
		user,
		loading: loading || !hasCheckedAuth,
		error,
		isAdmin: isAdmin(),
		refetch: fetchUser,
	};
};
