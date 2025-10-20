import React, { useState, useRef } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from './bootstrap/Modal';
import Button from './bootstrap/Button';
import Input from './bootstrap/forms/Input';
import Icon from './icon/Icon';
import templateService, { UploadTemplateData } from '../services/templateService';

interface UploadHtmlModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const UploadHtmlModal: React.FC<UploadHtmlModalProps> = ({ isOpen, onClose, onSuccess }) => {
	const [title, setTitle] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragOver, setIsDragOver] = useState<boolean>(false);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Função para gerar subdomínio a partir do título
	const generateSubdomain = (title: string): string => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
			.replace(/\s+/g, '-') // Substitui espaços por hífens
			.replace(/-+/g, '-') // Remove hífens duplicados
			.replace(/^-|-$/g, ''); // Remove hífens do início e fim
	};

	// Função para lidar com mudança no input de título
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	};

	// Função para lidar com seleção de arquivo
	const handleFileSelect = (file: File) => {
		// Verificar se é um arquivo HTML
		if (file.type === 'text/html' || file.name.toLowerCase().endsWith('.html')) {
			setSelectedFile(file);
		} else {
			alert('Por favor, selecione apenas arquivos HTML (.html)');
		}
	};

	// Função para lidar com mudança no input de arquivo
	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	// Função para lidar com drag and drop
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	// Função para abrir seletor de arquivo
	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	// Função para remover arquivo selecionado
	const handleRemoveFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Função para enviar o formulário
	const handleSubmit = async () => {
		if (!title.trim()) {
			alert('Por favor, digite o nome da página');
			return;
		}

		if (!selectedFile) {
			alert('Por favor, selecione um arquivo HTML');
			return;
		}

		try {
			setIsUploading(true);

			const uploadData: UploadTemplateData = {
				title: title.trim(),
				htmlFile: selectedFile,
				subdomain: generateSubdomain(title.trim()),
				ownDomain: false,
				typeCreation: 'UPLOAD',
			};

			await templateService.uploadTemplate(uploadData);

			alert('Página importada com sucesso!');
			handleClose();
			onSuccess();
		} catch (error) {
			console.error('Erro ao fazer upload:', error);
			alert('Erro ao importar página. Tente novamente.');
		} finally {
			setIsUploading(false);
		}
	};

	// Função para fechar o modal
	const handleClose = () => {
		setTitle('');
		setSelectedFile(null);
		setIsDragOver(false);
		setIsUploading(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' titleId='upload-html-modal'>
			<ModalHeader>
				<h5 className='modal-title'>Importar página HTML</h5>
			</ModalHeader>
			<ModalBody>
				<div className='row g-3'>
					{/* Campo de nome da página */}
					<div className='col-12'>
						<label htmlFor='page-title' className='form-label'>
							Nome da página
						</label>
						<Input
							id='page-title'
							type='text'
							placeholder='Digite o nome da sua página'
							value={title}
							onChange={handleTitleChange}
							disabled={isUploading}
						/>
						{title && (
							<small className='text-muted'>
								Subdomínio gerado: {generateSubdomain(title)}
							</small>
						)}
					</div>

					{/* Área de upload de arquivo */}
					<div className='col-12'>
						<label className='form-label'>Arquivo HTML</label>
						<div
							className={`border-2 border-dashed rounded p-4 text-center ${
								isDragOver ? 'border-primary bg-light' : 'border-secondary'
							} ${isUploading ? 'opacity-50' : ''}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
							onClick={isUploading ? undefined : handleClickUpload}>
							{selectedFile ? (
								<div>
									<Icon
										icon='CheckCircle'
										size='2x'
										className='text-success mb-2'
									/>
									<p className='mb-2'>
										<strong>Arquivo selecionado:</strong>
									</p>
									<p className='text-muted mb-3'>{selectedFile.name}</p>
									<Button
										color='danger'
										size='sm'
										isLight
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveFile();
										}}
										disabled={isUploading}>
										<Icon icon='Delete' size='sm' className='me-1' />
										Remover arquivo
									</Button>
								</div>
							) : (
								<div>
									<Icon
										icon='CloudUpload'
										size='2x'
										className='text-muted mb-2'
									/>
									<p className='mb-2'>
										<strong>Arraste e solte seu arquivo HTML aqui</strong>
									</p>
									<p className='text-muted mb-3'>ou</p>
									<Button color='primary' isLight disabled={isUploading}>
										<Icon icon='UploadFile' size='sm' className='me-1' />
										Selecionar arquivo
									</Button>
									<p className='text-muted mt-2 small'>
										Apenas arquivos .html são aceitos
									</p>
								</div>
							)}
						</div>
						<input
							ref={fileInputRef}
							type='file'
							accept='.html,text/html'
							onChange={handleFileInputChange}
							style={{ display: 'none' }}
							disabled={isUploading}
						/>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={handleClose} isDisable={isUploading}>
					Cancelar
				</Button>
				<Button
					color='primary'
					onClick={handleSubmit}
					isDisable={isUploading || !title.trim() || !selectedFile}>
					{isUploading ? (
						<>
							<span className='spinner-border spinner-border-sm me-2' role='status' />
							Enviando...
						</>
					) : (
						<>
							<Icon icon='Send' size='sm' className='me-1' />
							Enviar página
						</>
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default UploadHtmlModal;
