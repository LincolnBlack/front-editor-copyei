import Image from 'next/image';
import React, { FC } from 'react';
//import LOGO_IMAGE from '../assets/img/logo.svg';
import LOGO_IMAGE_INVERT from '../assets/img/logo/COPYEI_CORES_1.svg';
import LOGO_IMAGE from '../assets/img/logo/COPYEI_CORES_2.svg';
interface ILogoProps {
	width?: number;
	height?: number;
	invert?: boolean;
}
const Logo: FC<ILogoProps> = ({ width = 500, height = 240, invert = false }) => {
	return (
		<>
			<Image
				src={invert ? LOGO_IMAGE_INVERT : LOGO_IMAGE}
				alt='Logo'
				width={width}
				height={height}
			/>
		</>
	);
};

export default Logo;
