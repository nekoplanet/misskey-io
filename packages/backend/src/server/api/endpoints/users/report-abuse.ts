/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import sanitizeHtml from 'sanitize-html';
import { Inject, Injectable } from '@nestjs/common';
import type { AbuseUserReportsRepository, UsersRepository } from '@/models/_.js';
import { IdService } from '@/core/IdService.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { GetterService } from '@/server/api/GetterService.js';
import { RoleService } from '@/core/RoleService.js';
import { QueueService } from '@/core/QueueService.js';
import { WebhookService } from '@/core/WebhookService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['users'],

	requireCredential: true,
	kind: 'write:report-abuse',

	description: 'File a report.',

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '1acefcb5-0959-43fd-9685-b48305736cb5',
		},

		cannotReportYourself: {
			message: 'Cannot report yourself.',
			code: 'CANNOT_REPORT_YOURSELF',
			id: '1e13149e-b1e8-43cf-902e-c01dbfcb202f',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		comment: { type: 'string', minLength: 1, maxLength: 2048 },
		category: {
			type: 'string',
			default: 'other',
			enum: [
				'nsfw',
				'spam',
				'explicit',
				'phishing',
				'personalInfoLeak',
				'selfHarm',
				'criticalBreach',
				'otherBreach',
				'violationRights',
				'violationRightsOther',
				'other',
			],
		},
	},
	required: ['userId', 'comment'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.abuseUserReportsRepository)
		private abuseUserReportsRepository: AbuseUserReportsRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private idService: IdService,
		private getterService: GetterService,
		private roleService: RoleService,
		private queueService: QueueService,
		private webhookService: WebhookService,
	) {
		super(meta, paramDef, async (ps, me) => {
			// Lookup user
			const user = await this.getterService.getUser(ps.userId).catch(err => {
				if (err.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new ApiError(meta.errors.noSuchUser);
				throw err;
			});

			if (user.id === me.id) {
				throw new ApiError(meta.errors.cannotReportYourself);
			}

			const report = await this.abuseUserReportsRepository.insert({
				id: this.idService.gen(),
				targetUserId: user.id,
				targetUserHost: user.host,
				reporterId: me.id,
				reporterHost: null,
				comment: ps.comment,
				category: ps.category,
			}).then(x => this.abuseUserReportsRepository.findOneByOrFail(x.identifiers[0]));

			const webhooks = (await this.webhookService.getActiveWebhooks()).filter(x => x.on.includes('reportCreated'));
			for (const webhook of webhooks) {
				if (await this.roleService.isAdministrator({ id: webhook.userId, isRoot: false })) {
					this.queueService.webhookDeliver(webhook, 'reportCreated', {
						report,
					});
				}
			}

			this.queueService.createReportAbuseJob(report);
		});
	}
}
