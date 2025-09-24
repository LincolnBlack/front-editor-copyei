import React, { useContext, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/router';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import ThemeContext from '../context/themeContext';
import Page from '../layout/Page/Page';
import Alert from '../components/bootstrap/Alert';

const Index: NextPage = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	/**
	 * Tour Start
	 */
	const { setIsOpen } = useTour();

	// Verificar se há mensagem de erro na URL
	useEffect(() => {
		if (router.query.error === 'unauthorized') {
			setErrorMessage(
				'Você não tem permissão para acessar essa área. Apenas administradores podem acessar o painel administrativo.',
			);
			// Limpar o parâmetro da URL
			router.replace('/', undefined, { shallow: true });
		}
	}, [router]);

	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			localStorage.getItem('tourModalStarted') !== 'shown' &&
			!mobileDesign
		) {
			setTimeout(() => {
				setIsOpen(true);
				localStorage.setItem('tourModalStarted', 'shown');
			}, 3000);
		}
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<PageWrapper>
			<Head>
				<title>Dashboard Page</title>
			</Head>
			<Page>
				{errorMessage && (
					<Alert color='danger' className='mb-4'>
						{errorMessage}
					</Alert>
				)}
				<h1>Dashboard</h1>
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

export default Index;
