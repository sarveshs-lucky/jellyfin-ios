/**
 * Copyright (c) 2026 Jellyfin Contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import type { DeviceProfile } from '@jellyfin/sdk/lib/generated-client/models/device-profile';
import { DlnaProfileType } from '@jellyfin/sdk/lib/generated-client/models/dlna-profile-type';
import { EncodingContext } from '@jellyfin/sdk/lib/generated-client/models/encoding-context';
import { MediaStreamProtocol } from '@jellyfin/sdk/lib/generated-client/models/media-stream-protocol';
import type { TranscodingProfile } from '@jellyfin/sdk/lib/generated-client/models/transcoding-profile';

import iOS10Profile from '../../../../utils/profiles/ios-10';
import iOS11Profile from '../../../../utils/profiles/ios-11';
import iOS13Profile from '../../../../utils/profiles/ios-13';
import iOS13Fmp4Profile from '../../../../utils/profiles/ios-13-fmp4';
import { toDownloadProfile } from '../profile';

const PLAYBACK_PROFILES: DeviceProfile[] = [ iOS10Profile, iOS11Profile, iOS13Profile, iOS13Fmp4Profile ];

const isProgressiveStreamingVideo = (p: TranscodingProfile) => p.Type === DlnaProfileType.Video
	&& p.Context === EncodingContext.Streaming
	&& p.Protocol !== MediaStreamProtocol.Hls;

describe('profile', () => {
	describe.each(PLAYBACK_PROFILES.map(p => [ p.Name, p ] as const))('%s', (_name, playbackProfile) => {
		// The server prefers progressive streaming profiles over HLS when they can copy the source audio,
		// which AVPlayer is unable to play (https://github.com/jellyfin/jellyfin-ios/issues/766)
		it('should not include progressive video transcoding profiles for streaming playback', () => {
			expect((playbackProfile.TranscodingProfiles || []).filter(isProgressiveStreamingVideo)).toHaveLength(0);
		});

		describe('toDownloadProfile()', () => {
			const downloadProfile = toDownloadProfile(playbackProfile);

			it('should rename the profile', () => {
				expect(downloadProfile.Name).toBe(playbackProfile.Name?.replace(' Native Profile', ' Download Profile'));
			});

			it('should not include HLS transcoding profiles', () => {
				expect((downloadProfile.TranscodingProfiles || []).filter(p => p.Protocol === MediaStreamProtocol.Hls))
					.toHaveLength(0);
			});

			it('should include streaming versions of static video transcoding profiles', () => {
				const staticVideoProfiles = (playbackProfile.TranscodingProfiles || [])
					.filter(p => p.Type === DlnaProfileType.Video && p.Context === EncodingContext.Static);
				expect(staticVideoProfiles.length).toBeGreaterThan(0);

				expect((downloadProfile.TranscodingProfiles || []).filter(isProgressiveStreamingVideo))
					.toEqual(staticVideoProfiles.map(p => ({ ...p, Context: EncodingContext.Streaming })));
			});
		});
	});
});
