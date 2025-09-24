import axios from 'axios';

// Helper para gerenciar cookies
const setCookie = (name: string, value: string, days: number = 7) => {
	if (typeof window === 'undefined') return;

	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
	if (typeof window === 'undefined') return null;

	const nameEQ = `${name}=`;
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

const removeCookie = (name: string) => {
	if (typeof window === 'undefined') return;
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Helper para decodificar JWT
const decodeJWT = (token: string) => {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Erro ao decodificar JWT:', error);
		return null;
	}
};

// Configuração base do axios
const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('jwt_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Só redireciona para login se não estiver já na página de login
		// e se for um erro de autenticação (401)
		if (error.response?.status === 401 && typeof window !== 'undefined') {
			const currentPath = window.location.pathname;
			if (currentPath !== '/login' && currentPath !== '/auth-pages/login') {
				localStorage.removeItem('jwt_token');
				localStorage.removeItem('user_data');
				removeCookie('jwt_token');
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	},
);

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
		actions: {
			[key: string]: number;
		};
	};
}

export interface RequestPasswordResetCredentials {
	email: string;
}

export interface ConfirmPasswordResetCredentials {
	token: string;
}

export interface ConfirmPasswordResetBody {
	password: string;
	repeatPassword: string;
}

export interface UpdateProfileCredentials {
	name?: string;
	email?: string;
}

export interface ChangePasswordCredentials {
	currentPassword: string;
	newPassword: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

class AuthService {
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const response = await api.post<{ data: { accessToken: string; refreshToken: string } }>('/auth/signIn', credentials);

			// Extrair dados da resposta
			const { accessToken, refreshToken } = response.data.data;
			
			// Decodificar JWT para extrair informações do usuário
			const tokenPayload = decodeJWT(accessToken);
			
			// Criar objeto user a partir dos dados do token
			const user = {
				id: tokenPayload?.id || '',
				email: tokenPayload?.email || credentials.email,
				name: tokenPayload?.name || '',
				role: tokenPayload?.role || '',
				actions: tokenPayload?.actions || {}
			};

			// Salvar tokens no localStorage e cookies
			localStorage.setItem('jwt_token', accessToken);
			localStorage.setItem('refresh_token', refreshToken);
			setCookie('jwt_token', accessToken, 7); // 7 dias

			return {
				accessToken,
				refreshToken,
				user
			};
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Erro ao fazer login');
			}
			throw error;
		}
	}

	async requestPasswordReset(credentials: RequestPasswordResetCredentials): Promise<void> {
		try {
			await api.post('/auth/recovery', credentials);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(
					error.response?.data?.message || 'Erro ao solicitar recuperação de senha',
				);
			}
			throw error;
		}
	}

	async resetPassword(credentials: ConfirmPasswordResetCredentials, body: ConfirmPasswordResetBody): Promise<void> {
		try {
			await api.post('/auth/recoveryVerify/' + credentials.token, body);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(
					error.response?.data?.message || 'Erro ao redefinir senha',
				);
			}
			throw error;
		}
	}

	logout(): void {
		localStorage.removeItem('jwt_token');
		localStorage.removeItem('user_data');
		removeCookie('jwt_token');
	}

	getToken(): string | null {
		// Verifica se estamos no browser antes de acessar localStorage
		if (typeof window === 'undefined') {
			return null;
		}
		// Prioriza localStorage, mas também verifica cookies
		return localStorage.getItem('jwt_token') || getCookie('jwt_token');
	}

	isAuthenticated(): boolean {
		// Verifica se estamos no browser antes de acessar localStorage
		if (typeof window === 'undefined') {
			return false;
		}
		return !!this.getToken();
	}

	async getMe(): Promise<User> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<User>('/auth/me');
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(
					error.response?.data?.message || 'Erro ao buscar informações do usuário',
				);
			}
			throw error;
		}
	}

	isSuperAdmin(user?: User): boolean {
		return user?.role === 'superadmin';
	}

	async updateProfile(credentials: UpdateProfileCredentials): Promise<User> {
		try {
			const response = await api.patch<User>('/auth/profile', credentials);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
			}
			throw error;
		}
	}

	async changePassword(credentials: ChangePasswordCredentials): Promise<void> {
		try {
			await api.patch('/auth/password', credentials);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || 'Erro ao alterar senha');
			}
			throw error;
		}
	}
}

const authService = new AuthService();
export default authService;
