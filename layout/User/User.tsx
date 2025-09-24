import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useWindowSize } from 'react-use';
import { authPages } from '../../menu';
import useDarkMode from '../../hooks/useDarkMode';
import Collapse from '../../components/bootstrap/Collapse';
import { NavigationLine } from '../Navigation/Navigation';
import Icon from '../../components/icon/Icon';
import useNavigationItemHandle from '../../hooks/useNavigationItemHandle';
import AuthContext from '../../context/authContext';

import ThemeContext from '../../context/themeContext';
import { getFirstLetter } from '../../helpers/helpers';

const User = () => {
	const { width } = useWindowSize();
	const { setAsideStatus } = useContext(ThemeContext);
	const { userData, setUser } = useContext(AuthContext);

	const router = useRouter();

	const handleItem = useNavigationItemHandle();
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();

	const [collapseStatus, setCollapseStatus] = useState<boolean>(false);

	return (
		<>
			<div
				className={classNames('user', { open: collapseStatus })}
				role='presentation'
				onClick={() => setCollapseStatus(!collapseStatus)}>
				<div className='user-avatar'>
					{userData?.name && (
						<div className='ratio ratio-1x1' style={{ width: 32 }}>
							<div
								className={`bg-l${
									darkModeStatus ? 'o25' : '25'
								}-primary text-primary rounded-2 d-flex align-items-center justify-content-center`}>
								<span className='fw-bold'>{getFirstLetter(userData?.name)}</span>
							</div>
						</div>
					)}
				</div>
				<div className='user-info'>
					<div className='user-name'>{userData?.name || 'Usuário'}</div>
					<div className='user-sub-title'>{userData?.email || ''}</div>
				</div>
			</div>

			<Collapse isOpen={collapseStatus} className='user-menu'>
				<nav aria-label='aside-bottom-user-menu'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() =>
								router.push(
									`/profile`,
									// @ts-ignore
									handleItem(),
								)
							}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='AccountBox' className='navigation-icon' />
									<span className='navigation-text'>Perfil do usuário</span>
								</span>
							</span>
						</div>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => {
								setDarkModeStatus(!darkModeStatus);
								handleItem();
							}}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon
										icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
										color={darkModeStatus ? 'info' : 'warning'}
										className='navigation-icon'
									/>
									<span className='navigation-text'>
										{darkModeStatus ? 'Modo Escuro' : 'Modo Claro'}
									</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
				<NavigationLine />
				<nav aria-label='aside-bottom-user-menu-2'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => {
								if (setUser) {
									setUser(null);
								}
								// Limpar token do localStorage
								localStorage.removeItem('jwt_token');
								if (
									width < Number(process.env.NEXT_PUBLIC_MOBILE_BREAKPOINT_SIZE)
								) {
									setAsideStatus(false);
								}
								router.push(`/${authPages.login.path}`);
							}}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='Logout' className='navigation-icon' />
									<span className='navigation-text'>Sair</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
			</Collapse>
		</>
	);
};

export default User;
