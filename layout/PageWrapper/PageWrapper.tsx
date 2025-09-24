import React, { forwardRef, ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { ISubHeaderProps } from '../SubHeader/SubHeader';
import { IPageProps } from '../Page/Page';
import AuthContext from '../../context/authContext';
import Mounted from '../../components/Mounted';
import { authPages } from '../../menu';
import { useRouter } from 'next/router';

interface IPageWrapperProps {
	isProtected?: boolean;
	children:
		| ReactElement<ISubHeaderProps>[]
		| ReactElement<IPageProps>
		| ReactElement<IPageProps>[];
	className?: string;
}
const PageWrapper = forwardRef<HTMLDivElement, IPageWrapperProps>(
	({ isProtected = true, className, children }, ref) => {
		const { user, isLoading } = useContext(AuthContext);
		const router = useRouter();
		useEffect(() => {
			if (isProtected && user === null && !isLoading) {
				router.push(`/${authPages.login.path}`);
			}
			return () => {};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [user, isLoading]);

		return (
			<div ref={ref} className={classNames('page-wrapper', 'container-fluid', className)}>
				<Mounted>{children}</Mounted>
			</div>
		);
	},
);
PageWrapper.displayName = 'PageWrapper';

export default PageWrapper;
