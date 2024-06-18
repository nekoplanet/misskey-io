/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { MetaEntityService } from '@/core/entities/MetaEntityService.js';

export const meta = {
	tags: ['meta'],

	requireCredential: false,

	res: {
		type: 'object',
		oneOf: [
			{ type: 'object', ref: 'MetaLite' },
			{ type: 'object', ref: 'MetaDetailed' },
		],
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		detail: { type: 'boolean', default: true },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private metaEntityService: MetaEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
<<<<<<< HEAD
			return ps.detail ? await this.metaEntityService.packDetailed() : await this.metaEntityService.pack();
=======
			const instance = await this.metaService.fetch(true);

			const ads = await this.adsRepository.createQueryBuilder('ads')
				.where('ads.expiresAt > :now', { now: new Date() })
				.andWhere('ads.startsAt <= :now', { now: new Date() })
				.andWhere(new Brackets(qb => {
					// 曜日のビットフラグを確認する
					qb.where('ads.dayOfWeek & :dayOfWeek > 0', { dayOfWeek: 1 << new Date().getDay() })
						.orWhere('ads.dayOfWeek = 0');
				}))
				.getMany();

			const response: any = {
				maintainerName: instance.maintainerName,
				maintainerEmail: instance.maintainerEmail,

				version: this.config.version,

				name: instance.name,
				uri: this.config.url,
				description: instance.description,
				langs: instance.langs,
				tosUrl: instance.termsOfServiceUrl,
				repositoryUrl: instance.repositoryUrl,
				feedbackUrl: instance.feedbackUrl,
				disableRegistration: instance.disableRegistration,
				emailRequiredForSignup: instance.emailRequiredForSignup,
				enableHcaptcha: instance.enableHcaptcha,
				hcaptchaSiteKey: instance.hcaptchaSiteKey,
				enableRecaptcha: instance.enableRecaptcha,
				recaptchaSiteKey: instance.recaptchaSiteKey,
				enableTurnstile: instance.enableTurnstile,
				turnstileSiteKey: instance.turnstileSiteKey,
				swPublickey: instance.swPublicKey,
				themeColor: instance.themeColor,
				mascotImageUrl: instance.mascotImageUrl,
				bannerUrl: instance.bannerUrl,
				infoImageUrl: instance.infoImageUrl,
				serverErrorImageUrl: instance.serverErrorImageUrl,
				notFoundImageUrl: instance.notFoundImageUrl,
				iconUrl: instance.iconUrl,
				backgroundImageUrl: instance.backgroundImageUrl,
				logoImageUrl: instance.logoImageUrl,
				maxNoteTextLength: MAX_NOTE_TEXT_LENGTH,
				// クライアントの手間を減らすためあらかじめJSONに変換しておく
				defaultLightTheme: instance.defaultLightTheme ? JSON.stringify(JSON5.parse(instance.defaultLightTheme)) : null,
				defaultDarkTheme: instance.defaultDarkTheme ? JSON.stringify(JSON5.parse(instance.defaultDarkTheme)) : null,
				ads: ads.map(ad => ({
					id: ad.id,
					url: ad.url,
					place: ad.place,
					ratio: ad.ratio,
					imageUrl: ad.imageUrl,
					dayOfWeek: ad.dayOfWeek,
				})),
				enableEmail: instance.enableEmail,
				enableServiceWorker: instance.enableServiceWorker,

				translatorAvailable: instance.deeplAuthKey != null,

				serverRules: instance.serverRules,

				policies: { ...DEFAULT_POLICIES, ...instance.policies },

				mediaProxy: this.config.mediaProxy,

				...(ps.detail ? {
					cacheRemoteFiles: instance.cacheRemoteFiles,
					cacheRemoteSensitiveFiles: instance.cacheRemoteSensitiveFiles,
					requireSetup: (await this.usersRepository.countBy({
						host: IsNull(),
					})) === 0,
				} : {}),
			};

			if (ps.detail) {
				const proxyAccount = instance.proxyAccountId ? await this.userEntityService.pack(instance.proxyAccountId).catch(() => null) : null;

				response.proxyAccountName = proxyAccount ? proxyAccount.username : null;
				response.features = {
					registration: !instance.disableRegistration,
					emailRequiredForSignup: instance.emailRequiredForSignup,
					hcaptcha: instance.enableHcaptcha,
					recaptcha: instance.enableRecaptcha,
					turnstile: instance.enableTurnstile,
					objectStorage: !!config.s3,
					serviceWorker: instance.enableServiceWorker,
					miauth: true,
				};
			}

			return response;
>>>>>>> parent of becfdc2b7 (spec(misskey-host): リモートファイルをキャッシュしない様に)
		});
	}
}
