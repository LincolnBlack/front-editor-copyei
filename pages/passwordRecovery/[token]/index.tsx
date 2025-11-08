import React, { useCallback, useState } from 'react';
import type { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import useDarkMode from '../../../hooks/useDarkMode';

import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Logo from '../../../components/Logo';
import Button from '../../../components/bootstrap/Button';
import Input from '../../../components/bootstrap/forms/Input';
import Spinner from '../../../components/bootstrap/Spinner';
import Icon from '../../../components/icon/Icon';
import authService from '../../../services/authService';

const PasswordRecovery: NextPage = () => {
	const router = useRouter();
	const token = typeof router.query.token === 'string' ? router.query.token : '';
	const { darkModeStatus } = useDarkMode();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isPasswordReset, setIsPasswordReset] = useState<boolean>(false);

	const handleOnClick = useCallback(() => router.push('/login'), [router]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			password: '',
			repeatPassword: '',
		},
		validate: (values) => {
			const errors: { password?: string; repeatPassword?: string } = {};

			if (!values.password) {
				errors.password = 'Senha é obrigatória';
			} else if (values.password.length < 6) {
				errors.password = 'Senha deve ter pelo menos 6 caracteres';
			} else if (values.password.length > 72) {
				errors.password = 'Senha deve ter no máximo 72 caracteres';
			} else if (!/^[a-zA-Z]/.test(values.password)) {
				errors.password = 'Senha deve ter uma letra';
			} else if (!/\d/.test(values.password)) {
				errors.password = 'Senha deve ter um número';
			} else if (!/[@.#$!%*?&^]/.test(values.password)) {
				errors.password = 'Senha deve ter um caractere especial';
			} else if (values.password !== values.repeatPassword) {
				errors.password = 'As senhas não coincidem';
			}

			if (!values.repeatPassword) {
				errors.repeatPassword = 'Confirmação de senha é obrigatória';
			} else if (values.password !== values.repeatPassword) {
				errors.repeatPassword = 'As senhas não coincidem';
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
				await authService.resetPassword(
					{
						token: token,
					},
					{
						password: values.password,
						repeatPassword: values.repeatPassword,
					},
				);
				setIsPasswordReset(true);
			} catch (error) {
				if (error instanceof Error) {
					const errorMessage = error.message;
					formik.setFieldError('password', errorMessage);
				} else {
					const errorMessage = 'Erro ao redefinir senha';
					formik.setFieldError('password', errorMessage);
				}
			} finally {
				setIsLoading(false);
			}
		},
	});

	// Se não há token, mostrar mensagem de erro
	if (router.isReady && !token) {
		return (
			<PageWrapper isProtected={false} className='bg-dark'>
				<Head>
					<title>Token Inválido</title>
				</Head>
				<Page className='p-0'>
					<div className='row h-100 align-items-center justify-content-center'>
						<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
							<Card className='shadow-3d-dark'>
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
														'': darkModeStatus,
													},
												)}>
												<Logo width={150} height={72} />
											</div>
										</Link>
									</div>
									<div className='text-center h1 fw-bold mt-5'>
										Token Inválido
									</div>
									<div className='text-center h6 text-muted mb-5'>
										O link de recuperação é inválido ou expirou
									</div>
									<div className='text-center mb-4'>
										<Icon
											icon='Error'
											size='4x'
											color='danger'
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
								</CardBody>
							</Card>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper isProtected={false} className='bg-dark'>
			<Head>
				<title>Redefinir Senha</title>
			</Head>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='reset-password-page'>
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
													'': darkModeStatus,
												},
											)}>
											<Logo width={150} height={72} invert={true} />
										</div>
									</Link>
								</div>

								{!isPasswordReset ? (
									<>
										<div className='text-center h1 fw-bold mt-5'>
											Redefinir Senha
										</div>
										<div className='text-center h6 text-muted mb-5'>
											Digite sua nova senha
										</div>

										<form
											className='row g-4'
											onSubmit={(e) => e.preventDefault()}>
											<div className='col-12'>
												<div className='form-floating position-relative'>
													<Input
														id='password'
														type='password'
														autoComplete='new-password'
														value={formik.values.password}
														isTouched={formik.touched.password}
														invalidFeedback={formik.errors.password}
														isValid={
															formik.isValid &&
															!formik.errors.password
														}
														onChange={(e) => {
															formik.handleChange(e);
															formik.setErrors({});
														}}
														onBlur={formik.handleBlur}
														placeholder='Nova senha'
													/>
													<label
														htmlFor='password'
														className={classNames({
															'label-dark-mode': darkModeStatus,
														})}>
														Nova senha
													</label>
												</div>
											</div>
											<div className='col-12'>
												<div className='form-floating position-relative'>
													<Input
														id='repeatPassword'
														type='password'
														autoComplete='new-password'
														value={formik.values.repeatPassword}
														isTouched={formik.touched.repeatPassword}
														invalidFeedback={
															formik.errors.repeatPassword
														}
														isValid={
															formik.isValid &&
															!formik.errors.repeatPassword
														}
														onChange={(e) => {
															formik.handleChange(e);
															formik.setErrors({});
														}}
														onBlur={formik.handleBlur}
														placeholder='Confirmar nova senha'
													/>
													<label
														htmlFor='repeatPassword'
														className={classNames({
															'label-dark-mode': darkModeStatus,
														})}>
														Confirmar nova senha
													</label>
												</div>
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
													Redefinir Senha
												</Button>
											</div>
										</form>
									</>
								) : (
									<>
										<div className='text-center h1 fw-bold mt-5'>
											Senha Redefinida!
										</div>
										<div className='text-center h6 text-muted mb-5'>
											Sua senha foi alterada com sucesso
										</div>
										<div className='text-center mb-4'>
											<Icon
												icon='CheckCircle'
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
												Fazer Login
											</Button>
										</div>
									</>
								)}

								{!isPasswordReset && (
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
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export const getServerSideProps: GetServerSideProps = async () => ({
	props: {},
});

export default PasswordRecovery;
