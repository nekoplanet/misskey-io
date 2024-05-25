/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// TODO: useTooltip関数使うようにしたい
// ただディレクティブ内でonUnmountedなどのcomposition api使えるのか不明

import { defineAsyncComponent, Directive, ref, DirectiveBinding } from 'vue';
import { isTouchUsing } from '@/scripts/touch.js';
import { popup, alert } from '@/os.js';

const start = isTouchUsing ? 'touchstart' : 'mouseenter';
const end = isTouchUsing ? 'touchend' : 'mouseleave';

export type MkTooltip = {
	text?: string;
	_close?: () => void;
	showTimer?: number;
	hideTimer?: number;
	checkTimer?: number;
	close?: () => void;
	show?: () => void;
};

export interface MkTooltipDirectiveHTMLElement extends HTMLElement {
	_tooltipDirective_?: MkTooltip,
}

export default {
	mounted(el: MkTooltipDirectiveHTMLElement, binding: DirectiveBinding<string>) {
		const delay = binding.modifiers.noDelay ? 0 : 100;

		const self: MkTooltip = {
			text: binding.value,
		};

		self.close = () => {
			if (self._close) {
				window.clearInterval(self.checkTimer);
				self._close();
				self._close = undefined;
			}
		};

		self.show = () => {
			if (!document.body.contains(el)) return;
			if (self._close) return;
			if (self.text === undefined) return;

			const showing = ref(true);
			popup(defineAsyncComponent(() => import('@/components/MkTooltip.vue')), {
				showing,
				text: self.text,
				asMfm: binding.modifiers.mfm,
				direction: binding.modifiers.left ? 'left' : binding.modifiers.right ? 'right' : binding.modifiers.top ? 'top' : binding.modifiers.bottom ? 'bottom' : 'top',
				targetElement: el,
			}, {}, 'closed');

			self._close = () => {
				showing.value = false;
			};
		};

		(el)._tooltipDirective_ = self;

		el.addEventListener('selectstart', ev => {
			ev.preventDefault();
		});

		el.addEventListener(start, (ev) => {
			window.clearTimeout(self.showTimer);
			window.clearTimeout(self.hideTimer);
			if (delay === 0) {
				self.show!();
			} else {
				self.showTimer = window.setTimeout(self.show!, delay);
			}
		}, { passive: true });

		el.addEventListener(end, () => {
			window.clearTimeout(self.showTimer);
			window.clearTimeout(self.hideTimer);
			if (delay === 0) {
				self.close!();
			} else {
				self.hideTimer = window.setTimeout(self.close!, delay);
			}
		}, { passive: true });

		el.addEventListener('click', () => {
			window.clearTimeout(self.showTimer);
			self.close!();
		});
	},

	updated(el: MkTooltipDirectiveHTMLElement, binding: DirectiveBinding<string>) {
		const self = el._tooltipDirective_;
		self!.text = binding.value;
	},

	unmounted(el: MkTooltipDirectiveHTMLElement) {
		const self = el._tooltipDirective_;
		window.clearInterval(self!.checkTimer);
	},
} as Directive;
