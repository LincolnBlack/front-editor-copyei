import React, { useState } from 'react';
import classNames from 'classnames';
import { superAdminPagesMenu } from '../../menu';
import Collapse from '../../components/bootstrap/Collapse';
import Icon from '../../components/icon/Icon';
import Navigation from '../Navigation/Navigation';

const SuperAdmin = () => {
	const [superAdmin, setSuperAdmin] = useState(false);

	const [collapseStatus, setCollapseStatus] = useState<boolean>(false);

	return (
		<>
			<div
				className={classNames('super-admin', { open: collapseStatus })}
				role='presentation'
				onClick={() => {
					setCollapseStatus(!collapseStatus);
					setSuperAdmin(!superAdmin);
				}}>
				<div className='d-flex align-items-center justify-content-between w-100'>
					<span className='navigation-link-info'>
						<Icon icon='AdminPanelSettings' className='navigation-icon' />
						<span className='navigation-text'>Super Admin</span>
					</span>
					<span className='navigation-link-extra'>
						<Icon
							icon='Circle'
							className={classNames(
								'navigation-notification',
								superAdmin ? 'text-success' : 'text-warning',
								'animate__animated animate__heartBeat animate__infinite animate__slower',
							)}
						/>
					</span>
				</div>
			</div>

			<Collapse isOpen={collapseStatus} className='super-admin-menu'>
				<Navigation menu={superAdminPagesMenu} id='aside-super-admin' />
			</Collapse>
		</>
	);
};

export default SuperAdmin;
