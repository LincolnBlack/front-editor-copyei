import React, { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from './bootstrap/Modal';
import Input from './bootstrap/forms/Input';
import Button from './bootstrap/Button';
import templateService, { CloneTemplateData } from '../services/templateService';

interface ClonePageModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const ClonePageModal: React.FC<ClonePageModalProps> = ({ isOpen, onClose, onSuccess }) => {
	const [cloneTitle, setCloneTitle] = useState<string>('');
	const [cloneUrl, setCloneUrl] = useState<string>('');
	const [cloneLoading, setCloneLoading] = useState<boolean>(false);

	const handleClose = () => {
		setCloneTitle('');
		setCloneUrl('');
		setCloneLoading(false);
		onClose();
	};

	const handleCloneTemplate = async () => {
		if (!cloneTitle.trim() || !cloneUrl.trim()) {
			alert('Por favor, preencha todos os campos.');
			return;
		}

		try {
			setCloneLoading(true);

			const cloneData: CloneTemplateData = {
				title: cloneTitle.trim(),
				url: cloneUrl.trim(),
			};

			await templateService.cloneTemplate(cloneData);

			alert('Página clonada com sucesso!');
			handleClose();
			onSuccess();
		} catch (error) {
			console.error('Erro ao clonar template:', error);
			alert('Erro ao clonar página. Tente novamente.');
		} finally {
			setCloneLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' titleId='clone-page-modal'>
			<ModalHeader>
				<h5 className='modal-title'>Clonar página</h5>
			</ModalHeader>
			<ModalBody>
				<div className='mb-3'>
					<label htmlFor='clone-title' className='form-label'>
						Título da página
					</label>
					<Input
						id='clone-title'
						type='text'
						placeholder='Digite o título da sua nova página'
						value={cloneTitle}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setCloneTitle(e.target.value)
						}
					/>
				</div>
				<div className='mb-3'>
					<label htmlFor='clone-url' className='form-label'>
						URL da página
					</label>
					<Input
						id='clone-url'
						type='url'
						placeholder='https://exemplo.com/pagina'
						value={cloneUrl}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setCloneUrl(e.target.value)
						}
					/>
					<div className='form-text'>Digite a URL da página que você deseja copiar</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={handleClose} isDisable={cloneLoading}>
					Cancelar
				</Button>
				<Button
					color='success'
					onClick={handleCloneTemplate}
					isDisable={cloneLoading || !cloneTitle.trim() || !cloneUrl.trim()}>
					{cloneLoading ? (
						<>
							<span className='spinner-border spinner-border-sm me-2' role='status' />
							Clonando...
						</>
					) : (
						'Clonar'
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ClonePageModal;
