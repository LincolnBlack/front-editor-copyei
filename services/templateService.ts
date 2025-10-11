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

export interface UserTemplate {
	id: number;
	title: string;
	object_folder: string;
	status: string;
	type: string;
	created_at: string;
	visibility: boolean;
	type_creation: string;
	cloudfront_distribution_id: string;
	cloudfront_distribution_domain: string;
	user_id: string;
}

// Interface para o formato de resposta do backend
interface BackendResponse {
	data: UserTemplate[];
}

export interface CreateTemplateData {
	title: string;
	type: string;
	visibility: boolean;
}

export interface UpdateTemplateData {
	title: string;
	type: string;
	visibility: boolean;
	status: string;
}

export interface PresignedUrlResponse {
	data: {
		presignUrl: string;
	};
}

export interface DeployTemplateData {
	title: string;
	subdomain: string;
	ownDomain: boolean;
	domainId2: number | null;
}

export interface CloneTemplateData {
	title: string;
	url: string;
}

export interface GenerateTemplateData {
	title: string;
	prompt: string;
}

export interface UploadTemplateData {
	title: string;
	htmlFile: File;
	subdomain: string;
	ownDomain: boolean;
	typeCreation: string;
}

class TemplateService {
	async getTemplates(): Promise<UserTemplate[]> {
		try {
			// Verificar se o usuário está autenticado
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<BackendResponse>('/templates/user');
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao buscar templates');
			}
			throw error;
		}
	}

	async getTemplateById(id: string): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.get<{ data: UserTemplate }>(`/templates/${id}`);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao buscar template');
			}
			throw error;
		}
	}

	async deleteTemplate(id: string): Promise<void> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			await api.delete(`/templates/${id}`);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao deletar template');
			}
			throw error;
		}
	}

	async createTemplate(templateData: CreateTemplateData): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post<{ data: UserTemplate }>(
				'/templates/user',
				templateData,
			);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao criar template');
			}
			throw error;
		}
	}

	async updateTemplate(id: string, templateData: UpdateTemplateData): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.put<{ data: UserTemplate }>(
				`/templates/user/${id}`,
				templateData,
			);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao atualizar template');
			}
			throw error;
		}
	}

	async toggleTemplateVisibility(id: string): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.patch<{ data: UserTemplate }>(
				`/templates/user/${id}/visibility`,
			);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(
					error.response?.data?.message || 'Erro ao alterar visibilidade do template',
				);
			}
			throw error;
		}
	}

	async getPresignedUrl(templateId: string): Promise<string> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post<PresignedUrlResponse>(
				`/templates/${templateId}/presign-urls`,
				{
					filePath: 'index.html',
					type: 'get',
				},
			);
			return response.data.data.presignUrl;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(
					error.response?.data?.message || 'Erro ao obter link de visualização',
				);
			}
			throw error;
		}
	}

	async deployTemplate(templateId: string, deployData: DeployTemplateData): Promise<any> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post(`/templates/${templateId}/deploy`, deployData);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao publicar template');
			}
			throw error;
		}
	}

	async cloneTemplate(cloneData: CloneTemplateData): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post<{ data: UserTemplate }>('/templates/clone', cloneData);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao clonar template');
			}
			throw error;
		}
	}

	async generateTemplate(generateData: GenerateTemplateData): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			const response = await api.post<{
				data: {
					message: string;
					template: UserTemplate;
				};
			}>('/templates/generate', generateData);
			return response.data.data.template;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(error.response?.data?.message || 'Erro ao gerar template');
			}
			throw error;
		}
	}

	async uploadTemplate(uploadData: UploadTemplateData): Promise<UserTemplate> {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) {
				throw new Error('Usuário não autenticado');
			}

			// Criar FormData para enviar arquivo
			const formData = new FormData();
			formData.append('htmlFile', uploadData.htmlFile);
			formData.append('title', uploadData.title);
			formData.append('subdomain', uploadData.subdomain);
			formData.append('ownDomain', uploadData.ownDomain.toString());
			formData.append('typeCreation', uploadData.typeCreation);

			// Fazer requisição com FormData
			const response = await api.post<{ data: UserTemplate }>(
				'/templates/upload-html',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				},
			);

			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Token inválido ou expirado');
				}
				throw new Error(
					error.response?.data?.message || 'Erro ao fazer upload do template',
				);
			}
			throw error;
		}
	}
}

const templateService = new TemplateService();
export default templateService;
