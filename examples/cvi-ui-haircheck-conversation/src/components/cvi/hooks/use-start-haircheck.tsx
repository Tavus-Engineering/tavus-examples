import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDaily, useDevices } from '@daily-co/daily-react';

export const useStartHaircheck = (): {
	isPermissionsPrompt: boolean;
	isPermissionsLoading: boolean;
	isPermissionsGranted: boolean;
	isPermissionsDenied: boolean;
	requestPermissions: () => void;
} => {
	const daily = useDaily();
	const { micState } = useDevices();

	const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

	useEffect(() => {
		navigator.permissions
			.query({ name: 'microphone' as PermissionName })
			.then((permissionStatus) => {
				setPermissionState(permissionStatus.state);
				permissionStatus.onchange = () => {
					setPermissionState(permissionStatus.state);
				};
			});
	}, []);

	const requestPermissions = useCallback(() => {
		if (!daily) return;
		daily.startCamera({
			startVideoOff: false,
			startAudioOff: false,
			audioSource: 'default',
			inputSettings: {
				audio: {
					processor: {
						type: 'noise-cancellation',
					},
				},
			},
		});
	}, [daily]);

	const isPermissionsPrompt = useMemo(() => {
		return permissionState === 'prompt';
	}, [permissionState]);

	const isPermissionsLoading = useMemo(() => {
		return (permissionState === null || permissionState === 'granted') && micState === 'idle';
	}, [permissionState, micState]);

	const isPermissionsGranted = useMemo(() => {
		return permissionState === 'granted';
	}, [permissionState]);

	const isPermissionsDenied = useMemo(() => {
		return permissionState === 'denied';
	}, [permissionState]);

	return {
		isPermissionsPrompt,
		isPermissionsLoading,
		isPermissionsGranted,
		isPermissionsDenied,
		requestPermissions,
	};
};
