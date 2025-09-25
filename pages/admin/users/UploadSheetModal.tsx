import React, { useState, useRef } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../../components/bootstrap/Modal';
import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import userService from '../../../services/userService';

interface UploadSheetModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	onSuccess: () => void;
}

const UploadSheetModal: React.FC<UploadSheetModalProps> = ({
	isOpen,
	setIsOpen,
	onSuccess,
}) => {
	const [file, setFile] = useState<File | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClose = () => {
		setFile(null);
		setIsDragOver(false);
		setUploading(false);
		setIsOpen(false);
	};

	const handleFileSelect = (selectedFile: File) => {
		const allowedTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
			'application/vnd.ms-excel', // .xls
			'text/csv', // .csv
		];

		const allowedExtensions = ['.xlsx', '.xls', '.csv'];
		const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

		if (allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension)) {
			setFile(selectedFile);
		} else {
			alert('Formato de arquivo não suportado. Use XLSX, XLS ou CSV.');
		}
	};

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
		
		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile) {
			handleFileSelect(droppedFile);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			handleFileSelect(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		try {
			setUploading(true);
			
			const result = await userService.uploadUsersFromSheet(file);
			
			console.log('Upload realizado com sucesso:', result);
			alert(`Upload concluído! ${result.created} usuários criados.`);
			
			onSuccess();
			handleClose();
		} catch (error) {
			console.error('Erro no upload:', error);
			alert('Erro ao fazer upload da planilha. Tente novamente.');
		} finally {
			setUploading(false);
		}
	};

	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={handleClose}
			size='lg'
			titleId='upload-sheet-modal'>
			<ModalHeader>
				<h5 className='modal-title'>Upload de Planilha</h5>
			</ModalHeader>
			<ModalBody>
				<div className='mb-3'>
					<div
						className={`border-2 border-dashed rounded p-4 text-center ${
							isDragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary bg-light'
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={handleClickUpload}
						style={{ 
							cursor: 'pointer',
							backgroundColor: isDragOver ? 'rgba(13, 110, 253, 0.1)' : '#000000',
							borderColor: isDragOver ? '#0d6efd' : '#6c757d',
							borderStyle: 'dashed',
							borderWidth: '2px'
						}}>
						<input
							ref={fileInputRef}
							type='file'
							accept='.xlsx,.xls,.csv'
							onChange={handleFileInputChange}
							style={{ display: 'none' }}
						/>
						<Icon
							icon='CloudUpload'
							size='3x'
							className='text-muted mb-3'
						/>
						<div className='h5 mb-2'>
							{file ? file.name : 'Clique ou arraste o arquivo'}
						</div>
						<div className='text-muted'>
							Formatos suportados: Apenas o formato XLSX é suportado.	
						</div>
					</div>
				</div>
				
				<div className='alert alert-primary text-white'>
					<Icon icon='Lightbulb' className='me-2' />
					<strong>Instruções:</strong> &nbsp; A planilha deve conter as colunas <code className='px-2 fw-bold fs-6 text-info'>nome</code> e <code className='px-2 fw-bold fs-6 text-info'>email</code>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={handleClose} isDisable={uploading}>
					Cancelar
				</Button>
				<Button 
					color='primary' 
					onClick={handleUpload} 
					isDisable={!file || uploading}
					icon={uploading ? undefined : 'Upload'}>
					{uploading ? (
						<>
							<span
								className='spinner-border spinner-border-sm me-2'
								role='status'
							/>
							Fazendo upload...
						</>
					) : (
						'Fazer upload'
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default UploadSheetModal;
