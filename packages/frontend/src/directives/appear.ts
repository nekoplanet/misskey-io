/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Directive } from 'vue';

export interface MkObserverHTMLElement extends HTMLElement {
	_observer_?: IntersectionObserver,
}

export default {
	mounted(src: MkObserverHTMLElement, binding) {
		const fn = binding.value;
		if (fn == null) return;

		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				fn();
			}
		});

		observer.observe(src);

		src._observer_ = observer;
	},

	unmounted(src: MkObserverHTMLElement) {
		if (src._observer_) src._observer_.disconnect();
	},
} as Directive;
