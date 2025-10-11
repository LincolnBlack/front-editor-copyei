import React from 'react';
import { authPages, dashboardPagesMenu, demoPagesMenu, pageLayoutTypesPagesMenu } from '../menu';
import DefaultHeader from '../pages/_layout/_headers/DefaultHeader';

const headers = [
	{ path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlySubheader.path, element: null },
	{ path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlyContent.path, element: null },
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null },
	{ path: demoPagesMenu.login.path, element: null },
	{ path: demoPagesMenu.loginAlt.path, element: null },
	{ path: demoPagesMenu.signUp.path, element: null },
	{ path: authPages.forgetPassword.path, element: null },
	{ path: authPages.resetPassword.path, element: null },
	{ path: authPages.passwordRecovery.path, element: null },
	{ path: demoPagesMenu.page404.path, element: null },
	{ path: dashboardPagesMenu.pages.path, element: <DefaultHeader title='Páginas' /> },
	{
		path: dashboardPagesMenu.dashboard.path,
		element: <DefaultHeader title='Páginas publicadas' />,
	},
	{
		path: `/*`,
		element: <DefaultHeader />,
	},
];

export default headers;
