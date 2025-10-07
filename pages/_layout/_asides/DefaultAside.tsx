import React, { useContext } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../../layout/Navigation/Navigation';
import ThemeContext from '../../../context/themeContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import { useUser } from '../../../hooks/useUser';
import { dashboardPagesMenu } from '../../../menu';
import { adminPagesMenu } from '../../../menu';
import User from '../../../layout/User/User';

const DefaultAside = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);
	const { isAdmin } = useUser();

	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				<NavigationLine />
				<Navigation menu={dashboardPagesMenu} id='aside-dashboard' />
				{isAdmin && (
					<>
						<NavigationLine />
						<h6 className='navigation-title'>ADMIN</h6>
						<Navigation menu={adminPagesMenu} id='aside-admin' />
					</>
				)}
				<NavigationLine />
			</AsideBody>
			<AsideFoot>
				<User />
			</AsideFoot>
		</Aside>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default DefaultAside;
