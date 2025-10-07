import React, { FC } from 'react';
import { CardFooter, CardFooterLeft, CardFooterRight } from './bootstrap/Card';
import Pagination, { PaginationItem } from './bootstrap/Pagination';
import Select from './bootstrap/forms/Select';
import Option from './bootstrap/Option';

export const PER_COUNT = {
	3: 3,
	5: 5,
	10: 10,
	25: 25,
	50: 50,
};

export const dataPagination = (data: any[], currentPage: number, perPage: number) =>
	data.filter(
		(i, index) => index + 1 > (currentPage - 1) * perPage && index + 1 <= currentPage * perPage,
	);

interface IPaginationButtonsProps {
	setCurrentPage(...args: unknown[]): unknown;
	currentPage: number;
	perPage: number;
	setPerPage(...args: unknown[]): unknown;
	data: unknown[];
	label?: string;
	totalItems?: number;
	totalPages?: number;
}
const PaginationButtons: FC<IPaginationButtonsProps> = ({
	setCurrentPage,
	currentPage,
	perPage,
	setPerPage,
	data,
	label = 'items',
	totalItems: externalTotalItems,
	totalPages: externalTotalPages,
}) => {
	const totalItems = externalTotalItems ?? data.length;
	const totalPage = externalTotalPages ?? Math.ceil(totalItems / perPage);

	const pagination = () => {
		const items: React.JSX.Element[] = [];

		// Se há apenas 1 página, não mostrar números
		if (totalPage <= 1) {
			return items;
		}

		// Determinar o range de páginas para mostrar
		const maxVisiblePages = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		const endPage = Math.min(totalPage, startPage + maxVisiblePages - 1);

		// Ajustar startPage se estivermos no final
		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		// Adicionar primeira página se não estiver no range
		if (startPage > 1) {
			items.push(
				<PaginationItem key={1} onClick={() => setCurrentPage(1)}>
					1
				</PaginationItem>,
			);
			if (startPage > 2) {
				items.push(
					<PaginationItem key='ellipsis1' onClick={() => setCurrentPage(startPage - 1)}>
						...
					</PaginationItem>,
				);
			}
		}

		// Adicionar páginas no range
		for (let i = startPage; i <= endPage; i++) {
			items.push(
				<PaginationItem
					key={i}
					isActive={i === currentPage}
					onClick={() => setCurrentPage(i)}>
					{i}
				</PaginationItem>,
			);
		}

		// Adicionar última página se não estiver no range
		if (endPage < totalPage) {
			if (endPage < totalPage - 1) {
				items.push(
					<PaginationItem key='ellipsis2' onClick={() => setCurrentPage(endPage + 1)}>
						...
					</PaginationItem>,
				);
			}
			items.push(
				<PaginationItem key={totalPage} onClick={() => setCurrentPage(totalPage)}>
					{totalPage}
				</PaginationItem>,
			);
		}

		return items;
	};

	const getInfo = () => {
		const start = perPage * (currentPage - 1) + 1;
		const end = Math.min(perPage * currentPage, totalItems);

		return (
			<span className='pagination__desc'>
				Mostrando {start} a {end} de {totalItems} {label}
			</span>
		);
	};

	return (
		<CardFooter>
			<CardFooterLeft>
				<span className='text-muted'>{getInfo()}</span>
			</CardFooterLeft>

			<CardFooterRight className='d-flex'>
				{totalPage > 1 && (
					<Pagination ariaLabel={label}>
						<PaginationItem
							isFirst
							isDisabled={currentPage === 1}
							onClick={() => setCurrentPage(1)}
						/>
						<PaginationItem
							isPrev
							isDisabled={currentPage === 1}
							onClick={() => setCurrentPage(currentPage - 1)}
						/>
						{pagination()}
						<PaginationItem
							isNext
							isDisabled={currentPage === totalPage}
							onClick={() => setCurrentPage(currentPage + 1)}
						/>
						<PaginationItem
							isLast
							isDisabled={currentPage === totalPage}
							onClick={() => setCurrentPage(totalPage)}
						/>
					</Pagination>
				)}

				<Select
					size='sm'
					ariaLabel='Per'
					onChange={(e: { target: { value: string } }) => {
						setPerPage(parseInt(e.target.value, 10));
						setCurrentPage(1);
					}}
					value={perPage.toString()}>
					{Object.keys(PER_COUNT).map((i) => (
						<Option key={i} value={i}>
							{i}
						</Option>
					))}
				</Select>
			</CardFooterRight>
		</CardFooter>
	);
};

export default PaginationButtons;
