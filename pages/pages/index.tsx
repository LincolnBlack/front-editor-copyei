import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDarkMode from '../../hooks/useDarkMode';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Icon from '../../components/icon/Icon';
import Button from '../../components/bootstrap/Button';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../components/bootstrap/Modal';
import Input from '../../components/bootstrap/forms/Input';
import Select from '../../components/bootstrap/forms/Select';
import Option from '../../components/bootstrap/Option';
import { getFirstLetter } from '../../helpers/helpers';
import Badge from '../../components/bootstrap/Badge';
import PaginationButtons, { PER_COUNT } from '../../components/PaginationButtons';
import templateService, { UserTemplate, DeployTemplateData } from '../../services/templateService';
import domainService, { Domain } from '../../services/domainService';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import NewPageModal from '../../components/NewPageModal';
import ClonePageModal from '../../components/ClonePageModal';
import AIGenerateModal from '../../components/AIGenerateModal';
import UploadHtmlModal from '../../components/UploadHtmlModal';
import TemplateModal from '../../components/TemplateModal';
import BlankPageModal from '../../components/BlankPageModal';

const Pages: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();

	const [data, setData] = useState<UserTemplate[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [templateToDelete, setTemplateToDelete] = useState<UserTemplate | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
	const [newPageModalStatus, setNewPageModalStatus] = useState<boolean>(false);
	const [cloneModalStatus, setCloneModalStatus] = useState<boolean>(false);
	const [aiGenerateModalStatus, setAiGenerateModalStatus] = useState<boolean>(false);
	const [uploadHtmlModalStatus, setUploadHtmlModalStatus] = useState<boolean>(false);
	const [templateModalStatus, setTemplateModalStatus] = useState<boolean>(false);
	const [blankPageModalStatus, setBlankPageModalStatus] = useState<boolean>(false);

	// Estados para modal de publicação
	const [publishModalStatus, setPublishModalStatus] = useState<boolean>(false);
	const [templateToPublish, setTemplateToPublish] = useState<UserTemplate | null>(null);
	const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
	const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
	const [subdomain, setSubdomain] = useState<string>('');
	const [publishLoading, setPublishLoading] = useState<boolean>(false);
	const [domainsLoading, setDomainsLoading] = useState<boolean>(false);

	// Estados para paginação
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);

	// Estados para filtros
	const [nameFilter, setNameFilter] = useState<string>('');
	const [typeFilter, setTypeFilter] = useState<string>('');
	const [startDateFilter, setStartDateFilter] = useState<string>('');
	const [endDateFilter, setEndDateFilter] = useState<string>('');
	const [filtersModalStatus, setFiltersModalStatus] = useState<boolean>(false);

	const fetchTemplates = useCallback(async () => {
		try {
			setLoading(true);

			const templates = await templateService.getTemplates();
			setData(templates);
		} catch (error) {
			console.error('Erro ao buscar templates:', error);
			// Se for erro de autenticação, o interceptor já redireciona
			// Para outros erros, podemos mostrar uma mensagem
			if (error instanceof Error && !error.message.includes('Token')) {
				// Aqui você pode adicionar uma notificação de erro se desejar
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	// Resetar página quando filtros mudarem
	useEffect(() => {
		setCurrentPage(1);
	}, [nameFilter, typeFilter, startDateFilter, endDateFilter]);

	const handleOpenDeleteModal = (template: UserTemplate) => {
		setTemplateToDelete(template);
		setDeleteModalStatus(true);
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalStatus(false);
		setTemplateToDelete(null);
		setDeleteLoading(false);
	};

	const handleOpenNewPageModal = () => {
		setNewPageModalStatus(true);
	};

	const handleCloseNewPageModal = () => {
		setNewPageModalStatus(false);
	};

	const handleOpenCloneModal = () => {
		setCloneModalStatus(true);
		setNewPageModalStatus(false);
	};

	const handleCloseCloneModal = () => {
		setCloneModalStatus(false);
	};

	const handleOpenAiGenerateModal = () => {
		setAiGenerateModalStatus(true);
		setNewPageModalStatus(false);
	};

	const handleCloseAiGenerateModal = () => {
		setAiGenerateModalStatus(false);
	};

	const handleOpenUploadHtmlModal = () => {
		setUploadHtmlModalStatus(true);
		setNewPageModalStatus(false);
	};

	const handleCloseUploadHtmlModal = () => {
		setUploadHtmlModalStatus(false);
	};

	const handleOpenTemplateModal = () => {
		setTemplateModalStatus(true);
		setNewPageModalStatus(false);
	};

	const handleCloseTemplateModal = () => {
		setTemplateModalStatus(false);
	};

	const handleOpenBlankPageModal = () => {
		setBlankPageModalStatus(true);
		setNewPageModalStatus(false);
	};

	const handleCloseBlankPageModal = () => {
		setBlankPageModalStatus(false);
	};

	const handleCreateBlankPage = async (pageName: string) => {
		try {
			// HTML da página em branco
			const blankPageHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página em branco</title>
</head>
<body>
    <h1>Página em branco</h1>
</body>
</html>`;

			// 1. Criar o template no backend
			const templateData = {
				title: pageName,
				visibility: false,
				typeCreation: 'DRAG_AND_DROP',
				type: 'DRAG_AND_DROP',
				objectFolder: 'templates',
			};

			const createdTemplate = await templateService.createFromTemplate(templateData);

			// 2. Obter URL pré-assinada para upload
			const presignedUrl = await templateService.getPresignedUrlForUpload(
				createdTemplate.id.toString(),
			);

			// 3. Fazer upload do HTML para S3
			await templateService.uploadHtmlToS3(presignedUrl, blankPageHtml);

			// 4. Recarregar a lista de templates
			await fetchTemplates();

			// 5. Fechar modal e mostrar sucesso
			setBlankPageModalStatus(false);
			alert('Página em branco criada com sucesso!');
		} catch (error) {
			console.error('Erro ao criar página em branco:', error);
			alert('Erro ao criar página. Tente novamente.');
		}
	};

	const handleSelectTemplate = async (template: any, pageName: string) => {
		try {
			// 1. Criar o template no backend
			const templateData = {
				title: pageName,
				visibility: false,
				typeCreation: 'DRAG_AND_DROP',
				type: 'DRAG_AND_DROP',
				objectFolder: 'templates',
			};

			const createdTemplate = await templateService.createFromTemplate(templateData);

			// 2. Obter URL pré-assinada para upload
			const presignedUrl = await templateService.getPresignedUrlForUpload(
				createdTemplate.id.toString(),
			);

			// 3. Fazer upload do HTML para S3
			await templateService.uploadHtmlToS3(presignedUrl, template.html);

			// 4. Recarregar a lista de templates
			await fetchTemplates();

			// 5. Fechar modal e mostrar sucesso
			setTemplateModalStatus(false);
			alert('Página criada com sucesso!');
		} catch (error) {
			console.error('Erro ao criar página a partir de template:', error);
			alert('Erro ao criar página. Tente novamente.');
		}
	};

	const handleSelectNewPageOption = (optionId: string) => {
		switch (optionId) {
			case 'copy':
				handleOpenCloneModal();
				break;
			case 'ai-generate':
				handleOpenAiGenerateModal();
				break;
			case 'template':
				handleOpenTemplateModal();
				break;
			case 'import-html':
				handleOpenUploadHtmlModal();
				break;
			case 'blank':
				handleOpenBlankPageModal();
				break;
			default:
				setNewPageModalStatus(false);
		}
	};

	const handleDeleteTemplate = async () => {
		if (!templateToDelete) return;

		try {
			setDeleteLoading(true);
			await templateService.deleteTemplate(templateToDelete.id.toString());
			handleCloseDeleteModal();
			fetchTemplates(); // Recarregar a lista após deletar
		} catch (error) {
			console.error('Erro ao deletar template:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleVisualize = async (template: UserTemplate) => {
		try {
			// Obter o link pré-assinado para visualização
			const presignedUrl = await templateService.getPresignedUrl(template.id.toString());

			// Abrir a página em uma nova aba
			window.open(presignedUrl, '_blank');
		} catch (error) {
			console.error('Erro ao visualizar template:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
			alert('Erro ao abrir visualização da página. Tente novamente.');
		}
	};

	const handlePublish = async (template: UserTemplate) => {
		setTemplateToPublish(template);
		setPublishModalStatus(true);
		setDomainsLoading(true);
		try {
			// Buscar domínios disponíveis
			const domainsData = await domainService.getDomains();

			// Filtrar domínios disponíveis
			const available = domainService.getAvailableDomains(domainsData);
			setAvailableDomains(available);

			// Se não há domínios disponíveis, não mostrar seleção
			if (available.length === 0) {
				setSelectedDomain(null);
			}
		} catch (error) {
			console.error('Erro ao buscar domínios:', error);
			alert('Erro ao carregar domínios. Tente novamente.');
		} finally {
			setDomainsLoading(false);
		}
	};

	const handleClosePublishModal = () => {
		setPublishModalStatus(false);
		setTemplateToPublish(null);
		setSelectedDomain(null);
		setSubdomain('');
		setPublishLoading(false);
		setDomainsLoading(false);
	};

	const handlePublishTemplate = async () => {
		if (!templateToPublish || !subdomain.trim()) {
			alert('Por favor, preencha o subdomínio.');
			return;
		}

		try {
			setPublishLoading(true);

			// Gerar título a partir do subdomínio
			const title = subdomain.trim().replace(/\s+/g, '-');

			// Preparar dados para deploy
			const deployData: DeployTemplateData = {
				title,
				subdomain: subdomain.trim(),
				ownDomain: selectedDomain !== null,
				domainId2: selectedDomain ? selectedDomain.id : null,
			};

			// Fazer deploy
			await templateService.deployTemplate(templateToPublish.id.toString(), deployData);

			alert('Template publicado com sucesso!');
			handleClosePublishModal();
		} catch (error) {
			console.error('Erro ao publicar template:', error);
			alert('Erro ao publicar template. Tente novamente.');
		} finally {
			setPublishLoading(false);
		}
	};

	const handleEdit = (template: UserTemplate) => {
		// TODO: Implementar navegação para edição
		if (!process.env.NEXT_PUBLIC_EDITOR_URL) {
			alert('URL do editor não configurada');
			return;
		}
		location.href = `${process.env.NEXT_PUBLIC_EDITOR_URL}/${template.id}`;
	};

	// Funções para gerenciar filtros
	const handleOpenFiltersModal = () => {
		setFiltersModalStatus(true);
	};

	const handleCloseFiltersModal = () => {
		setFiltersModalStatus(false);
	};

	const handleClearFilters = () => {
		setNameFilter('');
		setTypeFilter('');
		setStartDateFilter('');
		setEndDateFilter('');
		setCurrentPage(1);
	};

	// Verificar se há filtros ativos
	const hasActiveFilters = nameFilter || typeFilter || startDateFilter || endDateFilter;

	// Lógica de filtros e ordenação
	const filteredAndSortedData = useMemo(() => {
		let filtered = [...data];

		// Filtrar por nome
		if (nameFilter) {
			filtered = filtered.filter((template) =>
				template.title.toLowerCase().includes(nameFilter.toLowerCase()),
			);
		}

		// Filtrar por tipo
		if (typeFilter) {
			filtered = filtered.filter((template) => template.type_creation === typeFilter);
		}

		// Filtrar por data
		if (startDateFilter) {
			const startDate = new Date(startDateFilter);
			filtered = filtered.filter((template) => {
				const templateDate = new Date(template.created_at);
				return templateDate >= startDate;
			});
		}

		if (endDateFilter) {
			const endDate = new Date(endDateFilter);
			endDate.setHours(23, 59, 59, 999); // Incluir todo o dia
			filtered = filtered.filter((template) => {
				const templateDate = new Date(template.created_at);
				return templateDate <= endDate;
			});
		}

		// Ordenar por data de criação (mais recente primeiro)
		filtered.sort((a, b) => {
			const dateA = new Date(a.created_at);
			const dateB = new Date(b.created_at);
			return dateB.getTime() - dateA.getTime();
		});

		return filtered;
	}, [data, nameFilter, typeFilter, startDateFilter, endDateFilter]);

	// Calcular dados paginados
	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * perPage;
		const endIndex = startIndex + perPage;
		return filteredAndSortedData.slice(startIndex, endIndex);
	}, [filteredAndSortedData, currentPage, perPage]);

	// Calcular total de páginas
	const totalPages = Math.ceil(filteredAndSortedData.length / perPage);

	// Se está carregando a autenticação, mostra loading
	if (authLoading) {
		return (
			<div
				className='d-flex justify-content-center align-items-center'
				style={{ height: '100vh' }}>
				<div className='spinner-border text-primary' role='status'>
					<span className='visually-hidden'>Verificando permissões...</span>
				</div>
			</div>
		);
	}

	// Se não está autorizado, não renderiza nada (já redirecionou)
	if (!isAuthorized) {
		return null;
	}

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<Input
						type='text'
						placeholder='Buscar por nome...'
						value={nameFilter}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setNameFilter(e.target.value)
						}
						style={{ minWidth: '300px', maxWidth: '500px' }}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					{hasActiveFilters && (
						<Button
							icon='Clear'
							color='warning'
							className='me-2'
							style={{
								backgroundColor: '#ffc107',
								color: '#000000',
								border: '1px solid #ffc107',
							}}
							onClick={handleClearFilters}>
							Limpar filtros
						</Button>
					)}
					<Button
						icon='FilterList'
						color={filtersModalStatus ? 'primary' : 'info'}
						isLight={!filtersModalStatus}
						className='me-2'
						onClick={
							filtersModalStatus ? handleCloseFiltersModal : handleOpenFiltersModal
						}>
						Filtros
					</Button>
					<Button icon='Add' color='primary' isLight onClick={handleOpenNewPageModal}>
						Nova página
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						{/* Card de Filtros */}
						{filtersModalStatus && (
							<Card className='mb-3'>
								<CardBody>
									<div className='row g-3'>
										<div className='col-md-4'>
											<label htmlFor='type-filter' className='form-label'>
												Tipo de criação
											</label>
											<Select
												id='type-filter'
												ariaLabel='Filtrar por tipo'
												value={typeFilter}
												onChange={(
													e: React.ChangeEvent<HTMLSelectElement>,
												) => setTypeFilter(e.target.value)}>
												<Option value=''>Todos os tipos</Option>
												<Option value='GENERATED'>Gerado pela IA</Option>
												<Option value='CLONE'>Copiada</Option>
												<Option value='DRAG_AND_DROP'>
													A partir de um template
												</Option>
												<Option value='UPLOAD'>Importada</Option>
											</Select>
										</div>
										<div className='col-md-4'>
											<label
												htmlFor='start-date-filter'
												className='form-label'>
												Data de início
											</label>
											<Input
												id='start-date-filter'
												type='date'
												value={startDateFilter}
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) => setStartDateFilter(e.target.value)}
											/>
										</div>
										<div className='col-md-4'>
											<label htmlFor='end-date-filter' className='form-label'>
												Data de fim
											</label>
											<Input
												id='end-date-filter'
												type='date'
												value={endDateFilter}
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) => setEndDateFilter(e.target.value)}
											/>
										</div>
									</div>
								</CardBody>
							</Card>
						)}

						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								{loading ? (
									<div className='d-flex justify-content-center align-items-center py-5'>
										<div className='spinner-border text-primary' role='status'>
											<span className='visually-hidden'>Carregando...</span>
										</div>
									</div>
								) : (
									<table className='table table-modern table-hover'>
										<thead>
											<tr>
												<th>Título</th>
												<th>Tipo</th>
												<th>Data da criação</th>
												<th>Ações</th>
											</tr>
										</thead>
										<tbody>
											{paginatedData.map((i) => (
												<tr key={i.id}>
													<td>
														<div className='d-flex align-items-center'>
															<div className='flex-shrink-0'>
																<div
																	className='ratio ratio-1x1 me-3'
																	style={{ width: 48 }}>
																	<div
																		className={`bg-l${
																			darkModeStatus
																				? 'o25'
																				: '25'
																		}-primary text-primary rounded-2 d-flex align-items-center justify-content-center`}>
																		<span className='fw-bold'>
																			{getFirstLetter(
																				i.title,
																			)}
																		</span>
																	</div>
																</div>
															</div>
															<div className='flex-grow-1'>
																<div className='fs-6 fw-bold'>
																	{i.title}
																</div>
															</div>
														</div>
													</td>
													<td>
														<Badge
															color='primary'
															className='text-uppercase'>
															{i.type_creation === 'GENERATED' &&
																'Gerado pela IA'}
															{i.type_creation === 'CLONE' &&
																'Copiada'}
															{i.type_creation === 'DRAG_AND_DROP' &&
																'A partir de um template'}
															{i.type_creation === 'UPLOAD' &&
																'Importada'}
														</Badge>
													</td>
													<td>
														{/* Adicionar hora também */}
														{new Date(i.created_at).toLocaleDateString(
															'pt-BR',
														)}{' '}
														{new Date(i.created_at).toLocaleTimeString(
															'pt-BR',
														)}
													</td>
													<td>
														{/* Verificar se é página gerada por IA e está em status DRAFT */}
														{i.type_creation === 'GENERATED' &&
														i.status === 'DRAFT' ? (
															<div className='d-flex align-items-center'>
																<div
																	className='spinner-border spinner-border-sm text-primary me-2'
																	role='status'>
																	<span className='visually-hidden'>
																		Gerando...
																	</span>
																</div>
																<span className='text-muted me-3'>
																	Gerando página...
																</span>
																<Button
																	color='info'
																	isLight
																	size='sm'
																	onClick={fetchTemplates}>
																	<Icon
																		icon='Refresh'
																		size='lg'
																	/>{' '}
																	Atualizar
																</Button>
															</div>
														) : (
															<>
																<Button
																	color='primary'
																	isLight
																	size='sm'
																	className='me-2'
																	onClick={() =>
																		handleVisualize(i)
																	}>
																	<Icon
																		icon='Visibility'
																		size='lg'
																	/>{' '}
																	Visualizar
																</Button>
																<Button
																	color='primary'
																	isLight
																	size='sm'
																	className='me-2'
																	onClick={() =>
																		handlePublish(i)
																	}>
																	<Icon
																		icon='Publish'
																		size='lg'
																	/>{' '}
																	Publicar
																</Button>
																<Button
																	color='primary'
																	isLight
																	size='sm'
																	className='me-2'
																	onClick={() => handleEdit(i)}>
																	<Icon icon='Edit' size='lg' />
																</Button>
																<Button
																	color='danger'
																	isLight
																	size='sm'
																	onClick={() =>
																		handleOpenDeleteModal(i)
																	}>
																	<Icon icon='Delete' size='lg' />
																</Button>
															</>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</CardBody>
							<PaginationButtons
								data={filteredAndSortedData}
								label='páginas'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
								totalItems={filteredAndSortedData.length}
								totalPages={totalPages}
							/>
						</Card>
					</div>
				</div>
			</Page>

			{/* Modal de confirmação de delete */}
			<Modal
				isOpen={deleteModalStatus}
				setIsOpen={handleCloseDeleteModal}
				size='lg'
				titleId='delete-template-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Confirmar exclusão</h5>
				</ModalHeader>
				<ModalBody>
					<p>
						Tem certeza que deseja excluir o template{' '}
						<strong>{templateToDelete?.title}</strong>?
					</p>
					<p className='text-muted mb-0'>Esta ação não pode ser desfeita.</p>
				</ModalBody>
				<ModalFooter>
					<Button color='link' onClick={handleCloseDeleteModal} isDisable={deleteLoading}>
						Cancelar
					</Button>
					<Button color='danger' onClick={handleDeleteTemplate} isDisable={deleteLoading}>
						{deleteLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Excluindo...
							</>
						) : (
							'Excluir template'
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Modal de criação de nova página */}
			<NewPageModal
				isOpen={newPageModalStatus}
				onClose={handleCloseNewPageModal}
				onSelectOption={handleSelectNewPageOption}
			/>

			{/* Modal de publicação */}
			<Modal
				isOpen={publishModalStatus}
				setIsOpen={handleClosePublishModal}
				size='lg'
				titleId='publish-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Publicar template</h5>
				</ModalHeader>
				<ModalBody>
					{domainsLoading ? (
						<div className='d-flex justify-content-center align-items-center py-4'>
							<div className='spinner-border text-primary' role='status'>
								<span className='visually-hidden'>Carregando domínios...</span>
							</div>
						</div>
					) : (
						<>
							{/* Seleção de domínio */}
							{availableDomains.length > 0 && (
								<div className='mb-4'>
									<label htmlFor='domain-select' className='form-label'>
										Selecione um domínio
									</label>
									<Select
										id='domain-select'
										ariaLabel='Selecionar domínio'
										value={selectedDomain?.id?.toString() || ''}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
											const domainId = parseInt(e.target.value);
											const domain = availableDomains.find(
												(d) => d.id === domainId,
											);
											setSelectedDomain(domain || null);
										}}>
										<Option value=''>Usar domínio padrão (copy-ei.com)</Option>
										{availableDomains.map((domain) => (
											<Option key={domain.id} value={domain.id}>
												{domain.domain}
											</Option>
										))}
									</Select>
								</div>
							)}

							{/* Criação de subdomínio */}
							<div className='mb-3'>
								<h6 className='fw-bold mb-2'>Criar um subdomínio:</h6>
								<p className='text-muted mb-3'>
									O subdomínio será usado para acessar o site publicado.
									<br />
									Exemplo: pagina.
									{selectedDomain ? selectedDomain.domain : 'copy-ei.com'}
								</p>
								<label htmlFor='subdomain-input' className='form-label'>
									Digite o subdomínio
								</label>
								<Input
									id='subdomain-input'
									type='text'
									placeholder='Ex: minha-pagina'
									value={subdomain}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setSubdomain(e.target.value)
									}
								/>
							</div>
						</>
					)}
				</ModalBody>
				<ModalFooter>
					<Button
						color='link'
						onClick={handleClosePublishModal}
						isDisable={publishLoading || domainsLoading}>
						Cancelar
					</Button>
					<Button
						color='primary'
						onClick={handlePublishTemplate}
						isDisable={publishLoading || domainsLoading || !subdomain.trim()}>
						{publishLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Publicando...
							</>
						) : (
							'Publicar'
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Modal de clonagem de página */}
			<ClonePageModal
				isOpen={cloneModalStatus}
				onClose={handleCloseCloneModal}
				onSuccess={fetchTemplates}
			/>

			{/* Modal de geração com IA */}
			<AIGenerateModal
				isOpen={aiGenerateModalStatus}
				onClose={handleCloseAiGenerateModal}
				onSuccess={fetchTemplates}
			/>

			{/* Modal de upload de HTML */}
			<UploadHtmlModal
				isOpen={uploadHtmlModalStatus}
				onClose={handleCloseUploadHtmlModal}
				onSuccess={fetchTemplates}
			/>

			{/* Modal de seleção de template */}
			<TemplateModal
				isOpen={templateModalStatus}
				onClose={handleCloseTemplateModal}
				onSelectTemplate={handleSelectTemplate}
			/>

			{/* Modal de criação de página em branco */}
			<BlankPageModal
				isOpen={blankPageModalStatus}
				onClose={handleCloseBlankPageModal}
				onCreatePage={handleCreateBlankPage}
			/>
		</PageWrapper>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Pages;
