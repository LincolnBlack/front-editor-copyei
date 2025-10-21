import React from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from './bootstrap/Modal';
import Button from './bootstrap/Button';
import Card, { CardBody } from './bootstrap/Card';
import Icon from './icon/Icon';
import { usePermissions } from '../hooks/usePermissions';

interface NewPageOption {
	id: string;
	title: string;
	description: string;
	icon: string;
	color: string;
	borderColor: string;
	permission: string;
	onClick: () => void;
}

interface NewPageModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectOption: (optionId: string) => void;
}

const NewPageModal: React.FC<NewPageModalProps> = ({ isOpen, onClose, onSelectOption }) => {
	const { hasPermission } = usePermissions();

	// Lista de opções para criação de nova página
	const newPageOptions: NewPageOption[] = [
		{
			id: 'copy',
			title: 'Copiar uma página',
			description: 'Gostou de uma página na web? copie e use como base para sua nova página',
			icon: 'ContentCopy',
			color: 'text-success',
			borderColor: 'border-success',
			permission: 'clone_website',
			onClick: () => {
				onSelectOption('copy');
			},
		},
		{
			id: 'ai-generate',
			title: 'Gerar uma nova página IA',
			description:
				'Use a inteligência artificial da copyei para criar uma página personalizada para você',
			icon: 'AutoAwesome',
			color: 'text-primary',
			borderColor: 'border-primary',
			permission: 'generate_template',
			onClick: () => {
				onSelectOption('ai-generate');
			},
		},
		{
			id: 'template',
			title: 'Criar a partir de um template pronto',
			description:
				'Escolha entre vários templates que já foram testados e aprovados e faça a sua customização',
			icon: 'FolderMatch',
			color: 'text-info',
			borderColor: 'border-info',
			permission: 'drag_and_drop_template',
			onClick: () => {
				onSelectOption('template');
			},
		},
		{
			id: 'import-html',
			title: 'Importar uma página HTML',
			description: 'Tem uma página HTML? importe e use como base para sua nova página',
			icon: 'UploadFile',
			color: 'text-secondary',
			borderColor: 'border-secondary',
			permission: 'website_visits',
			onClick: () => {
				onSelectOption('import-html');
			},
		},
		{
			id: 'blank',
			title: 'Criar uma página em branco',
			description: 'Crie uma página em branco para você começar do zero',
			icon: 'AddBox',
			color: 'text-warning',
			borderColor: 'border-warning',
			permission: 'website_visits',
			onClick: () => {
				onSelectOption('blank');
			},
		},
	];

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} size='lg' titleId='new-page-modal'>
			<ModalHeader>
				<h5 className='modal-title p-3'>Criar nova página</h5>
			</ModalHeader>
			<ModalBody>
				<div className='row g-3 p-3'>
					{newPageOptions.map((option) => {
						const hasRequiredPermission = hasPermission(option.permission);

						return (
							<div key={option.id} className='col-md-6'>
								<div className='position-relative'>
									<Card
										className={`h-100 border-2 border-dashed ${option.borderColor} ${
											hasRequiredPermission ? 'cursor-pointer' : 'opacity-50'
										}`}
										onClick={
											hasRequiredPermission ? option.onClick : undefined
										}>
										<CardBody className='d-flex flex-column align-items-center text-center p-4'>
											<div className='mb-3'>
												<Icon
													icon={option.icon}
													size='3x'
													className={option.color}
												/>
											</div>
											<h6 className='fw-bold mb-2'>{option.title}</h6>
											<p className='text-muted mb-0 small'>
												{option.description}
											</p>
										</CardBody>
									</Card>

									{!hasRequiredPermission && (
										<div className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-90 rounded'>
											<div className='text-center p-3'>
												<Icon
													icon='Lock'
													size='2x'
													className='text-muted mb-2'
												/>
												<p className='text-muted mb-0 small fw-bold'>
													{option.title} não habilitada no seu plano
												</p>
												<p className='text-muted mb-0 small'>
													Libere essa função com um upgrade
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={onClose}>
					Cancelar
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default NewPageModal;
