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

export interface WebsiteDomain {
	id: number;
	domain: string;
	status: string | null;
}

export interface WebsiteTemplate {
	id: number;
	clone_url: string;
	domain_id: number;
	subdomain: string;
	status: string;
	type_creation: string;
	cloudfront_distribution_domain: string;
	cloudfront_distribution_id: string;
	Domain: WebsiteDomain;
	created_at: string;
}

// Interface para o formato de resposta do backend
interface BackendResponse {
	data: {
		sites: WebsiteTemplate[];
	};
}

class WebsiteService {
	async getWebsites(): Promise<WebsiteTemplate[]> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<BackendResponse>('/websites');
			return response.data.data.sites;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao buscar websites');
			}
			throw error;
		}
	}

	async deleteWebsite(websiteId: string): Promise<void> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			await api.delete(`/websites/${websiteId}`);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				if (error.response?.status === 404) {
					throw new Error('Website não encontrado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao deletar website');
			}
			throw error;
		}
	}
}

const websiteService = new WebsiteService();
export default websiteService;
