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
import domainService, { Domain } from '../../services/domainService';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const Domains: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();

	const [data, setData] = useState<Domain[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	// Estados para modal de ativação de domínio
	const [domainActivationModalStatus, setDomainActivationModalStatus] = useState<boolean>(false);
	const [domainToActivate, setDomainToActivate] = useState<Domain | null>(null);
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [syncLoading, setSyncLoading] = useState<boolean>(false);

	// Estados para modal de criação de domínio
	const [createDomainModalStatus, setCreateDomainModalStatus] = useState<boolean>(false);
	const [newDomainName, setNewDomainName] = useState<string>('');
	const [createLoading, setCreateLoading] = useState<boolean>(false);

	// Estados para modal de confirmação de exclusão
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

	// Estados para paginação
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);

	// Estados para filtros
	const [domainFilter, setDomainFilter] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [filtersModalStatus, setFiltersModalStatus] = useState<boolean>(false);

	const fetchDomains = useCallback(async () => {
		try {
			setLoading(true);
			const domains = await domainService.getDomains();
			setData(domains);
		} catch (error) {
			console.error('Erro ao buscar domínios:', error);
			if (error instanceof Error && !error.message.includes('Token')) {
				// Aqui você pode adicionar uma notificação de erro se desejar
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDomains();
	}, [fetchDomains]);

	// Resetar página quando filtros mudarem
	useEffect(() => {
		setCurrentPage(1);
	}, [domainFilter, statusFilter]);

	// Funções para gerenciar filtros
	const handleOpenFiltersModal = () => {
		setFiltersModalStatus(true);
	};

	const handleCloseFiltersModal = () => {
		setFiltersModalStatus(false);
	};

	const handleClearFilters = () => {
		setDomainFilter('');
		setStatusFilter('');
		setCurrentPage(1);
	};

	// Funções para controlar modal de ativação de domínio
	const handleOpenDomainActivationModal = (domain: Domain) => {
		setDomainToActivate(domain);
		setDomainActivationModalStatus(true);
	};

	const handleCloseDomainActivationModal = () => {
		setDomainActivationModalStatus(false);
		setDomainToActivate(null);
		setCopiedField(null);
		setSyncLoading(false);
	};

	// Função para copiar texto para o clipboard
	const handleCopyToClipboard = async (text: string, fieldName: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(fieldName);
			// Limpar o feedback após 2 segundos
			setTimeout(() => {
				setCopiedField(null);
			}, 2000);
		} catch (error) {
			console.error('Erro ao copiar para clipboard:', error);
			// Fallback para navegadores mais antigos
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			setCopiedField(fieldName);
			setTimeout(() => {
				setCopiedField(null);
			}, 2000);
		}
	};

	// Função para sincronizar domínio
	const handleSyncDomain = async () => {
		if (!domainToActivate) return;

		try {
			setSyncLoading(true);
			await domainService.syncDomain(domainToActivate.id);
			alert('Domínio sincronizado com sucesso!');
			handleCloseDomainActivationModal();
			// Recarregar a lista de domínios para atualizar os dados
			await fetchDomains();
		} catch (error) {
			console.error('Erro ao sincronizar domínio:', error);
			alert('Erro ao sincronizar domínio. Tente novamente.');
		} finally {
			setSyncLoading(false);
		}
	};

	// Funções para controlar modal de criação de domínio
	const handleOpenCreateDomainModal = () => {
		setCreateDomainModalStatus(true);
	};

	const handleCloseCreateDomainModal = () => {
		setCreateDomainModalStatus(false);
		setNewDomainName('');
		setCreateLoading(false);
	};

	// Função para criar domínio
	const handleCreateDomain = async () => {
		if (!newDomainName.trim()) {
			alert('Por favor, digite o nome do domínio.');
			return;
		}

		try {
			setCreateLoading(true);
			const createdDomain = await domainService.createDomain(newDomainName.trim());
			alert('Domínio criado com sucesso!');
			handleCloseCreateDomainModal();
			// Recarregar a lista de domínios
			await fetchDomains();
			// Abrir automaticamente o modal de ativação
			setDomainToActivate(createdDomain);
			setDomainActivationModalStatus(true);
		} catch (error) {
			console.error('Erro ao criar domínio:', error);
			alert('Erro ao criar domínio. Tente novamente.');
		} finally {
			setCreateLoading(false);
		}
	};

	// Funções para controlar modal de confirmação de exclusão
	const handleOpenDeleteModal = (domain: Domain) => {
		setDomainToDelete(domain);
		setDeleteModalStatus(true);
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalStatus(false);
		setDomainToDelete(null);
		setDeleteLoading(false);
	};

	// Função para deletar domínio
	const handleDeleteDomain = async () => {
		if (!domainToDelete) return;

		try {
			setDeleteLoading(true);
			await domainService.deleteDomain(domainToDelete.id);
			alert('Domínio excluído com sucesso!');
			handleCloseDeleteModal();
			// Recarregar a lista de domínios
			await fetchDomains();
		} catch (error) {
			console.error('Erro ao deletar domínio:', error);
			alert('Erro ao deletar domínio. Tente novamente.');
		} finally {
			setDeleteLoading(false);
		}
	};

	// Verificar se há filtros ativos
	const hasActiveFilters = domainFilter || statusFilter;

	// Função para obter o texto do status
	const getStatusText = (status: string | null) => {
		switch (status) {
			case 'ISSUED':
				return 'Válido';
			case 'PENDING_VALIDATION':
				return 'Pendente de Validação';
			case 'FAILED':
				return 'Falhou';
			default:
				return 'Não definido';
		}
	};

	// Função para obter a cor do badge do status
	const getStatusColor = (status: string | null) => {
		switch (status) {
			case 'ISSUED':
				return 'success';
			case 'PENDING_VALIDATION':
				return 'warning';
			case 'FAILED':
				return 'danger';
			default:
				return 'secondary';
		}
	};

	// Lógica de filtros e ordenação
	const filteredAndSortedData = useMemo(() => {
		let filtered = [...data];

		// Filtrar por nome do domínio
		if (domainFilter) {
			filtered = filtered.filter((domain) =>
				domain.domain.toLowerCase().includes(domainFilter.toLowerCase()),
			);
		}

		// Filtrar por status
		if (statusFilter) {
			filtered = filtered.filter((domain) => domain.status === statusFilter);
		}

		// Ordenar por nome do domínio
		filtered.sort((a, b) => a.domain.localeCompare(b.domain));

		return filtered;
	}, [data, domainFilter, statusFilter]);

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
						placeholder='Buscar por domínio...'
						value={domainFilter}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setDomainFilter(e.target.value)
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
					<Button
						icon='Add'
						color='primary'
						isLight
						onClick={handleOpenCreateDomainModal}>
						Novo domínio
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
										<div className='col-md-6'>
											<label htmlFor='status-filter' className='form-label'>
												Status
											</label>
											<Select
												id='status-filter'
												ariaLabel='Filtrar por status'
												value={statusFilter}
												onChange={(
													e: React.ChangeEvent<HTMLSelectElement>,
												) => setStatusFilter(e.target.value)}>
												<Option value=''>Todos os status</Option>
												<Option value='ISSUED'>Válido</Option>
												<Option value='PENDING_VALIDATION'>
													Pendente de Validação
												</Option>
												<Option value='FAILED'>Falhou</Option>
											</Select>
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
												<th>Nome do domínio</th>
												<th>Status</th>
												<th>Ações</th>
											</tr>
										</thead>
										<tbody>
											{paginatedData.map((domain) => (
												<tr key={domain.id}>
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
																				domain.domain,
																			)}
																		</span>
																	</div>
																</div>
															</div>
															<div className='flex-grow-1'>
																<div className='fs-6 fw-bold'>
																	{domain.domain}
																</div>
															</div>
														</div>
													</td>
													<td>
														<Badge
															color={getStatusColor(domain.status)}
															className='text-uppercase'>
															{getStatusText(domain.status)}
														</Badge>
													</td>
													<td>
														<Button
															color='primary'
															isLight
															size='sm'
															className='me-2'
															onClick={() =>
																handleOpenDomainActivationModal(
																	domain,
																)
															}>
															<Icon icon='CloudUpload' size='lg' />{' '}
															Ativar
														</Button>
														<Button
															color='danger'
															isLight
															size='sm'
															onClick={() =>
																handleOpenDeleteModal(domain)
															}>
															<Icon icon='Delete' size='lg' /> Deletar
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</CardBody>
							<PaginationButtons
								data={filteredAndSortedData}
								label='domínios'
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

			{/* Modal de criação de domínio */}
			<Modal
				isOpen={createDomainModalStatus}
				setIsOpen={handleCloseCreateDomainModal}
				size='lg'
				titleId='create-domain-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Criar novo domínio</h5>
				</ModalHeader>
				<ModalBody>
					<div className='mb-3'>
						<label htmlFor='domain-name-input' className='form-label'>
							Nome do domínio
						</label>
						<Input
							id='domain-name-input'
							type='text'
							placeholder='Ex: meusite.com'
							value={newDomainName}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNewDomainName(e.target.value)
							}
						/>
						<div className='form-text'>
							Digite o nome do domínio que você deseja adicionar (ex: meusite.com)
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button
						color='link'
						onClick={handleCloseCreateDomainModal}
						isDisable={createLoading}>
						Cancelar
					</Button>
					<Button
						color='primary'
						onClick={handleCreateDomain}
						icon='Add'
						isDisable={createLoading || !newDomainName.trim()}>
						{createLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Criando...
							</>
						) : (
							'Criar domínio'
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Modal de ativação de domínio */}
			<Modal
				isOpen={domainActivationModalStatus}
				setIsOpen={handleCloseDomainActivationModal}
				size='lg'
				titleId='domain-activation-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Ativando domínio {domainToActivate?.domain}</h5>
				</ModalHeader>
				<ModalBody>
					<div className='domain-activation-content'>
						<div className='mb-4'>
							<h6 className='fw-bold mb-3 text-primary'>
								<Icon icon='Settings' className='me-2' />
								Como configurar:
							</h6>
							<div className='steps-container'>
								<div className='step-item mb-3'>
									<div className='d-flex align-items-start'>
										<div className='step-number me-3'>
											<span className='badge bg-primary rounded-circle'>
												1
											</span>
										</div>
										<div className='step-content'>
											<p className='mb-0'>
												Acesse seu provedor onde realizou a compra do seu
												domínio
											</p>
										</div>
									</div>
								</div>

								<div className='step-item mb-3'>
									<div className='d-flex align-items-start'>
										<div className='step-number me-3'>
											<span className='badge bg-primary rounded-circle'>
												2
											</span>
										</div>
										<div className='step-content'>
											<p className='mb-2'>
												Adicione uma TAG "CNAME" apontando para o seguinte
												endereço:
											</p>
											<div className='bg-light p-3 rounded border d-flex align-items-center justify-content-between'>
												<code className='text-primary fw-bold'>
													{domainToActivate?.cname_name || 'N/A'}
												</code>
												<Button
													color='link'
													size='sm'
													className='p-1'
													onClick={() =>
														handleCopyToClipboard(
															domainToActivate?.cname_name || '',
															'cname_name',
														)
													}>
													<Icon
														icon={
															copiedField === 'cname_name'
																? 'Check'
																: 'ContentCopy'
														}
														size='sm'
														className={
															copiedField === 'cname_name'
																? 'text-success'
																: 'text-muted'
														}
													/>
												</Button>
											</div>
										</div>
									</div>
								</div>

								<div className='step-item mb-4'>
									<div className='d-flex align-items-start'>
										<div className='step-number me-3'>
											<span className='badge bg-primary rounded-circle'>
												3
											</span>
										</div>
										<div className='step-content'>
											<p className='mb-2'>
												E o VALUE apontando para o seguinte endereço:
											</p>
											<div className='bg-light p-3 rounded border d-flex align-items-center justify-content-between'>
												<code className='text-primary fw-bold'>
													{domainToActivate?.cname_value || 'N/A'}
												</code>
												<Button
													color='link'
													size='sm'
													className='p-1'
													onClick={() =>
														handleCopyToClipboard(
															domainToActivate?.cname_value || '',
															'cname_value',
														)
													}>
													<Icon
														icon={
															copiedField === 'cname_value'
																? 'Check'
																: 'ContentCopy'
														}
														size='sm'
														className={
															copiedField === 'cname_value'
																? 'text-success'
																: 'text-muted'
														}
													/>
												</Button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<p
							style={{
								color: '#4a5568',
								fontSize: '1rem',
								lineHeight: '1.6',
								margin: '0',
								padding: '1.5rem',
								background: 'white',
								borderRadius: '12px',
								borderLeft: '4px solid #667eea',
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
								transition: 'all 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
								e.currentTarget.style.transform = 'translateY(-2px)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
								e.currentTarget.style.transform = 'translateY(0)';
							}}>
							<Icon icon='Info' className='me-2' />
							<strong>Importante:</strong> A propagação pode levar até 24h para ser
							efetivada.
						</p>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button
						color='link'
						onClick={handleCloseDomainActivationModal}
						isDisable={syncLoading}>
						Fechar
					</Button>
					<Button
						color='primary'
						onClick={handleSyncDomain}
						icon='Sync'
						isDisable={syncLoading}>
						{syncLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Sincronizando...
							</>
						) : (
							'Sincronizar'
						)}
					</Button>
				</ModalFooter>
			</Modal>

			{/* Modal de confirmação de exclusão */}
			<Modal
				isOpen={deleteModalStatus}
				setIsOpen={handleCloseDeleteModal}
				size='lg'
				titleId='delete-domain-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Confirmar exclusão</h5>
				</ModalHeader>
				<ModalBody>
					<p>
						Tem certeza que deseja excluir o domínio{' '}
						<strong>{domainToDelete?.domain}</strong>?
					</p>
					<p className='text-muted mb-0'>Esta ação não pode ser desfeita.</p>
				</ModalBody>
				<ModalFooter>
					<Button color='link' onClick={handleCloseDeleteModal} isDisable={deleteLoading}>
						Cancelar
					</Button>
					<Button color='danger' onClick={handleDeleteDomain} isDisable={deleteLoading}>
						{deleteLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Excluindo...
							</>
						) : (
							'Excluir domínio'
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</PageWrapper>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Domains;
