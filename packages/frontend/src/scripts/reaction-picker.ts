/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { defineAsyncComponent, Ref, ref } from 'vue';

import { popup } from '@/os.js';
import { defaultStore } from '@/store.js';

class ReactionPicker {
	private src: Ref<HTMLElement | undefined> = ref();
	private manualShowing = ref(false);
	private targetNote: Ref<Misskey.entities.Note | undefined> = ref();
	private onChosen?: (reaction: string) => void;
	private onClosed?: () => void;

	constructor() {
		// nop
	}

	public async init() {
		const reactionsRef = defaultStore.reactiveState.reactions;
		await popup(defineAsyncComponent(() => import('@/components/MkEmojiPickerDialog.vue')), {
			src: this.src,
			pinnedEmojis: reactionsRef,
			asReactionPicker: true,
			targetNote: this.targetNote,
			manualShowing: this.manualShowing,
		}, {
			done: reaction => {
				if (this.onChosen) this.onChosen(reaction);
			},
			close: () => {
				this.manualShowing.value = false;
			},
			closed: () => {
				this.src.value = undefined;
				if (this.onClosed) this.onClosed();
			},
		});
	}

	public show(src?: HTMLElement, targetNote?: Misskey.entities.Note, onChosen?: ReactionPicker['onChosen'], onClosed?: ReactionPicker['onClosed']) {
		this.src.value = src;
		this.targetNote.value = targetNote;
		this.manualShowing.value = true;
		this.onChosen = onChosen;
		this.onClosed = onClosed;
	}
}

export const reactionPicker = new ReactionPicker();
