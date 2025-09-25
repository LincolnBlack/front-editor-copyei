import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { 
	SubHeaderLeft, 
	SubHeaderRight,
	SubheaderSeparator 
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Badge from '../../../components/bootstrap/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../../components/bootstrap/Modal';
import userService, { User } from '../../../services/userService';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { getFirstLetter } from '../../../helpers/helpers';
import { TIcons } from '../../../type/icons-type';
import classNames from 'classnames';

interface ITab {
	[key: string]: {
		label: string;
		icon: TIcons;
	};
}

const UserDetails: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();
	const router = useRouter();
	const { id } = router.query;

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

	const TABS: ITab = {
		WEBSITES: {
			label: 'Websites',
			icon: 'Web',
		},
		DOMAINS: {
			label: 'Domínios',
			icon: 'Domain',
		},
	};
	const [activeTab, setActiveTab] = useState<ITab['key']>(TABS.WEBSITES);
	const handleActiveTab = (tabName: ITab['key']) => {
		setActiveTab(tabName);
	};

	const fetchUser = async () => {
		if (!id || typeof id !== 'string') return;

		try {
			setLoading(true);
			const userData = await userService.getUserById(id);
			console.log(userData);
			setUser(userData);
		} catch (error) {
			console.error('Erro ao buscar usuário:', error);
			// Se for erro de autenticação, o interceptor já redireciona
			if (error instanceof Error && !error.message.includes('Token')) {
				// Aqui você pode adicionar uma notificação de erro se desejar
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, [id]);


	const handlePause = async () => {
		if (!user) return;

		try {
			setLoading(true);
			if (user.paused_at) {
				// Se está pausado, ativar
				await userService.activateUser(user.id.toString());
			} else {
				// Se está ativo, pausar
				await userService.pauseUser(user.id.toString());
			}
			// Recarregar os dados do usuário após a operação
			await fetchUser();
		} catch (error) {
			console.error('Erro ao alterar status do usuário:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = () => {
		setDeleteModalStatus(true);
	};

	const handleConfirmDelete = async () => {
		if (!user) return;

		try {
			setDeleteLoading(true);
			await userService.deleteUser(user.id.toString());
			router.push('/admin/users');
		} catch (error) {
			console.error('Erro ao deletar usuário:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalStatus(false);
		setDeleteLoading(false);
	};

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

	// Se está carregando os dados do usuário
	if (loading) {
		return (
			<PageWrapper>
				<Head>
					<title>Carregando usuário...</title>
				</Head>
				<Page>
					<div className='d-flex justify-content-center align-items-center py-5'>
						<div className='spinner-border text-primary' role='status'>
							<span className='visually-hidden'>Carregando usuário...</span>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	// Se não encontrou o usuário
	if (!user) {
		return (
			<PageWrapper>
				<Head>
					<title>Usuário não encontrado</title>
				</Head>
				<Page>
					<div className='d-flex justify-content-center align-items-center py-5'>
						<div className='text-center'>
							<Icon icon='PersonOff' size='3x' className='text-muted mb-3' />
							<h4>Usuário não encontrado</h4>
							<p className='text-muted'>O usuário solicitado não foi encontrado.</p>
							<Button
								color='primary'
								onClick={() => router.push('/admin/users')}>
								Voltar para lista
							</Button>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper>
			<Head>
				<title>{user.name} - Detalhes do Usuário</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<Button color='primary' isLink icon='ArrowBack' tag='a' to='/admin/users'>
						Voltar para a lista de usuários
					</Button>
					{/* 
					<SubheaderSeparator />
					<span className='text-muted fst-italic me-2'>Última atualização:</span>
					<span className='fw-bold'>
						{user
							? new Date(user.updated_at).toLocaleString('pt-BR')
							: 'Carregando...'}
					</span> */}
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						icon={user?.paused_at ? 'PlayArrow' : 'Pause'}
						color={user?.paused_at ? 'success' : 'warning'}
						isLight
						className='me-2'
						onClick={handlePause}
						isDisable={loading}>
						{loading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								{user?.paused_at ? 'Reativando...' : 'Pausando...'}
							</>
						) : (
							user?.paused_at ? 'Reativar' : 'Pausar'
						)}
					</Button>
					<Button
						icon='Delete'
						color='danger'
						isLight
						onClick={handleDelete}>
						Excluir
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row'>
					<div className='col-lg-4'>
						<Card className='shadow-3d-primary'>
							<CardBody>
								<div className='row g-5 py-3'>
									<div className='col-12 d-flex justify-content-center'>
										<div className='flex-shrink-0'>
											<div className='ratio ratio-1x1' style={{ width: 100 }}>
												<div
													className={`${
														darkModeStatus
															? 'bg-lo25-primary text-white'
															: 'bg-l25-primary text-primary'
													} text-primary rounded-2 d-flex align-items-center justify-content-center`}>
													<span className='fw-bold'>
														{user ? getFirstLetter(user.name) : '...'}
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className='col-12'>
										<div className='row g-3'>
											<div className='col-12'>
												<div className='d-flex align-items-center'>
													<div className='flex-grow-1 ms-3'>
														<div className='fw-bold fs-5 mb-0'>
															{user ? user.name : 'Carregando...'}
														</div>
														<div className='text-muted'>
															{user ? user.email : ''}
														</div>
													</div>
												</div>
											</div>
											<div className='col-12'>
												<div className='d-flex align-items-center'>
													<div className='flex-grow-1 ms-3'>
														<div className='fs-5 mb-0 d-flex gap-2'>
															{user?.paused_at ? (
																<Badge color='danger'>Inativo</Badge>
															) : (
																<Badge color='success'>Ativo</Badge>
															)}
															{user?.role === 'ADMIN' ? (
																<Badge color='danger'>Administrador</Badge>
															) : (
																<Badge color='primary'>Usuário</Badge>
															)}
														</div>
													</div>
												</div>
											</div>
											<div className='col-12'>
												<div className='d-flex align-items-center'>
													<div className='flex-grow-1 ms-3'>
														{user.description_plan && (
															<div className='text-muted small mb-1'>
																Descrição do plano: {user.description_plan}
															</div>
														)}
														{user.due_date && (
															<div className='text-muted small mb-1'>
																Data de vencimento: {user.due_date}
															</div>
														)}
														{user.usageDuration && (
															<div className='text-muted small mb-1'>
																Dias ativos: {user.usageDuration.days} dias
															</div>
														)}
													</div>
												</div>
											</div>
											<hr className='mt-3' />
											{user && (
												<div className='col-12'>
													<div className='d-flex align-items-center'>
														<div className='flex-grow-1 ms-3'>
															<div className='text-muted small'>
																ID: {user.id}
															</div>
															<div className='text-muted small'>
																Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
															</div>
															{user.paused_at && (
																<div className='text-muted small'>
																	Pausado em: {new Date(user.paused_at).toLocaleDateString('pt-BR')}
																</div>
															)}
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-lg-8'>
						<Card>
							<CardBody className='z-1'>
								<div
									className={classNames('rounded-3', {
										'shadow-3d-dark': !darkModeStatus,
										'shadow-3d-light': darkModeStatus,
										'bg-l10-dark': !darkModeStatus,
										'bg-lo50-primary': darkModeStatus,
									})}>
									<div className='row g-3 pb-3 px-3 mt-0 no-wrap'>
										{Object.keys(TABS).map((key) => (
											<div
												key={key}
												className='col d-flex flex-column align-items-center'>
												<Button
													color={
														(darkModeStatus &&
															activeTab !== TABS[key]) ||
														!darkModeStatus
															? 'primary'
															: undefined
													}
													className='w-100 text-capitalize'
													rounded={1}
													onClick={() => handleActiveTab(TABS[key])}
													isLight={activeTab.label !== TABS[key].label}>
													<div className='d-flex align-items-center justify-content-center flex-column py-2'>
														<Icon icon={TABS[key].icon} size='2x' />
														<span className='ms-2 mt-2'>
															{TABS[key].label}
														</span>
													</div>
												</Button>
											</div>
										))}
									</div>
								</div>
							</CardBody>
						</Card>
						
						{/* Conteúdo das tabs */}
						{activeTab.label === 'Websites' && (
							<Card className='mt-3'>
								<CardBody>
									<h6 className='fw-bold mb-3'>Websites</h6>
									{user?.Websites && user.Websites.length > 0 ? (
										<div className='row'>
											{user.Websites.map((website) => (
												<div key={website.id} className='col-md-6 mb-3'>
													<Card className='h-100'>
														<CardBody>
															<h6 className='card-title'>{website.title}</h6>
															<p className='card-text'>
																<a
																	href={website.clone_url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-decoration-none'>
																	{website.clone_url}
																</a>
															</p>
														</CardBody>
													</Card>
												</div>
											))}
										</div>
									) : (
										<div className='text-center py-4'>
											<Icon icon='Web' size='3x' className='text-muted mb-3' />
											<p className='text-muted'>Nenhum website encontrado</p>
										</div>
									)}
								</CardBody>
							</Card>
						)}
						
						{activeTab.label === 'Domínios' && (
							<Card className='mt-3'>
								<CardBody>
									<h6 className='fw-bold mb-3'>Domínios</h6>
									{user?.Domains && user.Domains.length > 0 ? (
										<div className='row'>
											{user.Domains.map((domain) => (
												<div key={domain.id} className='col-md-4 mb-2'>
													<Badge rounded={1} color='primary' className='w-100 text-start py-4 px-4 fs-6'>
														{domain.domain}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<div className='text-center py-4'>
											<Icon icon='Domain' size='3x' className='text-muted mb-3' />
											<p className='text-muted'>Nenhum domínio encontrado</p>
										</div>
									)}
								</CardBody>
							</Card>
						)}
					</div>
				</div>
			</Page>

			{/* Modal de confirmação de delete */}
			<Modal
				isOpen={deleteModalStatus}
				setIsOpen={handleCloseDeleteModal}
				size='lg'
				titleId='delete-user-modal'>
				<ModalHeader>
					<h5 className='modal-title'>Confirmar exclusão</h5>
				</ModalHeader>
				<ModalBody>
					<p>
						Tem certeza que deseja excluir o usuário{' '}
						<strong>{user?.name}</strong>?
					</p>
					<p className='text-muted mb-0'>Esta ação não pode ser desfeita.</p>
				</ModalBody>
				<ModalFooter>
					<Button color='link' onClick={handleCloseDeleteModal} isDisable={deleteLoading}>
						Cancelar
					</Button>
					<Button color='danger' onClick={handleConfirmDelete} isDisable={deleteLoading}>
						{deleteLoading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Excluindo...
							</>
						) : (
							'Excluir usuário'
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</PageWrapper>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default UserDetails;
