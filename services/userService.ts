import axios from 'axios';

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
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	},
);

export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	paused_at: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	// Campos adicionais que podem vir do backend
	description_plan?: string;
	due_date?: string;
	Domains?: Array<{
		id: number;
		domain: string;
	}>;
	Websites?: Array<{
		id: string;
		clone_url: string;
		title: string;
	}>;
	usageDuration?: {
		days: number | null;
		isPaused: boolean;
	};
	logs?: Array<{
		type: string;
		function_name: string;
		created_at: string;
	}>;
}

export interface PaginatedUsers {
	data: User[];
	meta: {
		current_page: number;
		per_page: number;
		total: number;
		last_page: number;
	};
}


export interface UseUsersFilters {
	page?: number;
	per_page?: number;
	name?: string;
	email?: string;
	role?: string;
	status?: string;
}

class UserService {
	async getUsers(filters: UseUsersFilters = {}): Promise<PaginatedUsers> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const { page = 1, per_page = 10, name = '', email = '', role = '', status = '' } = filters;

			const searchParams = new URLSearchParams({
				page: page.toString(),
				per_page: per_page.toString(),
				name,
				email,
				role,
				status,
			}).toString();

			const response = await api.get<PaginatedUsers>(`/users/list?${searchParams}`);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao buscar usuários');
			}
			throw error;
		}
	}


	async getUserById(id: string): Promise<User> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<{ data: User }>(`/users/list/${id}`);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao buscar usuário');
			}
			throw error;
		}
	}

	async deleteUser(id: string): Promise<void> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			await api.delete(`/users/${id}`);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao deletar usuário');
			}
			throw error;
		}
	}

	async pauseUser(id: string): Promise<User> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.patch<{ data: User }>(`/users/pause/${id}`);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao pausar usuário');
			}
			throw error;
		}
	}

	async activateUser(id: string): Promise<User> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.patch<{ data: User }>(`/users/active/${id}`);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao ativar usuário');
			}
			throw error;
		}
	}

}

const userService = new UserService();
export default userService;
