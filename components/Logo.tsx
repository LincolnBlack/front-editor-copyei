import Image from 'next/image';
import React, { FC } from 'react';
import LOGO_IMAGE from '../assets/img/logo.svg';

interface ILogoProps {
	width?: number;
	height?: number;
	invert?: boolean;
}
const Logo: FC<ILogoProps> = ({ width = 500, height = 240, invert = false }) => {
	return (
		<>
			<Image 
				src={LOGO_IMAGE} 
				alt='Logo' 
				width={width} 
				height={height}
				style={{
					filter: invert ? 'invert(1)' : 'none'
				}}
			/>
		</>
	);
};

export default Logo;
