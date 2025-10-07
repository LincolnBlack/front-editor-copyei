import React, { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDarkMode from '../../hooks/useDarkMode';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Icon from '../../components/icon/Icon';
import Button from '../../components/bootstrap/Button';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../components/bootstrap/Modal';
import { getFirstLetter } from '../../helpers/helpers';
import Badge from '../../components/bootstrap/Badge';
import templateService, { UserTemplate } from '../../services/templateService';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const Pages: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const { loading: authLoading, isAuthorized } = useAdminAuth();
	const router = useRouter();

	const [data, setData] = useState<UserTemplate[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [templateToDelete, setTemplateToDelete] = useState<UserTemplate | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

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

	const handleOpenDeleteModal = (template: UserTemplate) => {
		setTemplateToDelete(template);
		setDeleteModalStatus(true);
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalStatus(false);
		setTemplateToDelete(null);
		setDeleteLoading(false);
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

	const handlePublish = (template: UserTemplate) => {
		// TODO: Implementar lógica de publicação
		console.log('Publicar template:', template);
	};

	const handleEdit = (template: UserTemplate) => {
		// TODO: Implementar navegação para edição
		if (!process.env.NEXT_PUBLIC_EDITOR_URL) {
			alert('URL do editor não configurada');
			return;
		}
		location.href = `${process.env.NEXT_PUBLIC_EDITOR_URL}/${template.id}`;
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

	return (
		<PageWrapper>
			<Head>
				<title>Páginas</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<h4 className='mb-0'>Páginas</h4>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						icon='Add'
						color='primary'
						isLight
						onClick={() => router.push('/pages/new')}>
						Nova página
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
												<th>Título</th>
												<th>Tipo</th>
												<th>Ações</th>
											</tr>
										</thead>
										<tbody>
											{data.map((i) => (
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
																	{i.title} {i.id}
																</div>
																<div className='text-muted small'>
																	{i.object_folder}
																</div>
															</div>
														</div>
													</td>
													<td>
														<Badge
															color='primary'
															className='text-uppercase'>
															{i.type_creation}
														</Badge>
													</td>
													<td>
														<Button
															color='success'
															isLight
															size='sm'
															className='me-2'
															onClick={() => handlePublish(i)}>
															<Icon icon='Publish' size='lg' />
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
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</CardBody>
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
