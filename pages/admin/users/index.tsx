/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDarkMode from '../../../hooks/useDarkMode';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../../components/bootstrap/Modal';
import { getFirstLetter } from '../../../helpers/helpers';
import UserFormModal from './UserFormModal';
import UploadSheetModal from './UploadSheetModal';
import Badge from '../../../components/bootstrap/Badge';
import userService, { User, PaginatedUsers } from '../../../services/userService';
import { useAdminAuth } from '../../../hooks/useAdminAuth';

const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();
	const router = useRouter();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);
	const [data, setData] = useState<User[]>([]);
	const [paginationMeta, setPaginationMeta] = useState<PaginatedUsers['meta'] | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	// Estados para os filtros
	const [nameFilter, setNameFilter] = useState<string>('');
	const [emailFilter, setEmailFilter] = useState<string>('');
	const [roleFilter, setRoleFilter] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [modalStatus, setModalStatus] = useState<boolean>(false);
	const [selectedUserId, setSelectedUserId] = useState<string>('new');
	const [uploadModalStatus, setUploadModalStatus] = useState<boolean>(false);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

	const fetchUsers = async (page: number = currentPage, perPageCount: number = perPage) => {
		try {
			setLoading(true);

			// Converter o status para o formato esperado pelo backend
			let backendStatus = '';
			if (statusFilter === 'active') {
				backendStatus = 'Ativo';
			} else if (statusFilter === 'inactive') {
				backendStatus = 'Inativo';
			}

			const result = await userService.getUsers({
				page,
				per_page: perPageCount,
				name: nameFilter,
				email: emailFilter,
				role: roleFilter,
				status: backendStatus,
			});
			setData(result.data);
			setPaginationMeta(result.meta);
		} catch (error) {
			console.error('Erro ao buscar usuários:', error);
			// Se for erro de autenticação, o interceptor já redireciona
			// Para outros erros, podemos mostrar uma mensagem
			if (error instanceof Error && !error.message.includes('Token')) {
				// Aqui você pode adicionar uma notificação de erro se desejar
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		fetchUsers(currentPage, perPage);
	}, [currentPage, perPage]);

	// Adicionar um useEffect para buscar quando os filtros mudarem
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchUsers(1, perPage); // Reset para página 1 quando filtrar
		}, 500); // Debounce de 500ms

		return () => clearTimeout(timeoutId);
	}, [nameFilter, emailFilter, roleFilter, statusFilter]);

	const handleOpenModal = (userId: string = 'new') => {
		setSelectedUserId(userId);
		setModalStatus(true);
	};

	const handleCloseModal = () => {
		setModalStatus(false);
		setSelectedUserId('new');
	};

	const handleModalSuccess = () => {
		fetchUsers(); // Recarregar a lista após criar/editar
	};

	const handleOpenUploadModal = () => {
		setUploadModalStatus(true);
	};

	const handleCloseUploadModal = () => {
		setUploadModalStatus(false);
	};

	const handleUploadSuccess = () => {
		fetchUsers(); // Recarregar a lista após upload
	};

	const handleDownloadSheet = async () => {
		try {
			await userService.downloadUsersSheet();
		} catch (error) {
			console.error('Erro ao baixar planilha:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
		}
	};

	const handleOpenDeleteModal = (user: User) => {
		setUserToDelete(user);
		setDeleteModalStatus(true);
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalStatus(false);
		setUserToDelete(null);
		setDeleteLoading(false);
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;

		try {
			setDeleteLoading(true);
			await userService.deleteUser(userToDelete.id.toString());
			handleCloseDeleteModal();
			fetchUsers(); // Recarregar a lista após deletar
		} catch (error) {
			console.error('Erro ao deletar usuário:', error);
			// Aqui você pode adicionar uma notificação de erro se desejar
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleClearFilters = () => {
		setNameFilter('');
		setEmailFilter('');
		setRoleFilter('');
		setStatusFilter('');
	};

	// Verificar se há filtros ativos
	const hasActiveFilters = nameFilter || emailFilter || roleFilter || statusFilter;

	// Adicionar um useEffect para buscar quando os filtros mudarem
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchUsers(1, perPage); // Reset para página 1 quando filtrar
		}, 500); // Debounce de 500ms

		return () => clearTimeout(timeoutId);
	}, [nameFilter, emailFilter, roleFilter, statusFilter]);

	const { items, requestSort, getClassNamesFor } = useSortableData(data);

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
				<title>Usuários</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<div className='row g-3'>
						<div className='col-md-3'>
							<Input
								type='text'
								placeholder='Filtrar por nome...'
								value={nameFilter}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setNameFilter(e.target.value)
								}
							/>
						</div>
						<div className='col-md-3'>
							<Input
								type='email'
								placeholder='Filtrar por email...'
								value={emailFilter}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setEmailFilter(e.target.value)
								}
							/>
						</div>
						<div className='col-md-3'>
							<Select
								ariaLabel='Filtrar por função'
								value={roleFilter}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									setRoleFilter(e.target.value)
								}>
								<Option value=''>Todas as funções</Option>
								<Option value='ADMIN'>Administrador</Option>
								<Option value='USER'>Usuário</Option>
							</Select>
						</div>
						<div className='col-md-3'>
							<Select
								ariaLabel='Filtrar por status'
								value={statusFilter}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									setStatusFilter(e.target.value)
								}>
								<Option value=''>Todos os status</Option>
								<Option value='active'>Ativo</Option>
								<Option value='inactive'>Inativo</Option>
							</Select>
						</div>
					</div>
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
						icon='Upload'
						color='success'
						isLight
						className='me-2'
						onClick={handleOpenUploadModal}>
						Upload Planilha
					</Button>
					<Button
						icon='Download'
						color='info'
						isLight
						className='me-2'
						onClick={handleDownloadSheet}>
						Baixar Planilha
					</Button>
					<Button
						icon='PersonAdd'
						color='primary'
						isLight
						onClick={() => handleOpenModal()}>
						Novo usuário
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
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
												<th
													onClick={() => requestSort('name')}
													className='cursor-pointer text-decoration-underline'>
													Nome{' '}
													<Icon
														size='lg'
														className={getClassNamesFor('name')}
														icon='FilterList'
													/>
												</th>
												<th>Email</th>
												<th
													onClick={() => requestSort('role')}
													className='cursor-pointer text-decoration-underline'>
													Tipo{' '}
													<Icon
														size='lg'
														className={getClassNamesFor('role')}
														icon='FilterList'
													/>
												</th>
												<th
													onClick={() => requestSort('active')}
													className='cursor-pointer text-decoration-underline'>
													Status{' '}
													<Icon
														size='lg'
														className={getClassNamesFor('active')}
														icon='FilterList'
													/>
												</th>
												<td />
											</tr>
										</thead>
										<tbody>
											{dataPagination(items, currentPage, perPage).map(
												(i) => (
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
																					i.name,
																				)}
																			</span>
																		</div>
																	</div>
																</div>
																<div className='flex-grow-1'>
																	<div className='fs-6 fw-bold'>
																		{i.name}
																	</div>
																</div>
															</div>
														</td>
														<td>
															<Button
																isLink
																color='light'
																icon='Email'
																className='text-lowercase'
																tag='a'
																href={`mailto:${i.email}`}>
																{i.email}
															</Button>
														</td>
														<td>
															<Badge
																color={
																	i.role === 'ADMIN'
																		? 'danger'
																		: 'primary'
																}
																className='text-uppercase'>
																{i.role === 'ADMIN'
																	? 'Administrador'
																	: 'Usuário'}
															</Badge>
														</td>
														<td>
															{i.paused_at ? (
																<Badge color='danger'>
																	Inativo
																</Badge>
															) : (
																<Badge color='success'>Ativo</Badge>
															)}
														</td>
														<td>
															<Button
																color='primary'
																isLight
																size='sm'
																className='me-2'
																onClick={() =>
																	router.push(
																		`/admin/users/${i.id}`,
																	)
																}>
																<Icon icon='Visibility' size='lg' />
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
														</td>
													</tr>
												),
											)}
										</tbody>
									</table>
								)}
							</CardBody>
							<PaginationButtons
								data={data}
								label='usuários'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
								totalItems={paginationMeta?.total || 0}
								totalPages={paginationMeta?.last_page || 1}
							/>
						</Card>
					</div>
				</div>
			</Page>
			<UserFormModal
				id={selectedUserId}
				isOpen={modalStatus}
				setIsOpen={handleCloseModal}
				onSuccess={handleModalSuccess}
			/>

			<UploadSheetModal
				isOpen={uploadModalStatus}
				setIsOpen={handleCloseUploadModal}
				onSuccess={handleUploadSuccess}
			/>

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
						<strong>{userToDelete?.name}</strong>?
					</p>
					<p className='text-muted mb-0'>Esta ação não pode ser desfeita.</p>
				</ModalBody>
				<ModalFooter>
					<Button color='link' onClick={handleCloseDeleteModal} isDisable={deleteLoading}>
						Cancelar
					</Button>
					<Button color='danger' onClick={handleDeleteUser} isDisable={deleteLoading}>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Index;
