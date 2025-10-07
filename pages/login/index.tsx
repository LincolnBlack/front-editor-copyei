import React, { FC, useCallback, useContext, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import AuthContext from '../../context/authContext';
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
import authService, { LoginCredentials } from '../../services/authService';

interface ILoginHeaderProps {
	isNewUser?: boolean;
}
const LoginHeader: FC<ILoginHeaderProps> = ({ isNewUser }) => {
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Crie sua conta,</div>
				<div className='text-center h4 text-muted mb-5'>Faça login para continuar!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Bem-vindo,</div>
			<div className='text-center h4 text-muted mb-5'>Faça login para continuar!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}
// eslint-disable-next-line react/prop-types
const Login: NextPage<ILoginProps> = ({ isSignUp }) => {
	const router = useRouter();

	const { setUser } = useContext(AuthContext);

	const { darkModeStatus } = useDarkMode();

	const [singUpStatus] = useState<boolean>(!!isSignUp);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const handleOnClick = useCallback(() => {
		// Verificar se há um parâmetro redirect na URL
		const redirectTo = router.query.redirect as string;
		if (redirectTo && redirectTo !== '/login') {
			router.push(redirectTo);
		} else {
			router.push('/');
		}
	}, [router]);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			loginEmail: '',
			loginPassword: '',
		},
		validate: (values) => {
			const errors: { loginEmail?: string; loginPassword?: string } = {};

			if (!values.loginEmail) {
				errors.loginEmail = 'Email é obrigatório';
			} else if (!/\S+@\S+\.\S+/.test(values.loginEmail)) {
				errors.loginEmail = 'Email inválido';
			}

			if (!values.loginPassword) {
				errors.loginPassword = 'Senha é obrigatória';
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
				const credentials: LoginCredentials = {
					email: values.loginEmail,
					password: values.loginPassword,
				};
				const response = await authService.login(credentials);
				if (response.user.email) {
					if (setUser) {
						setUser(response.user);
						handleOnClick();
						return;
					}
				}
			} catch (error) {
				if (error instanceof Error) {
					const errorMessage = error.message;
					formik.setFieldError('loginPassword', errorMessage);
				} else {
					const errorMessage = 'Erro ao fazer login';
					formik.setFieldError('loginPassword', errorMessage);
				}
				// Limpar a senha quando há erro
				formik.setFieldValue('loginPassword', '');
			} finally {
				setIsLoading(false);
			}
		},
	});

	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<PageWrapper
			isProtected={false}
			className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
			<Head>
				<title>{singUpStatus ? 'Sign Up' : 'Login'}</title>
			</Head>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
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
											<Logo width={180} height={90} invert={true} />
										</div>
									</Link>
								</div>

								<LoginHeader isNewUser={singUpStatus} />

								<form className='row g-4' onSubmit={(e) => e.preventDefault()}>
									{singUpStatus ? (
										<>
											<div className='col-12'>
												<FormGroup
													id='signup-email'
													isFloating
													label='Seu email'>
													<Input type='email' autoComplete='email' />
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-name'
													isFloating
													label='Seu nome'>
													<Input autoComplete='given-name' />
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-surname'
													isFloating
													label='Your surname'>
													<Input autoComplete='family-name' />
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-password'
													isFloating
													label='Password'>
													<Input
														type='password'
														autoComplete='password'
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												<Button
													color='info'
													className='w-100 py-3'
													onClick={handleOnClick}>
													Sign Up
												</Button>
											</div>
										</>
									) : (
										<>
											<div className='col-12'>
												<FormGroup
													id='loginEmail'
													isFloating
													label='Seu email'
													darkModeStatus={darkModeStatus}>
													<Input
														type='email'
														autoComplete='email'
														value={formik.values.loginEmail}
														isTouched={formik.touched.loginEmail}
														invalidFeedback={formik.errors.loginEmail}
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
												<div className='form-floating position-relative'>
													<Input
														id='loginPassword'
														type={showPassword ? 'text' : 'password'}
														autoComplete='current-password'
														value={formik.values.loginPassword}
														isTouched={formik.touched.loginPassword}
														invalidFeedback={
															formik.errors.loginPassword
														}
														isValid={
															formik.isValid &&
															!formik.errors.loginPassword
														}
														onChange={(e) => {
															formik.handleChange(e);
															formik.setErrors({});
														}}
														onBlur={formik.handleBlur}
														placeholder='Senha'
													/>
													<label
														htmlFor='loginPassword'
														className={classNames({
															'bg-transparent-after': darkModeStatus,
														})}>
														Senha
													</label>
													{!formik.errors.loginPassword && (
														<>
															<Icon
																icon={
																	showPassword
																		? 'VisibilityOff'
																		: 'Visibility'
																}
																className='position-absolute top-50 end-0 translate-middle-y me-3'
																onClick={togglePasswordVisibility}
																color='dark'
																size='lg'
																style={{
																	cursor: 'pointer',
																	zIndex: 10,
																}}
															/>
														</>
													)}
												</div>
											</div>
											<div className='col-12 text-end'>
												<Link href='/forget-password'>
													Esqueceu sua senha?
												</Link>
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
													Entrar
												</Button>
											</div>
										</>
									)}
								</form>
							</CardBody>
						</Card>
						{/* <div className='text-center'>
							<Link
								href='/'
								className={classNames('text-decoration-none me-3', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Privacy policy
							</Link>
							<Link
								href='/'
								className={classNames('link-light text-decoration-none', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Login;
