import React from 'react';
import Spinner from './bootstrap/Spinner';

interface LoadingSpinnerProps {
	message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Carregando...' }) => {
	return (
		<div className='d-flex flex-column align-items-center justify-content-center min-vh-100'>
			<Spinner isGrow size='3rem' />
			<p className='mt-3 text-muted'>{message}</p>
		</div>
	);
};

export default LoadingSpinner;
