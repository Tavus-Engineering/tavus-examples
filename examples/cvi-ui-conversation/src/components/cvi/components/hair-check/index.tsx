import React, { memo, useEffect } from "react";
import {
  DailyVideo,
  useDaily,
} from "@daily-co/daily-react";
import { CameraSelectBtn, MicSelectBtn } from "../device-select";
import { useStartHaircheck } from "../../hooks/use-start-haircheck";
import { useLocalCamera } from "../../hooks/use-local-camera";

import styles from "./hair-check.module.css";

const JoinBtn = ({
  onClick,
  disabled,
  className,
  loading,
}: {
  loading?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <button
      className={`${styles.buttonJoin} ${className || ''}`}
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      <div className={styles.buttonJoinInner}>
        {loading ? "Joining..." : "Join Video Chat"}
      </div>
    </button>
  );
};

export const HairCheck = memo(({
  isJoinBtnLoading = false,
  onJoin,
  onCancel,
}: {
  isJoinBtnLoading?: boolean;
  onJoin: () => void;
  onCancel?: () => void;
}) => {
  const daily = useDaily();
  const { localSessionId, isCamMuted } = useLocalCamera();

  const { isPermissionsPrompt,
    isPermissionsLoading,
    isPermissionsGranted,
    isPermissionsDenied,
    requestPermissions
  } = useStartHaircheck();

  useEffect(() => {
    requestPermissions();
  }, []);

  const onCancelHairCheck = () => {
    if (daily) {
      daily.leave();
    }
    onCancel?.();
  };

  const getDescription = () => {
    if (isPermissionsPrompt) {
      return "Make sure your camera and mic are ready!";
    }
    if (isPermissionsLoading) {
      return "Getting your camera and mic ready...";
    }
    if (isPermissionsDenied) {
      return "Camera and mic access denied. Allow permissions to continue.";
    }
    return "You're all set! Your device is ready.";
  };
  return (
    <div className={styles.haircheckBlock}>
      {isPermissionsGranted && !isCamMuted ? (
        <DailyVideo
          type="video"
          sessionId={localSessionId}
          mirror
          className={styles.dailyVideo}
        />
      ) : (
        <div className={styles.haircheckUserPlaceholder}>
          <span className={styles.haircheckUserIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="88"
              height="89"
              viewBox="0 0 88 89"
              fill="none"
              aria-label="Haircheck User"
              role="img"
            >
              <path
                d="M44 48.6406C17.952 48.6406 8.80005 61.8406 8.80005 70.6406V83.8406H79.2001V70.6406C79.2001 61.8406 70.0481 48.6406 44 48.6406Z"
                fill="url(#paint0_linear_7135_21737)"
              />
              <path
                d="M44 44.2406C54.9352 44.2406 63.7999 35.3759 63.7999 24.4406C63.7999 13.5054 54.9352 4.64062 44 4.64062C33.0647 4.64062 24.2 13.5054 24.2 24.4406C24.2 35.3759 33.0647 44.2406 44 44.2406Z"
                fill="url(#paint1_linear_7135_21737)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_7135_21737"
                  x1="36.5001"
                  y1="43"
                  x2="44.0001"
                  y2="97.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_7135_21737"
                  x1="44"
                  y1="4.64062"
                  x2="44"
                  y2="44.2406"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </div>
      )}

      <div className={styles.haircheckSidebar}>
        <div className={styles.haircheckSidebarContent}>
          {isPermissionsDenied ?
            <button
              type="button"
              onClick={onCancelHairCheck}
              className={`${styles.buttonCancel} ${styles.buttonJoinMobile}`}
            >
              Cancel
            </button> :
            <JoinBtn
              loading={isJoinBtnLoading}
              disabled={!isPermissionsGranted}
              className={styles.buttonJoinMobile}
              onClick={onJoin}
            />
          }
          <div />
          <div className={styles.haircheckContent}>
            <div className={styles.haircheckDescription}>
              {getDescription()}
            </div>
            {isPermissionsDenied ?
              <button
                type="button"
                onClick={onCancelHairCheck}
                className={`${styles.buttonCancel} ${styles.buttonJoinDesktop}`}
              >
                Cancel
              </button> :
              <JoinBtn
                loading={isJoinBtnLoading}
                disabled={!isPermissionsGranted}
                className={styles.buttonJoinDesktop}
                onClick={onJoin}
              />}
          </div>
          <div className={styles.haircheckControls}>
            <MicSelectBtn />
            <CameraSelectBtn />
          </div>
        </div>
      </div>
    </div >
  );
});

HairCheck.displayName = "HairCheck";
