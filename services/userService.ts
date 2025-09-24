import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

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
	lastLogin: Dayjs | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserData {
	name: string;
	email: string;
	password: string;
}

export interface UpdateUserData {
	name: string;
	email: string;
	role: string;
	active: boolean;
}

class UserService {
	async getUsers(): Promise<User[]> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<User[]>('/users');

			// Converter as datas de string para Dayjs
			return response.data.map((user) => ({
				...user,
				lastLogin: user.lastLogin ? dayjs(user.lastLogin) : null,
			}));
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

	async createUser(userData: CreateUserData): Promise<User> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post<User>('/users', userData);
			return {
				...response.data,
				lastLogin: dayjs(response.data.lastLogin),
			};
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao criar usuário');
			}
			throw error;
		}
	}

	async updateUser(id: string, userData: UpdateUserData): Promise<User> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.patch<User>(`/users/${id}`, userData);
			return {
				...response.data,
				lastLogin: dayjs(response.data.lastLogin),
			};
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao atualizar usuário');
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

			const response = await api.get<User>(`/users/${id}`);
			return {
				...response.data,
				lastLogin: dayjs(response.data.lastLogin),
			};
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
}

const userService = new UserService();
export default userService;
