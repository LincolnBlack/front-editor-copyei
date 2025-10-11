import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/router';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import ThemeContext from '../context/themeContext';
import Page from '../layout/Page/Page';
import Alert from '../components/bootstrap/Alert';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../layout/SubHeader/SubHeader';
import Icon from '../components/icon/Icon';
import Button from '../components/bootstrap/Button';
import Card, { CardBody } from '../components/bootstrap/Card';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../components/bootstrap/Modal';
import Input from '../components/bootstrap/forms/Input';
import PaginationButtons, { PER_COUNT } from '../components/PaginationButtons';
import websiteService, { WebsiteTemplate } from '../services/websiteService';
import { useAdminAuth } from '../hooks/useAdminAuth';
import useDarkMode from '../hooks/useDarkMode';

const Index: NextPage = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();

	// Estados para listagem de websites
	const [websites, setWebsites] = useState<WebsiteTemplate[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [websiteToDelete, setWebsiteToDelete] = useState<WebsiteTemplate | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

	// Estados para paginação
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);

	// Estados para filtros
	const [domainFilter, setDomainFilter] = useState<string>('');

	/**
	 * Tour Start
	 */
	const { setIsOpen } = useTour();

	// Função para buscar websites
	const fetchWebsites = useCallback(async () => {
		try {
			setLoading(true);
			const websitesData = await websiteService.getWebsites();
			setWebsites(websitesData);
		} catch (error) {
			console.error('Erro ao buscar websites:', error);
			if (error instanceof Error && !error.message.includes('Token')) {
				// Aqui você pode adicionar uma notificação de erro se desejar
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// Verificar se há mensagem de erro na URL
	useEffect(() => {
		if (router.query.error === 'unauthorized') {
			setErrorMessage(
				'Você não tem permissão para acessar essa área. Apenas administradores podem acessar o painel administrativo.',
			);
			// Limpar o parâmetro da URL
			router.replace('/', undefined, { shallow: true });
		}
	}, [router]);

	// Buscar websites quando o componente montar
	useEffect(() => {
		if (isAuthorized) {
			fetchWebsites();
		}
	}, [isAuthorized, fetchWebsites]);

	// Resetar página quando filtros mudarem
	useEffect(() => {
		setCurrentPage(1);
	}, [domainFilter]);

	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			localStorage.getItem('tourModalStarted') !== 'shown' &&
			!mobileDesign
		) {
			setTimeout(() => {
				setIsOpen(true);
				localStorage.setItem('tourModalStarted', 'shown');
			}, 3000);
		}
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Funções para manipular modais
	const handleOpenDeleteModal = (website: WebsiteTemplate) => {
		setWebsiteToDelete(website);
		setDeleteModalStatus(true);
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalStatus(false);
		setWebsiteToDelete(null);
		setDeleteLoading(false);
	};

	const handleDeleteWebsite = async () => {
		if (!websiteToDelete) return;

		try {
			setDeleteLoading(true);
			// TODO: Implementar delete no websiteService
			// await websiteService.deleteWebsite(websiteToDelete.id.toString());
			handleCloseDeleteModal();
			fetchWebsites(); // Recarregar a lista após deletar
		} catch (error) {
			console.error('Erro ao deletar website:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
		} finally {
			setDeleteLoading(false);
		}
	};

	const handlePublishWebsite = (website: WebsiteTemplate) => {
		// TODO: Implementar publicação
		console.log('Publicar website:', website);
	};

	const handleClearFilters = () => {
		setDomainFilter('');
		setCurrentPage(1);
	};

	// Verificar se há filtros ativos
	const hasActiveFilters = domainFilter;

	// Lógica de filtros e ordenação
	const filteredAndSortedData = useMemo(() => {
		let filtered = [...websites];

		// Filtrar por domínio e subdomínio (concatenados como na coluna "Seu site")
		if (domainFilter) {
			filtered = filtered.filter((website) => {
				const fullSiteName = `${website.subdomain}.${website.Domain.domain}`;
				return fullSiteName.toLowerCase().includes(domainFilter.toLowerCase());
			});
		}

		// Ordenar por data de criação (mais recente primeiro)
		filtered.sort((a, b) => {
			const dateA = new Date(a.created_at);
			const dateB = new Date(b.created_at);
			return dateB.getTime() - dateA.getTime();
		});

		return filtered;
	}, [websites, domainFilter]);

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
			<Head>
				<title>Dashboard - Páginas Publicadas</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<Input
						type='text'
						placeholder='Buscar por subdomínio ou domínio...'
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
				</SubHeaderRight>
			</SubHeader>
			<Page>
				{errorMessage && (
					<Alert color='danger' className='mb-4'>
						{errorMessage}
					</Alert>
				)}

				<div className='row h-100'>
					<div className='col-12'>
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
												<th>Nome da página</th>
												<th>Seu site</th>
												<th>Clonado de</th>
												<th>Ações</th>
											</tr>
										</thead>
										<tbody>
											{paginatedData.map((website) => (
												<tr key={website.id}>
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
																			{website.subdomain
																				.charAt(0)
																				.toUpperCase()}
																		</span>
																	</div>
																</div>
															</div>
															<div className='flex-grow-1'>
																<div className='fs-6 fw-bold'>
																	{website.subdomain}
																</div>
															</div>
														</div>
													</td>
													<td>
														<div className='fs-6'>
															{(() => {
																// Verificar se foi criado há mais de 4 minutos
																const fourMinutesAgo = new Date(
																	Date.now() - 4 * 60 * 1000,
																);
																const websiteCreatedAt = new Date(
																	website.created_at,
																);
																const isOlderThan4Minutes =
																	websiteCreatedAt <
																	fourMinutesAgo;

																// Só torna clicável se foi criado há mais de 4 minutos
																if (
																	isOlderThan4Minutes &&
																	website.cloudfront_distribution_domain
																) {
																	return (
																		<a
																			href={`https://${website.subdomain}.${website.Domain.domain}`}
																			target='_blank'
																			rel='noopener noreferrer'
																			className='text-decoration-none'>
																			{website.subdomain}.
																			{website.Domain.domain}
																		</a>
																	);
																} else {
																	return (
																		<span>
																			{website.subdomain}.
																			{website.Domain.domain}
																		</span>
																	);
																}
															})()}
														</div>
													</td>
													<td>
														<div
															className='fs-6 text-truncate'
															style={{ maxWidth: '200px' }}>
															{website.clone_url ? (
																<a
																	href={website.clone_url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-decoration-none'>
																	{website.clone_url}
																</a>
															) : (
																<span className='text-muted'>
																	Não disponível
																</span>
															)}
														</div>
													</td>
													<td>
														<Button
															color='primary'
															isLight
															size='sm'
															className='me-2'
															onClick={() =>
																handlePublishWebsite(website)
															}>
															<Icon icon='Publish' size='lg' />
														</Button>
														<Button
															color='danger'
															isLight
															size='sm'
															onClick={() =>
																handleOpenDeleteModal(website)
															}>
															<Icon icon='Delete' size='lg' />
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
								label='páginas publicadas'
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
				titleId='delete-website-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Confirmar exclusão</h5>
				</ModalHeader>
				<ModalBody>
					<p>
						Tem certeza que deseja excluir o website{' '}
						<strong>
							{websiteToDelete?.subdomain}.{websiteToDelete?.Domain.domain}
						</strong>
						?
					</p>
					<p className='text-muted mb-0'>Esta ação não pode ser desfeita.</p>
				</ModalBody>
				<ModalFooter>
					<Button color='link' onClick={handleCloseDeleteModal} isDisable={deleteLoading}>
						Cancelar
					</Button>
					<Button color='danger' onClick={handleDeleteWebsite} isDisable={deleteLoading}>
						{deleteLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Excluindo...
							</>
						) : (
							'Excluir website'
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

export default Index;
