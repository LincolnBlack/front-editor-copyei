import React, { cloneElement, FC, HTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import TagWrapper from '../../TagWrapper';
import Label from './Label';
import FormText from './FormText';

interface IFormGroupProps extends HTMLAttributes<HTMLElement> {
	children: ReactElement | ReactElement[];
	className?: string;
	labelClassName?: string;
	childWrapperClassName?: string;
	tag?: 'div' | 'section';
	isFloating?: boolean;
	id?: string;
	label?: string;
	size?: 'lg' | 'sm' | null;
	isHiddenLabel?: boolean;
	isColForLabel?: boolean;
	formText?: ReactNode;
	darkModeStatus?: boolean;
	name?: string;
}
const FormGroup: FC<IFormGroupProps> = ({
	children,
	tag = 'div',
	className,
	labelClassName,
	childWrapperClassName,
	label,
	id,
	isFloating,
	size,
	isColForLabel,
	isHiddenLabel,
	formText,
	darkModeStatus,
	...props
}) => {
	const LABEL = (
		<Label
			className={classNames(labelClassName, {
				'label-dark-mode': darkModeStatus,
			})}
			htmlFor={id}
			isHidden={isHiddenLabel}
			isColForLabel={isColForLabel}
			size={size}>
			{label}
		</Label>
	);

	const CHILDREN =
		id && !Array.isArray(children)
			? cloneElement(
					children as ReactElement,
					{
						id,
						size: size || ((children as ReactElement)?.props as any)?.size,
						placeholder: isFloating
							? label
							: ((children as ReactElement)?.props as any)?.placeholder,
						'aria-describedby': formText ? `${id}-text` : null,
					} as any,
				)
			: children;

	const FORM_TEXT = formText && <FormText id={`${id}-text`}>{formText}</FormText>;
	return (
		<TagWrapper
			tag={tag}
			className={classNames({ 'form-floating': isFloating, row: isColForLabel }, className)}
			// eslint-disable-next-line react/jsx-props-no-spreading
			{...props}>
			{label && !isFloating && LABEL}

			{childWrapperClassName ? (
				<div className={childWrapperClassName}>
					{CHILDREN}
					{FORM_TEXT}
				</div>
			) : (
				CHILDREN
			)}

			{label && isFloating && LABEL}

			{!childWrapperClassName && FORM_TEXT}
		</TagWrapper>
	);
};

export default FormGroup;
