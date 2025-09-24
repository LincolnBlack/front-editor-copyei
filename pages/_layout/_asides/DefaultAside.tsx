import React, { useContext } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../../layout/Navigation/Navigation';
import User from '../../../layout/User/User';
import ThemeContext from '../../../context/themeContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import SuperAdmin from '../../../layout/SuperAdmin/SuperAdmin';
import { useUser } from '../../../hooks/useUser';
import { dashboardPagesMenu } from '../../../menu';

const DefaultAside = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);
	const { isSuperAdmin } = useUser();

	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				<NavigationLine />
				<Navigation menu={dashboardPagesMenu} id='aside-dashboard' />
				<NavigationLine />
			</AsideBody>
			<AsideFoot>
				{isSuperAdmin && <SuperAdmin />}
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
