import { useCallback, useMemo } from 'react';
import { useAudioTrack, useDaily, useDevices, useLocalSessionId } from '@daily-co/daily-react';

export const useLocalMicrophone = (): {
	isMicReady: boolean;
	isMicMuted: boolean;
	localSessionId: string;
	onToggleMicrophone: () => void;
} => {
	const daily = useDaily();
	const localSessionId = useLocalSessionId();
	const { isOff: isMicMuted } = useAudioTrack(localSessionId);
	const { micState } = useDevices();
	const isMicReady = useMemo(() => micState === 'granted', [micState]);

	const onToggleMicrophone = useCallback(() => {
		daily?.setLocalAudio(isMicMuted);
	}, [daily, isMicMuted]);

	return {
		isMicReady,
		isMicMuted,
		localSessionId,
		onToggleMicrophone,
	};
};
