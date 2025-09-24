import React from 'react';
import Header, { HeaderLeft } from '../../../layout/Header/Header';
import CommonHeaderRight from './CommonHeaderRight';
import classNames from 'classnames';
import useDarkMode from '../../../hooks/useDarkMode';

const DefaultHeader = ({ title }: { title?: string }) => {
	const { darkModeStatus } = useDarkMode();

	return (
		<Header>
			<HeaderLeft>
				<div className='d-flex align-items-center'>
					<div className='row g-4'>
						<div className='col-md-auto'>
							<div
								className={classNames('fs-3', 'fw-bold', {
									'text-dark': !darkModeStatus,
								})}>
								{title || ''}
							</div>
						</div>
					</div>
				</div>
			</HeaderLeft>
			<CommonHeaderRight />
		</Header>
	);
};

export default DefaultHeader;
