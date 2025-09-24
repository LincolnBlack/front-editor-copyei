import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from './useUser';

export const useAdminAuth = () => {
	const { user, loading, isSuperAdmin } = useUser();
	const router = useRouter();

	useEffect(() => {
		// Só redireciona quando não está mais carregando
		if (!loading) {
			// Se não está autenticado, redireciona para login
			if (!user) {
				router.push('/login');
				return;
			}

			// Se não é superadmin, redireciona para a página inicial com mensagem de erro
			if (!isSuperAdmin) {
				router.push('/?error=unauthorized');
				return;
			}
		}
	}, [user, loading, isSuperAdmin, router]);

	return {
		user,
		loading,
		isSuperAdmin,
		isAuthorized: !loading && !!user && isSuperAdmin,
	};
};
