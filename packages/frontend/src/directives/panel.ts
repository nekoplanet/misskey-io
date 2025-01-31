/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Directive } from 'vue';

export default {
	mounted(src: HTMLElement) {
		const getBgColor = (el: HTMLElement | null) => {
			if (el === null) return 'transparent';
			const style = window.getComputedStyle(el);
			if (style.backgroundColor && !['rgba(0, 0, 0, 0)', 'rgba(0,0,0,0)', 'transparent'].includes(style.backgroundColor)) {
				return style.backgroundColor;
			} else {
				return el.parentElement ? getBgColor(el.parentElement) : 'transparent';
			}
		};

		const parentBg = getBgColor(src.parentElement);

		const myBg = getComputedStyle(document.documentElement).getPropertyValue('--panel');

		if (parentBg === myBg) {
			src.style.backgroundColor = 'var(--bg)';
		} else {
			src.style.backgroundColor = 'var(--panel)';
		}
	},
} as Directive;
