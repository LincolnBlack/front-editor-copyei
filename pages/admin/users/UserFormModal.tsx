import React, { FC, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import showNotification from '../../../components/extras/showNotification';
import Icon from '../../../components/icon/Icon';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Label from '../../../components/bootstrap/forms/Label';
import Checks from '../../../components/bootstrap/forms/Checks';
import userService, { CreateUserData, UpdateUserData, User } from '../../../services/userService';

interface IUserFormModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	onSuccess?: () => void;
}

const UserFormModal: FC<IUserFormModalProps> = ({ id, isOpen, setIsOpen, onSuccess }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const isNewUser = id === 'new';

	// Buscar dados do usuário quando não for um novo usuário
	useEffect(() => {
		const fetchUser = async () => {
			if (isNewUser) {
				// Resetar o estado user para novo usuário
				setUser(null);
				return;
			}

			if (isOpen) {
				try {
					setIsLoading(true);
					const userData = await userService.getUserById(id);
					setUser(userData);
				} catch (error) {
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Error' size='lg' className='me-1' />
							<span>Erro</span>
						</span>,
						error instanceof Error ? error.message : 'Erro ao carregar usuário',
						'danger',
					);
					setIsOpen(false);
				} finally {
					setIsLoading(false);
				}
			}
		};

		fetchUser();
	}, [id, isOpen, isNewUser, setIsOpen]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			name: user?.name || '',
			email: user?.email || '',
			active: user?.active ?? true,
		},
		validate: (values) => {
			const errors: { name?: string; email?: string } = {};

			if (!values.name) {
				errors.name = 'Nome é obrigatório';
			}

			if (!values.email) {
				errors.email = 'Email é obrigatório';
			} else if (!/\S+@\S+\.\S+/.test(values.email)) {
				errors.email = 'Email inválido';
			}

			return errors;
		},
		onSubmit: async (values) => {
			try {
				setIsLoading(true);

				if (isNewUser) {
					const createData: CreateUserData = {
						name: values.name,
						email: values.email,
					};
					await userService.createUser(createData);
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Info' size='lg' className='me-1' />
							<span>Sucesso</span>
						</span>,
						'Usuário criado com sucesso',
						'success',
					);
				} else {
					const updateData: UpdateUserData = {
						name: values.name,
						email: values.email,
						role: user?.role || 'USER',
						active: values.active,
					};
					await userService.updateUser(id, updateData);
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Info' size='lg' className='me-1' />
							<span>Sucesso</span>
						</span>,
						'Usuário atualizado com sucesso',
						'success',
					);
				}

				// Reset do formulário após salvar
				formik.resetForm();
				setIsOpen(false);
				if (onSuccess) {
					onSuccess();
				}
			} catch (error) {
				showNotification(
					<span className='d-flex align-items-center'>
						<Icon icon='Error' size='lg' className='me-1' />
						<span>Erro</span>
					</span>,
					error instanceof Error ? error.message : 'Erro ao salvar usuário',
					'danger',
				);
			} finally {
				setIsLoading(false);
			}
		},
	});

	if (!isOpen) return null;

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id={id}>
					{isNewUser ? 'Novo Usuário' : user?.name || 'Editar Usuário'}
				</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				{isLoading && !user && !isNewUser ? (
					<div className='text-center py-4'>
						<Icon icon='Refresh' size='3x' className='spinner-border' />
						<p className='mt-2'>Carregando...</p>
					</div>
				) : (
					<div className='row g-4'>
						<FormGroup id='name' label='Nome' className='col-12'>
							<Input
								onChange={formik.handleChange}
								value={formik.values.name}
								isTouched={formik.touched.name}
								invalidFeedback={formik.errors.name}
								isValid={formik.isValid}
							/>
						</FormGroup>
						<FormGroup id='email' label='Email' className='col-12'>
							<Input
								type='email'
								onChange={formik.handleChange}
								value={formik.values.email}
								isTouched={formik.touched.email}
								invalidFeedback={formik.errors.email}
								isValid={formik.isValid}
							/>
						</FormGroup>
						{!isNewUser && (
							<FormGroup className='col-12'>
								<Label htmlFor='active'>Status</Label>
								<Checks
									type='switch'
									id='active'
									label='Usuário ativo'
									name='active'
									onChange={formik.handleChange}
									checked={formik.values.active}
								/>
							</FormGroup>
						)}
					</div>
				)}
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='link' onClick={() => setIsOpen(false)}>
					Cancelar
				</Button>
				<Button color='primary' onClick={formik.handleSubmit} isDisable={isLoading}>
					{isLoading ? 'Salvando...' : isNewUser ? 'Criar' : 'Salvar'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default UserFormModal;
