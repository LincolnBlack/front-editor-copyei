import React from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Login from '../login';

const Index: NextPage = () => {
	return <Login isSignUp />;
};

export const getStaticProps: GetStaticProps = async () => ({
	props: {},
});});

export default Index;
