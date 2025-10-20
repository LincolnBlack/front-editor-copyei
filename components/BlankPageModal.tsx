import React, { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from './bootstrap/Modal';
import Button from './bootstrap/Button';
import Input from './bootstrap/forms/Input';

interface BlankPageModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreatePage: (pageName: string) => Promise<void>;
}

const BlankPageModal: React.FC<BlankPageModalProps> = ({ isOpen, onClose, onCreatePage }) => {
	const [pageName, setPageName] = useState<string>('');
	const [isCreating, setIsCreating] = useState<boolean>(false);

	const handleCreatePage = async () => {
		if (!pageName.trim()) {
			alert('Por favor, preencha o nome da página.');
			return;
		}

		setIsCreating(true);
		try {
			await onCreatePage(pageName.trim());
			handleClose();
		} catch (error) {
			console.error('Erro ao criar página:', error);
			alert('Erro ao criar página. Tente novamente.');
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		setPageName('');
		setIsCreating(false);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' titleId='blank-page-modal'>
			<ModalHeader>
				<h5 className='modal-title px-3 pt-3'>Criar Página em Branco</h5>
			</ModalHeader>
			<ModalBody>
				<div className='blank-page-content p-3 pt-0'>
					{/* Header modernizado */}
					<div
						className='blank-page-header'
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '1rem',
							padding: '1.5rem 0px',
							paddingTop: '0px',
							marginBottom: '2rem',
						}}>
						<div
							className='blank-page-icon'
							style={{
								width: '60px',
								height: '60px',
								borderRadius: '16px',
								background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontSize: '1.5rem',
								boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
							}}>
							<i className='fas fa-file-alt' />
						</div>
						<div className='blank-page-title'>
							<h4
								style={{
									color: '#6c757d',
									fontSize: '0.9rem',
									fontWeight: '500',
									margin: '0 0 0.25rem 0',
									textTransform: 'uppercase',
									letterSpacing: '0.5px',
								}}>
								Nova Página
							</h4>
							<h3
								style={{
									color: '#2d3748',
									fontSize: '1.5rem',
									fontWeight: '700',
									margin: '0',
									lineHeight: '1.2',
								}}>
								Página em Branco
							</h3>
						</div>
					</div>

					{/* Preview da página em branco */}
					<div
						className='blank-page-preview'
						style={{
							marginBottom: '2rem',
						}}>
						<div
							className='preview-container'
							style={{
								position: 'relative',
								width: '100%',
								height: '300px',
								background: 'white',
								borderRadius: '16px',
								border: '2px solid #e2e8f0',
								boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
								overflow: 'hidden',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '1rem',
							}}>
							{/* Simulação de uma página em branco */}
							<div
								style={{
									width: '100%',
									height: '100%',
									background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '1rem',
									position: 'relative',
								}}>
								{/* Ícone de página em branco */}
								<div
									style={{
										width: '80px',
										height: '80px',
										borderRadius: '12px',
										background: 'white',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: '#6c757d',
										fontSize: '2rem',
										boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
									}}>
									<i className='fas fa-file-alt' />
								</div>

								{/* Texto da página */}
								<div
									style={{
										textAlign: 'center',
										color: '#6c757d',
									}}>
									<h1
										style={{
											fontSize: '1.5rem',
											fontWeight: '600',
											margin: '0 0 0.5rem 0',
											color: '#495057',
										}}>
										Página em branco
									</h1>
									<p
										style={{
											fontSize: '0.9rem',
											margin: '0',
											opacity: '0.8',
										}}>
										Comece do zero e crie sua página personalizada
									</p>
								</div>

								{/* Linhas decorativas simulando conteúdo */}
								<div
									style={{
										width: '80%',
										display: 'flex',
										flexDirection: 'column',
										gap: '0.5rem',
									}}>
									<div
										style={{
											height: '4px',
											background:
												'linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 50%, #e2e8f0 100%)',
											borderRadius: '2px',
											opacity: '0.6',
										}}
									/>
									<div
										style={{
											height: '4px',
											background:
												'linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 30%, #e2e8f0 100%)',
											borderRadius: '2px',
											opacity: '0.4',
											width: '60%',
										}}
									/>
									<div
										style={{
											height: '4px',
											background:
												'linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 70%, #e2e8f0 100%)',
											borderRadius: '2px',
											opacity: '0.3',
											width: '40%',
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Descrição */}
					<div
						className='blank-page-description'
						style={{
							marginBottom: '2rem',
						}}>
						<h5
							style={{
								color: '#2d3748',
								fontSize: '1.1rem',
								fontWeight: '700',
								marginBottom: '1rem',
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem',
							}}>
							<span style={{ fontSize: '1.2rem' }}>📝</span>
							Sobre a Página em Branco
						</h5>
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
							Uma página em branco é perfeita para começar do zero. Você terá total
							liberdade para criar seu conteúdo personalizado usando nosso editor
							visual. Ideal para projetos únicos ou quando você quer ter controle
							total sobre o design.
						</p>
					</div>

					{/* Formulário */}
					<div className='blank-page-form'>
						<label
							htmlFor='blank-page-name'
							className='form-label'
							style={{
								color: '#2d3748',
								fontWeight: '600',
								fontSize: '1rem',
								marginBottom: '0.75rem',
								display: 'block',
							}}>
							Nome da página
						</label>
						<Input
							id='blank-page-name'
							type='text'
							value={pageName}
							placeholder='Digite o nome da página'
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setPageName(e.target.value)
							}
							style={{
								borderRadius: '12px',
								border: '2px solid #e2e8f0',
								padding: '0.75rem 1rem',
								fontSize: '1rem',
								transition: 'all 0.3s ease',
								width: '100%',
							}}
							onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
								e.target.style.borderColor = '#667eea';
								e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
								e.target.style.outline = 'none';
							}}
							onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
								e.target.style.borderColor = '#e2e8f0';
								e.target.style.boxShadow = 'none';
							}}
						/>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={handleClose} isDisable={isCreating}>
					Cancelar
				</Button>
				<Button
					color='primary'
					onClick={handleCreatePage}
					isDisable={isCreating || !pageName.trim()}>
					{isCreating ? (
						<>
							<span className='spinner-border spinner-border-sm me-2' role='status' />
							Criando...
						</>
					) : (
						'Criar Página'
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default BlankPageModal;
