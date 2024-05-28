/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export default (parent: Node, child: Node, checkSame = true) => {
	if (checkSame && parent === child) return true;
	let node = child.parentNode;
	while (node) {
		if (node === parent) return true;
		node = node.parentNode;
	}
	return false;
};
