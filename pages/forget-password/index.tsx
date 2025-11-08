import React, { useCallback, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import useDarkMode from '../../hooks/useDarkMode';

import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Logo from '../../components/Logo';
import Button from '../../components/bootstrap/Button';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import Spinner from '../../components/bootstrap/Spinner';
import Icon from '../../components/icon/Icon';
import authService from '../../services/authService';

const ForgetPassword: NextPage = () => {
	const router = useRouter();
	const { darkModeStatus } = useDarkMode();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isEmailSent, setIsEmailSent] = useState<boolean>(false);

	const handleOnClick = useCallback(() => router.push('/login'), [router]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			email: '',
		},
		validate: (values) => {
			const errors: { email?: string } = {};

			if (!values.email) {
				errors.email = 'Email é obrigatório';
			} else if (!/\S+@\S+\.\S+/.test(values.email)) {
				errors.email = 'Email inválido';
			}

			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			// Validar formulário antes de submeter
			const errors = await formik.validateForm(values);
			if (Object.keys(errors).length > 0) {
				formik.setErrors(errors);
				return;
			}

			setIsLoading(true);
			try {
				await authService.requestPasswordReset({ email: values.email });
				setIsEmailSent(true);
			} catch (error) {
				if (error instanceof Error) {
					const errorMessage = error.message;
					formik.setFieldError('email', errorMessage);
				} else {
					const errorMessage = 'Erro ao enviar email de recuperação';
					formik.setFieldError('email', errorMessage);
				}
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<PageWrapper isProtected={false} className='bg-dark'>
			<Head>
				<title>Recuperar Senha</title>
			</Head>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='forget-password-page'>
							<CardBody>
								<div className='text-center my-5'>
									<Link
										href='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}>
										<div
											className={classNames(
												'd-flex align-items-center justify-content-center p-2 py-3 rounded-3 w-auto',
												{
													'bg-dark': !darkModeStatus,
													'bg-light': darkModeStatus,
												},
											)}>
											<Logo width={150} height={72} invert={true} />
										</div>
									</Link>
								</div>

								{!isEmailSent ? (
									<>
										<div className='text-center h1 fw-bold mt-5'>
											Esqueceu sua senha?
										</div>
										<div className='text-center h6 text-muted mb-5'>
											Digite seu email para receber um link de recuperação
										</div>

										<form
											className='row g-4'
											onSubmit={(e) => e.preventDefault()}>
											<div className='col-12'>
												<FormGroup
													id='email'
													isFloating
													label='Seu email'
													darkModeStatus={darkModeStatus}>
													<Input
														type='email'
														autoComplete='email'
														value={formik.values.email}
														isTouched={formik.touched.email}
														invalidFeedback={formik.errors.email}
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														onFocus={() => {
															formik.setErrors({});
														}}
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												<Button
													color='primary'
													className='w-100 py-3'
													type='button'
													onClick={(e: React.MouseEvent) => {
														e.preventDefault();
														e.stopPropagation();
														formik.handleSubmit();
													}}
													isDisable={isLoading}>
													{isLoading && (
														<Spinner isSmall inButton isGrow />
													)}
													Enviar Link de Recuperação
												</Button>
											</div>
										</form>
									</>
								) : (
									<>
										<div className='text-center h1 fw-bold mt-5'>
											Email Enviado!
										</div>
										<div className='text-center h6 text-muted mb-5'>
											Verifique sua caixa de entrada para o link de
											recuperação
										</div>
										<div className='text-center mb-4'>
											<Icon
												icon='MarkEmailRead'
												size='4x'
												color='success'
												className='mb-3'
											/>
										</div>
										<div className='col-12'>
											<Button
												color='primary'
												className='w-100 py-3'
												onClick={handleOnClick}>
												Voltar ao Login
											</Button>
										</div>
									</>
								)}

								{!isEmailSent && (
									<div className='text-center mt-4'>
										<Link
											href='/login'
											className={classNames('text-decoration-none', {
												'link-dark': !darkModeStatus,
												'link-light': darkModeStatus,
											})}>
											<Icon icon='ArrowBack' className='me-2' />
											Voltar ao Login
										</Link>
									</div>
								)}
							</CardBody>
						</Card>
						{/* <div className='text-center'>
							<Link
								href='/'
								className={classNames('text-decoration-none me-3', {
									'link-dark': !darkModeStatus,
									'link-light': darkModeStatus,
								})}>
								Privacy policy
							</Link>
							<Link
								href='/'
								className={classNames('text-decoration-none', {
									'link-dark': !darkModeStatus,
									'link-light': darkModeStatus,
								})}>
								Terms of use
							</Link>
						</div> */}
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export const getStaticProps: GetStaticProps = async () => ({
	props: {},
});

export default ForgetPassword;
