/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Directive, DirectiveBinding } from 'vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { popup } from '@/os.js';

export default {
	mounted(el: HTMLElement, binding: DirectiveBinding<boolean>) {
		// 明示的に false であればバインドしない
		if (binding.value === false) return;

		el.addEventListener('click', () => {
			const rect = el.getBoundingClientRect();

			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);

			popup(MkRippleEffect, { x, y }, {}, 'end');
		});
	},
} as Directive;
