/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as Misskey from 'misskey-js';

export const notePage = (note: Misskey.entities.Note) => {
	return `/notes/${note.id}`;
};
