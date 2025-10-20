import React, { useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Input from '../../../components/bootstrap/forms/Input';
import Icon from '../../../components/icon/Icon';
import { useAdminAuth } from '../../../hooks/useAdminAuth';

interface WebhookParam {
	key: string;
	label: string;
	value: string;
	type: string;
	options?: Array<{
		value: string;
		label: string;
		description?: string;
	}>;
}

const Webhooks: NextPage = () => {
	const { loading: authLoading, isAuthorized } = useAdminAuth();
	const [params, setParams] = useState<WebhookParam[]>([
		{
			key: 'plan_type',
			label: 'Tipo do plano',
			value: 'anual',
			type: 'card-select',
			options: [
				{
					value: 'anual',
					label: 'Anual',
					description: 'Cobrança realizada uma vez por ano',
				},
				{
					value: 'mensal',
					label: 'Mensal',
					description: 'Cobrança realizada todo mês',
				},
			],
		},
		{
			key: 'daysUntilActivation',
			label: 'Dias para Ativação',
			value: '0',
			type: 'text',
		},
		{
			key: 'trigger',
			label: 'Evento Disparador',
			value: 'compra aprovada',
			type: 'select',
			options: [
				{ value: 'reembolso processado', label: 'Reembolso Processado' },
				{ value: 'compra aprovada', label: 'Compra Aprovada' },
				{ value: 'assinatura cancelada', label: 'Assinatura Cancelada' },
				{ value: 'assinatura atrasada', label: 'Assinatura Atrasada' },
				{ value: 'chargeback', label: 'Chargeback' },
			],
		},
	]);

	const [generatedUrl, setGeneratedUrl] = useState<string>('');
	const [baseUrl] = useState<string>(process.env.NEXT_PUBLIC_WEBHOOK_URL || '');

	const updateParam = (key: string, value: string) => {
		setParams((prev) => prev.map((param) => (param.key === key ? { ...param, value } : param)));
	};

	const generateUrl = () => {
		const queryParams = params.filter((param) => param.key && param.value);
		const queryString = queryParams
			.map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
			.join('&');

		setGeneratedUrl(`${baseUrl}?${queryString}`);
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(generatedUrl);
			// Aqui você pode adicionar uma notificação de sucesso
		} catch (err) {
			console.error('Erro ao copiar para a área de transferência:', err);
		}
	};

	const addDays = (days: number) => {
		const currentDays = parseInt(
			params.find((p) => p.key === 'daysUntilActivation')?.value || '0',
			10,
		);
		updateParam('daysUntilActivation', (currentDays + days).toString());
	};

	const clearDays = () => {
		updateParam('daysUntilActivation', '0');
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

	// Se não está autorizado, não renderiza nada
	if (!isAuthorized) {
		return null;
	}

	return (
		<PageWrapper>
			<Head>
				<title>Gerador de Webhook</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<h1 className='h4 mb-0'>Gerador de Webhook</h1>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='primary' onClick={generateUrl} icon='Send'>
						Gerar URL
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row'>
					<div className='col-12'>
						<Card>
							<CardBody>
								<h5 className='card-title mb-4'>Parâmetros do Webhook</h5>

								<div className='row g-4'>
									{/* Tipo do Plano */}
									<div className='col-md-4'>
										<h6 className='mb-3'>{params[0].label}</h6>
										<div className='d-flex flex-column gap-2'>
											{params[0].options?.map((option) => (
												<Card
													key={option.value}
													className={`cursor-pointer transition-all ${
														params[0].value === option.value
															? 'border-primary bg-light'
															: 'border-secondary'
													}`}
													onClick={() =>
														updateParam('plan_type', option.value)
													}
													style={{ cursor: 'pointer' }}>
													<CardBody className='p-3'>
														<div className='d-flex justify-content-between align-items-start'>
															<div>
																<h6 className='mb-1'>
																	{option.label}
																</h6>
																<small className='text-muted'>
																	{option.description}
																</small>
															</div>
															{params[0].value === option.value && (
																<Icon
																	icon='check'
																	className='text-primary'
																/>
															)}
														</div>
													</CardBody>
												</Card>
											))}
										</div>
									</div>

									{/* Evento Disparador */}
									<div className='col-md-4'>
										<h6 className='mb-3'>{params[2].label}</h6>
										<div className='d-flex flex-column gap-2'>
											{params[2].options?.map((option) => (
												<Card
													key={option.value}
													className={`cursor-pointer transition-all ${
														params[2].value === option.value
															? 'border-primary bg-light'
															: 'border-secondary'
													}`}
													onClick={() =>
														updateParam('trigger', option.value)
													}
													style={{ cursor: 'pointer' }}>
													<CardBody className='p-3'>
														<div className='d-flex justify-content-between align-items-center'>
															<span>{option.label}</span>
															{params[2].value === option.value && (
																<Icon
																	icon='check'
																	className='text-primary'
																/>
															)}
														</div>
													</CardBody>
												</Card>
											))}
										</div>
									</div>

									{/* Dias para Ativação */}
									<div className='col-md-4'>
										<h6 className='mb-3'>{params[1].label}</h6>
										<div className='d-flex flex-column gap-3'>
											<Input
												type='number'
												value={params[1].value}
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) =>
													updateParam(
														'daysUntilActivation',
														e.target.value,
													)
												}
												placeholder='0'
											/>

											<div className='d-flex gap-2'>
												<Button
													color='secondary'
													isOutline
													size='sm'
													onClick={() => addDays(7)}
													className='flex-fill'>
													+ 7
												</Button>
												<Button
													color='secondary'
													isOutline
													size='sm'
													onClick={() => addDays(14)}
													className='flex-fill'>
													+ 14
												</Button>
												<Button
													color='secondary'
													isOutline
													size='sm'
													onClick={() => addDays(21)}
													className='flex-fill'>
													+ 21
												</Button>
											</div>

											<div className='d-flex align-items-center gap-2'>
												<Button
													color='secondary'
													isOutline
													size='sm'
													onClick={() => addDays(-1)}
													className='px-3'>
													-
												</Button>
												<Button
													color='secondary'
													isOutline
													size='sm'
													onClick={() => addDays(1)}
													className='px-3'>
													+
												</Button>
												<Button
													color='danger'
													isOutline
													size='sm'
													onClick={clearDays}
													className='ms-auto'>
													<Icon icon='refresh' className='me-1' />
													LIMPAR
												</Button>
											</div>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>

						{/* URL Gerada */}
						{generatedUrl && (
							<Card className='mt-4'>
								<CardBody>
									<h6 className='card-title mb-3'>URL Gerada</h6>
									<div className='d-flex gap-2'>
										<Input
											value={generatedUrl}
											readOnly
											className='flex-grow-1'
										/>
										<Button
											color='success'
											onClick={copyToClipboard}
											title='Copiar para área de transferência'
											icon='Copy'>
											Copiar
										</Button>
									</div>
								</CardBody>
							</Card>
						)}
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Webhooks;
