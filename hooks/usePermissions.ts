import { useUser } from './useUser';
import authService from '../services/authService';

export const usePermissions = () => {
	const { user, loading } = useUser();

	const hasPermission = (permission: string): boolean => {
		if (!user || loading) {
			return false;
		}
		return authService.hasPermission(permission, user);
	};

	const hasAnyPermission = (permissions: string[]): boolean => {
		if (!user || loading) {
			return false;
		}
		return permissions.some((permission) => authService.hasPermission(permission, user));
	};

	const hasAllPermissions = (permissions: string[]): boolean => {
		if (!user || loading) {
			return false;
		}
		return permissions.every((permission) => authService.hasPermission(permission, user));
	};

	return {
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		loading,
		user,
	};
};
