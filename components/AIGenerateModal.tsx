import React, { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from './bootstrap/Modal';
import Input from './bootstrap/forms/Input';
import Textarea from './bootstrap/forms/Textarea';
import Button from './bootstrap/Button';
import templateService, { GenerateTemplateData } from '../services/templateService';

interface AIGenerateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose, onSuccess }) => {
	const [title, setTitle] = useState<string>('');
	const [prompt, setPrompt] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [generating, setGenerating] = useState<boolean>(false);
	const [generatedTemplateId, setGeneratedTemplateId] = useState<string | null>(null);

	const handleClose = () => {
		setTitle('');
		setPrompt('');
		setLoading(false);
		setGenerating(false);
		setGeneratedTemplateId(null);
		onClose();
	};

	const pollTemplateStatus = async (templateId: string): Promise<void> => {
		const maxAttempts = 90; // 90 segundos
		let attempts = 0;

		const poll = async (): Promise<void> => {
			try {
				attempts++;
				const template = await templateService.getTemplateById(templateId);

				if (template.status === 'PUBLIC') {
					// Sucesso! Template está pronto
					alert('Página gerada com sucesso!');
					setGenerating(false);
					handleClose();
					onSuccess();
					return;
				}

				if (attempts >= maxAttempts) {
					// Timeout
					setGenerating(false);
					alert(
						'Timeout: A geração da página está demorando mais que o esperado. Tente novamente.',
					);
					return;
				}

				// Continua polling
				setTimeout(poll, 1000);
			} catch (error) {
				console.error('Erro ao verificar status do template:', error);
				setGenerating(false);
				alert('Erro ao verificar status da geração. Tente novamente.');
			}
		};

		poll();
	};

	const handleGenerateTemplate = async () => {
		if (!title.trim() || !prompt.trim()) {
			alert('Por favor, preencha todos os campos.');
			return;
		}

		try {
			setLoading(true);

			const generateData: GenerateTemplateData = {
				title: title.trim(),
				prompt: prompt.trim(),
			};

			const response = await templateService.generateTemplate(generateData);

			// Verifica se retornou com status DRAFT
			if (response.status === 'DRAFT') {
				setLoading(false);
				setGenerating(true);
				setGeneratedTemplateId(response.id.toString());
				// Inicia o polling
				await pollTemplateStatus(response.id.toString());
			} else {
				// Se não retornou DRAFT, considera como sucesso imediato
				alert('Página gerada com sucesso!');
				handleClose();
				onSuccess();
			}
		} catch (error) {
			console.error('Erro ao gerar template:', error);
			alert('Erro ao gerar página. Tente novamente.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' titleId='ai-generate-modal'>
			<ModalHeader>
				<h5 className='modal-title'>Gerar página com IA</h5>
			</ModalHeader>
			<ModalBody>
				{generating ? (
					<div className='text-center py-4'>
						<div className='spinner-border text-primary mb-3' role='status'>
							<span className='visually-hidden'>Gerando...</span>
						</div>
						<h5>Gerando página...</h5>
						<p className='text-muted'>
							A IA está criando sua página. Isso pode levar alguns segundos.
						</p>
						{generatedTemplateId && (
							<small className='text-muted'>
								ID do template: {generatedTemplateId}
							</small>
						)}
					</div>
				) : (
					<>
						<div className='mb-3'>
							<label htmlFor='ai-title' className='form-label'>
								Título da página
							</label>
							<Input
								id='ai-title'
								type='text'
								placeholder='Digite o título da sua nova página'
								value={title}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setTitle(e.target.value)
								}
								disabled={loading}
							/>
						</div>
						<div className='mb-3'>
							<label htmlFor='ai-prompt' className='form-label'>
								Prompt para a IA
							</label>
							<Textarea
								id='ai-prompt'
								placeholder='Descreva o que você quer que a IA crie para você...'
								value={prompt}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setPrompt(e.target.value)
								}
								rows={10}
								disabled={loading}
							/>
							<div className='form-text'>
								Seja específico sobre o que você quer: tipo de página, cores,
								layout, conteúdo, etc.
							</div>
						</div>
					</>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={handleClose} isDisable={loading || generating}>
					Cancelar
				</Button>
				{!generating && (
					<Button
						color='primary'
						onClick={handleGenerateTemplate}
						isDisable={loading || !title.trim() || !prompt.trim()}>
						{loading ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Enviando...
							</>
						) : (
							'Gerar com IA'
						)}
					</Button>
				)}
			</ModalFooter>
		</Modal>
	);
};

export default AIGenerateModal;
