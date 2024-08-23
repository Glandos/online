/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * JSDialog.ScrollableBar - helper for creating toolbars with scrolling left/right
 */

/* global JSDialog $ */

// declare var JSDialog: any;

function moveFocus(
	parentContainer: HTMLElement,
	currentElement: HTMLElement,
	direction: 'next' | 'previous',
	axis: 'horizontal' | 'vertical',
	nextElement?: Element,
) {
	const focusableElements = Array.from(
		parentContainer.querySelectorAll('*'),
	).filter(isFocusable) as HTMLElement[];

	const [currentRow, currentColumn] = getRowColumn(currentElement);

	let targetRow = currentRow;
	let targetColumn = currentColumn;

	if (axis === 'horizontal') {
		if (direction === 'next') {
			targetColumn++;
			// If it's the last element in the row, cycle back to the first in the same row
			if (
				!focusableElements.find((el) => {
					const [row, column] = getRowColumn(el);
					return row === currentRow && column === targetColumn;
				})
			) {
				targetColumn = 0; // Start from the first column
			}
		} else {
			targetColumn--;
			// If it's the first element in the row and trying to move previous, cycle to the last in the same row
			if (targetColumn < 0) {
				targetColumn =
					focusableElements.filter((el) => {
						const [row] = getRowColumn(el);
						return row === currentRow;
					}).length - 1; // Move to the last column in the same row
			}
		}
	} else if (axis === 'vertical') {
		if (direction === 'next') {
			targetRow++;
		} else {
			targetRow--;
		}
	}

	// Find the target element based on the calculated row and column
	const targetElement = focusableElements.find((el) => {
		const [row, column] = getRowColumn(el);
		return row === targetRow && column === targetColumn;
	});

	if (!targetElement && axis === 'vertical') {
		if (direction === 'next') {
			// Start from the next sibling of the parent container
			const nextFocusableElement = findFocusableElement(
				nextElement as HTMLElement,
				'next',
				isFocusable,
			);
			if (nextFocusableElement) {
				nextFocusableElement.focus();
			}
		} else if (direction === 'previous') {
			// Start from the previous sibling of the parent container
			const previousFocusableElement = findFocusableElement(
				nextElement as HTMLElement,
				'previous',
				isFocusable,
			);
			if (previousFocusableElement) {
				previousFocusableElement.focus();
			}
		}
	}

	if (targetElement) {
		targetElement.focus();
	}
}

function findFocusableElement(
	element: HTMLElement,
	direction: 'next' | 'previous',
	isFocusable: (el: HTMLElement) => boolean,
): HTMLElement | null {
	// Check the current element if it is focusable
	if (isFocusable(element)) return element;

	// Check if sibling is focusable or contains focusable elements
	const focusableInSibling = findFocusableWithin(
		element as HTMLElement,
		direction,
	);
	if (focusableInSibling) return focusableInSibling;

	// Depending on the direction, find the next or previous sibling
	const sibling: Element =
		direction === 'next'
			? element.nextElementSibling
			: element.previousElementSibling;

	if (sibling) {
		// Recursively check the next or previous sibling of the current sibling
		return findFocusableElement(sibling as HTMLElement, direction, isFocusable);
	}

	return null;
}

// Helper function to find the first focusable element within an element
function findFocusableWithin(
	element: HTMLElement,
	direction: string,
): HTMLElement | null {
	const focusableElements = Array.from(element.querySelectorAll('*'));
	return direction === 'next'
		? (focusableElements.find(isFocusable) as HTMLElement | null)
		: (focusableElements.reverse().find(isFocusable) as HTMLElement | null);
}

// Utility function to check if an element is focusable
function isFocusable(element: HTMLElement) {
	if (!element) return false;

	// Check if element is focusable (e.g., input, button, link, etc.)
	const focusableElements = [
		'a[href]',
		'button',
		'textarea',
		'input[type="text"]',
		'input[type="radio"]',
		'input[type="checkbox"]',
		'select',
		'[tabindex]:not([tabindex="-1"])',
	];

	return focusableElements.some((selector) => element.matches(selector));
}

function getRowColumn(element: HTMLElement): [number, number] {
	const index = element.getAttribute('index');
	if (!index) return [-1, -1]; // we will never have this kind of index this is why we are pssing nagative values here
	const [row, column] = index.split(':').map(Number);
	return [row, column];
}
