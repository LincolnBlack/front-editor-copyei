import React from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';

const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Head>
				<title>Example</title>
			</Head>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<h1>Example</h1>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale || 'pt', ['common', 'menu'])),
	},
});

export default Index;
