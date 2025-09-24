import { Store } from 'react-notifications-component';
import React from 'react';

const showNotification = (
	title: string | React.ReactElement,
	message: string | React.ReactElement,
	type = 'default',
) => {
	Store.addNotification({
		title,
		message,
		// @ts-ignore
		type,
		insert: 'top',
		container: 'top-right',
		animationIn: ['animate__animated', 'animate__fadeIn'],
		animationOut: ['animate__animated', 'animate__fadeOut'],
		dismiss: {
			duration: 5000,
			pauseOnHover: true,
			onScreen: true,
			showIcon: true,
			waitForAnimation: true,
		},
	});
};

export default showNotification;
