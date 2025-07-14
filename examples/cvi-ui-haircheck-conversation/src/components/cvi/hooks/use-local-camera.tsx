import { useCallback, useMemo } from 'react';
import { useDaily, useDevices, useLocalSessionId, useVideoTrack } from '@daily-co/daily-react';

export const useLocalCamera = (): {
	isCamReady: boolean;
	isCamMuted: boolean;
	localSessionId: string;
	onToggleCamera: () => void;
} => {
	const daily = useDaily();
	const localSessionId = useLocalSessionId();
	const { isOff: isCamMuted } = useVideoTrack(localSessionId);
	const { camState } = useDevices();
	const isCamReady = useMemo(() => camState === 'granted', [camState]);

	const onToggleCamera = useCallback(() => {
		daily?.setLocalVideo(isCamMuted);
	}, [daily, isCamMuted]);

	return {
		isCamReady,
		isCamMuted,
		localSessionId,
		onToggleCamera,
	};
};
