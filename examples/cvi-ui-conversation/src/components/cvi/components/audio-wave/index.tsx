import React, { useCallback, useRef, memo } from "react";
import { useActiveSpeakerId } from "@daily-co/daily-react";
import { useAudioLevelObserver } from "@daily-co/daily-react";
import styles from "./audio-wave.module.css";

export const AudioWave = memo(({ id }: { id: string }) => {
	const activeSpeakerId = useActiveSpeakerId();
	const isActiveSpeaker = activeSpeakerId === id;

	const leftBarRef = useRef<HTMLDivElement>(null);
	const centerBarRef = useRef<HTMLDivElement>(null);
	const rightBarRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | undefined>(undefined);

	useAudioLevelObserver(
		id,
		useCallback((volume) => {
			// Cancel any pending animation frame to prevent accumulation
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			// Use requestAnimationFrame to batch DOM updates
			animationFrameRef.current = requestAnimationFrame(() => {
				const scaledVolume = Number(Math.max(0.01, volume).toFixed(2));
				if (leftBarRef.current && centerBarRef.current && rightBarRef.current) {
					leftBarRef.current.style.height = `${20 + scaledVolume * 40}%`;
					centerBarRef.current.style.height = `${20 + scaledVolume * 130}%`;
					rightBarRef.current.style.height = `${20 + scaledVolume * 40}%`;
				}
			});
		}, []),
	);

	return (
		<div className={styles.container}>
			<div className={styles.waveContainer}>
				<div
					ref={leftBarRef}
					className={`${styles.bar} ${!isActiveSpeaker ? styles.barInactive : ''}`}
				/>
				<div
					ref={centerBarRef}
					className={`${styles.bar} ${!isActiveSpeaker ? styles.barInactive : ''}`}
				/>
				<div
					ref={rightBarRef}
					className={`${styles.bar} ${!isActiveSpeaker ? styles.barInactive : ''}`}
				/>
			</div>
		</div>
	);
});

AudioWave.displayName = 'AudioWave';
