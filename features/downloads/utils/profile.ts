/**
 * Copyright (c) 2025 Jellyfin Contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SubtitleDeliveryMethod, type SubtitleProfile } from '@jellyfin/sdk/lib/generated-client/models';
import type { DeviceProfile } from '@jellyfin/sdk/lib/generated-client/models/device-profile';
import { DlnaProfileType } from '@jellyfin/sdk/lib/generated-client/models/dlna-profile-type';
import { EncodingContext } from '@jellyfin/sdk/lib/generated-client/models/encoding-context';
import { MediaStreamProtocol } from '@jellyfin/sdk/lib/generated-client/models/media-stream-protocol';

const SubtitleProfiles: SubtitleProfile[] = [
	{ Method: SubtitleDeliveryMethod.Encode }
];

/** Converts a playback DeviceProfile to one used for downloads. */
export const toDownloadProfile = (playbackProfile: DeviceProfile): DeviceProfile => {
	// Filter any HLS transcoding profiles out for downloads
	const transcodingProfiles = (playbackProfile.TranscodingProfiles || [])
		.filter(p => p.Protocol !== MediaStreamProtocol.Hls);

	// Playback profiles only define progressive video transcodes with a static context, since the server would
	// otherwise prefer them over HLS for streaming playback. Downloads request playback info using the default
	// streaming context, so add streaming context versions of those profiles here.
	const streamingVideoProfiles = transcodingProfiles
		.filter(p => p.Type === DlnaProfileType.Video && p.Context === EncodingContext.Static)
		.map(p => ({ ...p, Context: EncodingContext.Streaming }));

	const downloadProfile = {
		...playbackProfile,
		Name: playbackProfile.Name?.replace(' Native Profile', ' Download Profile'),
		TranscodingProfiles: [
			...transcodingProfiles,
			...streamingVideoProfiles
		],
		SubtitleProfiles
	};
	return downloadProfile;
};
