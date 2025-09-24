import React from 'react';
import dynamic from 'next/dynamic';
import { authPages, demoPagesMenu, pageLayoutTypesPagesMenu } from '../menu';

const DefaultAside = dynamic(() => import('../pages/_layout/_asides/DefaultAside'));

const asides = [
	{ path: demoPagesMenu.login.path, element: null, exact: true },
	{ path: demoPagesMenu.loginAlt.path, element: null, exact: true },
	{ path: demoPagesMenu.signUp.path, element: null, exact: true },
	{ path: authPages.forgetPassword.path, element: null, exact: true },
	{ path: authPages.resetPassword.path, element: null, exact: true },
	{ path: authPages.passwordRecovery.path, element: null, exact: true },
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null, exact: true },
	{ path: '/*', element: <DefaultAside />, exact: true },
];

export default asides;
