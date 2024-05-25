/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent, Directive, ref } from 'vue';
import { popup } from '@/os.js';

export class UserPreview {
	private el: HTMLElement;
	private user: string;
	private showTimer?: number;
	private hideTimer?: number;
	private checkTimer?: number;
	private promise?: {
		cancel: () => void,
	};

	constructor(el: HTMLElement, user: string) {
		this.el = el;
		this.user = user;

		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
		this.onMouseover = this.onMouseover.bind(this);
		this.onMouseleave = this.onMouseleave.bind(this);
		this.onClick = this.onClick.bind(this);
		this.attach = this.attach.bind(this);
		this.detach = this.detach.bind(this);

		this.attach();
	}

	private show() {
		if (!document.body.contains(this.el)) return;
		if (this.promise) return;

		const showing = ref(true);

		popup(defineAsyncComponent(() => import('@/components/MkUserPopup.vue')), {
			showing,
			q: this.user,
			source: this.el,
		}, {
			mouseover: () => {
				window.clearTimeout(this.hideTimer);
			},
			mouseleave: () => {
				window.clearTimeout(this.showTimer);
				this.hideTimer = window.setTimeout(this.close, 500);
			},
		}, 'closed');

		this.promise = {
			cancel: () => {
				showing.value = false;
			},
		};

		this.checkTimer = window.setInterval(() => {
			if (!document.body.contains(this.el)) {
				window.clearTimeout(this.showTimer);
				window.clearTimeout(this.hideTimer);
				this.close();
			}
		}, 1000);
	}

	private close() {
		if (this.promise) {
			window.clearInterval(this.checkTimer);
			this.promise.cancel();
			this.promise = undefined;
		}
	}

	private onMouseover() {
		window.clearTimeout(this.showTimer);
		window.clearTimeout(this.hideTimer);
		this.showTimer = window.setTimeout(this.show, 500);
	}

	private onMouseleave() {
		window.clearTimeout(this.showTimer);
		window.clearTimeout(this.hideTimer);
		this.hideTimer = window.setTimeout(this.close, 500);
	}

	private onClick() {
		window.clearTimeout(this.showTimer);
		this.close();
	}

	public attach() {
		this.el.addEventListener('mouseover', this.onMouseover);
		this.el.addEventListener('mouseleave', this.onMouseleave);
		this.el.addEventListener('click', this.onClick);
	}

	public detach() {
		this.el.removeEventListener('mouseover', this.onMouseover);
		this.el.removeEventListener('mouseleave', this.onMouseleave);
		this.el.removeEventListener('click', this.onClick);
	}
}

export type MkUserPreviewDirective = {
	preview: UserPreview,
};

export interface MkUserPreviewHTMLElement extends HTMLElement {
	_userPreviewDirective_?: MkUserPreviewDirective,
}

export default {
	mounted(el: MkUserPreviewHTMLElement, binding) {
		if (binding.value == null) return;

		// TODO: 新たにプロパティを作るのをやめMapを使う
		// ただメモリ的には↓の方が省メモリかもしれないので検討中
		el._userPreviewDirective_ = { preview: new UserPreview(el, binding.value) };
	},

	unmounted(el: MkUserPreviewHTMLElement, binding) {
		if (binding.value == null) return;

		const self = el._userPreviewDirective_;
		self!.preview.detach();
	},
} as Directive;
