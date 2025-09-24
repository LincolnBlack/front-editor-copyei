import React from 'react';
import { authPages, demoPagesMenu, pageLayoutTypesPagesMenu } from '../menu';
import DefaultFooter from '../pages/_layout/_footers/DefaultFooter';

const footers = [
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null, exact: true },
	{ path: demoPagesMenu.login.path, element: null, exact: true },
	{ path: demoPagesMenu.loginAlt.path, element: null, exact: true },
	{ path: demoPagesMenu.signUp.path, element: null, exact: true },
	{ path: authPages.forgetPassword.path, element: null, exact: true },
	{ path: authPages.resetPassword.path, element: null, exact: true },
	{ path: authPages.passwordRecovery.path, element: null, exact: true },
	{ path: demoPagesMenu.page404.path, element: null, exact: true },
	{ path: '/*', element: <DefaultFooter />, exact: true },
];

export default footers;
