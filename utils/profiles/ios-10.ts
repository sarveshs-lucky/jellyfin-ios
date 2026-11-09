/**
 * Copyright (c) 2025 Jellyfin Contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CodecType } from '@jellyfin/sdk/lib/generated-client/models/codec-type';
import type { DeviceProfile } from '@jellyfin/sdk/lib/generated-client/models/device-profile';
import { DlnaProfileType } from '@jellyfin/sdk/lib/generated-client/models/dlna-profile-type';
import { EncodingContext } from '@jellyfin/sdk/lib/generated-client/models/encoding-context';
import { MediaStreamProtocol } from '@jellyfin/sdk/lib/generated-client/models/media-stream-protocol';
import { ProfileConditionType } from '@jellyfin/sdk/lib/generated-client/models/profile-condition-type';
import { ProfileConditionValue } from '@jellyfin/sdk/lib/generated-client/models/profile-condition-value';

import BaseProfile from './base';

/**
 * Device profile for Expo Video player on iOS 10
 */
const Ios10Profile = {
	...BaseProfile,
	Name: 'iOS 10+ Native Profile',
	CodecProfiles: [
		// iOS<13 only supports max h264 level 4.2 in ts containers
		{
			Codec: 'h264',
			Conditions: [
				{
					Condition: ProfileConditionType.NotEquals,
					IsRequired: false,
					Property: ProfileConditionValue.IsAnamorphic,
					Value: 'true'
				},
				{
					Condition: ProfileConditionType.EqualsAny,
					IsRequired: false,
					Property: ProfileConditionValue.VideoProfile,
					Value: 'high|main|baseline|constrained baseline'
				},
				{
					Condition: ProfileConditionType.NotEquals,
					IsRequired: false,
					Property: ProfileConditionValue.IsInterlaced,
					Value: 'true'
				},
				{
					Condition: ProfileConditionType.LessThanEqual,
					IsRequired: false,
					Property: ProfileConditionValue.VideoLevel,
					Value: '42'
				}
			],
			Container: 'ts',
			Type: CodecType.Video
		},
		...BaseProfile.CodecProfiles
	],
	DirectPlayProfiles: [
		{
			AudioCodec: 'aac,mp3,dca,dts,alac',
			Container: 'mp4,m4v',
			Type: DlnaProfileType.Video,
			VideoCodec: 'h264,vc1'
		},
		{
			AudioCodec: 'aac,mp3,dca,dts,alac',
			Container: 'mov',
			Type: DlnaProfileType.Video,
			VideoCodec: 'h264'
		},
		{
			Container: 'mp3',
			Type: DlnaProfileType.Audio
		},
		{
			Container: 'aac',
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'aac',
			Container: 'm4a',
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'aac',
			Container: 'm4b',
			Type: DlnaProfileType.Audio
		},
		{
			Container: 'alac',
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'alac',
			Container: 'm4a',
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'alac',
			Container: 'm4b',
			Type: DlnaProfileType.Audio
		},
		{
			Container: 'wav',
			Type: DlnaProfileType.Audio
		}
	],
	TranscodingProfiles: [
		{
			AudioCodec: 'aac',
			BreakOnNonKeyFrames: true,
			Container: 'aac',
			Context: EncodingContext.Streaming,
			MaxAudioChannels: '6',
			MinSegments: 2,
			Protocol: MediaStreamProtocol.Hls,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'aac',
			Container: 'aac',
			Context: EncodingContext.Streaming,
			MaxAudioChannels: '6',
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'mp3',
			Container: 'mp3',
			Context: EncodingContext.Streaming,
			MaxAudioChannels: '6',
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'wav',
			Container: 'wav',
			Context: EncodingContext.Streaming,
			MaxAudioChannels: '6',
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'mp3',
			Container: 'mp3',
			Context: EncodingContext.Static,
			MaxAudioChannels: '6',
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'aac',
			Container: 'aac',
			Context: EncodingContext.Static,
			MaxAudioChannels: '6',
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'wav',
			Container: 'wav',
			Context: EncodingContext.Static,
			MaxAudioChannels: '6',
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Audio
		},
		{
			AudioCodec: 'aac,mp3',
			BreakOnNonKeyFrames: true,
			Container: 'ts',
			Context: EncodingContext.Streaming,
			MaxAudioChannels: '6',
			MinSegments: 2,
			Protocol: MediaStreamProtocol.Hls,
			Type: DlnaProfileType.Video,
			VideoCodec: 'h264'
		},
		// NOTE: Progressive mp4 video transcodes are only intended for downloads. They must not use the
		// streaming context here, since the server prefers them over HLS whenever they can copy the source
		// audio (e.g. ac3/eac3) and AVPlayer fails to stream the resulting fragmented mp4 (error -11850).
		// toDownloadProfile() adds the streaming context version needed for downloads.
		{
			AudioCodec: 'aac,mp3,dca,dts,alac',
			Container: 'mp4',
			Context: EncodingContext.Static,
			Protocol: MediaStreamProtocol.Http,
			Type: DlnaProfileType.Video,
			VideoCodec: 'h264'
		}
	]
} satisfies DeviceProfile;

export default Ios10Profile;
