import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader, CardTitle } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Input from '../../components/bootstrap/forms/Input';
import Label from '../../components/bootstrap/forms/Label';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Alert from '../../components/bootstrap/Alert';
import Spinner from '../../components/bootstrap/Spinner';
import authService, {
	User,
	UpdateProfileCredentials,
	ChangePasswordCredentials,
} from '../../services/authService';

const ProfilePage = () => {
	const [activeTab, setActiveTab] = useState('profile');
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [updatingProfile, setUpdatingProfile] = useState(false);
	const [changingPassword, setChangingPassword] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
		null,
	);

	// Estados para o formulário de perfil
	const [profileForm, setProfileForm] = useState({
		name: '',
		email: '',
	});

	// Estados para o formulário de senha
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	useEffect(() => {
		loadUserData();
	}, []);

	const loadUserData = async () => {
		try {
			const userData = await authService.getMe();
			setUser(userData);
			setProfileForm({
				name: userData.name,
				email: userData.email,
			});
		} catch (error) {
			console.error('Erro ao carregar dados do usuário:', error);
			setMessage({ type: 'error', text: 'Erro ao carregar dados do usuário' });
		} finally {
			setLoading(false);
		}
	};

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setUpdatingProfile(true);
		setMessage(null);

		try {
			const credentials: UpdateProfileCredentials = {};
			if (profileForm.name !== user?.name) credentials.name = profileForm.name;
			if (profileForm.email !== user?.email) credentials.email = profileForm.email;

			if (Object.keys(credentials).length === 0) {
				setMessage({ type: 'error', text: 'Nenhuma alteração foi feita' });
				return;
			}

			const updatedUser = await authService.updateProfile(credentials);
			setUser(updatedUser);
			setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
		} catch (error) {
			console.error('Erro ao atualizar perfil:', error);
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
			});
		} finally {
			setUpdatingProfile(false);
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setChangingPassword(true);
		setMessage(null);

		// Validações
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setMessage({ type: 'error', text: 'As senhas não coincidem' });
			setChangingPassword(false);
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
			setChangingPassword(false);
			return;
		}

		try {
			const credentials: ChangePasswordCredentials = {
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
			};

			await authService.changePassword(credentials);
			setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });

			// Limpar formulário de senha
			setPasswordForm({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (error) {
			console.error('Erro ao alterar senha:', error);
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Erro ao alterar senha',
			});
		} finally {
			setChangingPassword(false);
		}
	};

	if (loading) {
		return (
			<div
				className='d-flex justify-content-center align-items-center'
				style={{ minHeight: '400px' }}>
				<Spinner color='primary' />
			</div>
		);
	}

	return (
		<div className='container-fluid'>
			<div className='row'>
				<div className='col-md-6'>
					<Card>
						<CardHeader>
							<CardTitle>Perfil do Usuário</CardTitle>
						</CardHeader>
						<CardBody>
							{message && (
								<Alert
									color={message.type === 'success' ? 'primary' : 'danger'}
									className='mb-3 text-white font-weight-bold'>
									{message.text}
								</Alert>
							)}

							{/* Tabs Navigation */}
							<ul className='nav nav-tabs' role='tablist'>
								<li className='nav-item' role='presentation'>
									<button
										className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
										type='button'
										role='tab'
										onClick={() => setActiveTab('profile')}>
										Informações pessoais
									</button>
								</li>
								<li className='nav-item' role='presentation'>
									<button
										className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
										type='button'
										role='tab'
										onClick={() => setActiveTab('password')}>
										Alterar senha
									</button>
								</li>
							</ul>

							{/* Tab Content */}
							<div className='tab-content mt-3'>
								{activeTab === 'profile' && (
									<div className='tab-pane fade show active'>
										<form onSubmit={handleProfileSubmit}>
											<FormGroup>
												<Label htmlFor='name'>Nome</Label>
												<Input
													id='name'
													type='text'
													value={profileForm.name}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) =>
														setProfileForm({
															...profileForm,
															name: e.target.value,
														})
													}
													required
												/>
											</FormGroup>

											<FormGroup>
												<Label htmlFor='email'>Email</Label>
												<Input
													id='email'
													type='email'
													value={profileForm.email}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) =>
														setProfileForm({
															...profileForm,
															email: e.target.value,
														})
													}
													required
												/>
											</FormGroup>

											<Button
												type='submit'
												color='primary'
												isDisable={updatingProfile}
												className='mt-3'>
												{updatingProfile ? (
													<>
														<Spinner size='sm' className='me-2' />
														Atualizando...
													</>
												) : (
													'Atualizar perfil'
												)}
											</Button>
										</form>
									</div>
								)}

								{activeTab === 'password' && (
									<div className='tab-pane fade show active'>
										<form onSubmit={handlePasswordSubmit}>
											<FormGroup>
												<Label htmlFor='currentPassword'>Senha atual</Label>
												<Input
													id='currentPassword'
													type='password'
													value={passwordForm.currentPassword}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) =>
														setPasswordForm({
															...passwordForm,
															currentPassword: e.target.value,
														})
													}
													required
												/>
											</FormGroup>

											<FormGroup>
												<Label htmlFor='newPassword'>Nova senha</Label>
												<Input
													id='newPassword'
													type='password'
													value={passwordForm.newPassword}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) =>
														setPasswordForm({
															...passwordForm,
															newPassword: e.target.value,
														})
													}
													required
												/>
											</FormGroup>

											<FormGroup>
												<Label htmlFor='confirmPassword'>
													Confirmar nova senha
												</Label>
												<Input
													id='confirmPassword'
													type='password'
													value={passwordForm.confirmPassword}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) =>
														setPasswordForm({
															...passwordForm,
															confirmPassword: e.target.value,
														})
													}
													required
												/>
											</FormGroup>

											<Button
												type='submit'
												color='primary'
												isDisable={changingPassword}
												className='mt-3'>
												{changingPassword ? (
													<>
														<Spinner size='sm' className='me-2' />
														Alterando...
													</>
												) : (
													'Alterar senha'
												)}
											</Button>
										</form>
									</div>
								)}
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
