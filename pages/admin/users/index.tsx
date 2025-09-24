import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useFormik } from 'formik';
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
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../../components/bootstrap/Modal';
import { getFirstLetter } from '../../../helpers/helpers';
import UserFormModal from './UserFormModal';
import Badge from '../../../components/bootstrap/Badge';
import userService, { User } from '../../../services/userService';
import { useAdminAuth } from '../../../hooks/useAdminAuth';

const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);
	const [data, setData] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [modalStatus, setModalStatus] = useState<boolean>(false);
	const [selectedUserId, setSelectedUserId] = useState<string>('new');
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

	const formik = useFormik({
		initialValues: {
			searchInput: '',
		},
		onSubmit: () => {
			// alert(JSON.stringify(values, null, 2));
		},
	});

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const users = await userService.getUsers();
			setData(users);
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

	const filteredData = data.filter(
		(f: { name: string; email: string }) =>
			// Name
			f.name.toLowerCase().includes(formik.values.searchInput.toLowerCase()) ||
			f.email.toLowerCase().includes(formik.values.searchInput.toLowerCase()),
	);

	const { items, requestSort, getClassNamesFor } = useSortableData(filteredData);

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
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Pesquisar usuário...'
						onChange={formik.handleChange}
						value={formik.values.searchInput}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
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
													Role{' '}
													<Icon
														size='lg'
														className={getClassNamesFor('role')}
														icon='FilterList'
													/>
												</th>
												<th>Último login</th>
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
																	i.role === 'superadmin'
																		? 'danger'
																		: 'primary'
																}
																className='text-uppercase'>
																{i.role}
															</Badge>
														</td>
														<td>
															{i.lastLogin ? (
																<>
																	<div>
																		{i.lastLogin.format('ll')}
																	</div>
																	<div>
																		<small className='text-muted'>
																			{i.lastLogin.fromNow()}
																		</small>
																	</div>
																</>
															) : (
																<div> - </div>
															)}
														</td>
														<td>
															{i.active ? (
																<Badge color='success'>Ativo</Badge>
															) : (
																<Badge color='danger'>
																	Inativo
																</Badge>
															)}
														</td>
														<td>
															<Button
																color='primary'
																isLight
																size='sm'
																className='me-2'
																onClick={() =>
																	handleOpenModal(i.id.toString())
																}>
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
														</td>
													</tr>
												),
											)}
										</tbody>
									</table>
								)}
							</CardBody>
							<PaginationButtons
								data={filteredData}
								label='usuários'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
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
