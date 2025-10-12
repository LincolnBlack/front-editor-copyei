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

export interface Domain {
	id: number;
	domain: string;
	user_id: string;
	certificate_arn: string | null;
	cname_name: string | null;
	cname_value: string | null;
	record_type: string | null;
	status: string | null;
}

// Interface para o formato de resposta do backend
interface BackendResponse {
	data: Domain[];
}

class DomainService {
	async getDomains(): Promise<Domain[]> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<BackendResponse>('/domains');
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao buscar domínios');
			}
			throw error;
		}
	}

	// Método para filtrar domínios disponíveis para publicação
	getAvailableDomains(domains: Domain[]): Domain[] {
		return domains.filter(
			(domain) => domain.domain !== 'copy-ei.com' && domain.status === 'ISSUED',
		);
	}

	// Método para sincronizar domínio
	async syncDomain(domainId: number): Promise<void> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			await api.post(`/domains/${domainId}/sync`);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao sincronizar domínio');
			}
			throw error;
		}
	}

	// Método para criar domínio
	async createDomain(domainName: string): Promise<Domain> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post<{ data: Domain }>('/domains', {
				domain: domainName,
			});
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao criar domínio');
			}
			throw error;
		}
	}

	// Método para deletar domínio
	async deleteDomain(domainId: number): Promise<void> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			await api.delete(`/domains/${domainId}`);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao deletar domínio');
			}
			throw error;
		}
	}
}

const domainService = new DomainService();
export default domainService;
