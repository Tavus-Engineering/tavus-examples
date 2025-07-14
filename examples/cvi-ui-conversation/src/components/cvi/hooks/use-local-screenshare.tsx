import { useCallback } from 'react';
import { useDaily, useLocalSessionId, useScreenVideoTrack } from '@daily-co/daily-react';

export const useLocalScreenshare = (): {
	isScreenSharing: boolean;
	localSessionId: string;
	onToggleScreenshare: () => void;
} => {
	const daily = useDaily();
	const localSessionId = useLocalSessionId();
	const { isOff } = useScreenVideoTrack(localSessionId);
	const isScreenSharing = !isOff;

	const onToggleScreenshare = useCallback(() => {
		if (isScreenSharing) {
			daily?.stopScreenShare();
		} else {
			daily?.startScreenShare({
				displayMediaOptions: {
					audio: false,
					selfBrowserSurface: 'exclude',
					surfaceSwitching: 'include',
					video: {
						width: 1920,
						height: 1080,
					},
				},
			});
		}
	}, [daily, isScreenSharing]);

	return {
		isScreenSharing,
		localSessionId,
		onToggleScreenshare,
	};
};
