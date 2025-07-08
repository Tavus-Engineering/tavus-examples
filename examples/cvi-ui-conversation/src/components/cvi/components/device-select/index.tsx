import React, { memo } from "react";
import { useDevices } from "@daily-co/daily-react";
import { useLocalCamera } from "../../hooks/use-local-camera";
import { useLocalMicrophone } from "../../hooks/use-local-microphone";
import { useLocalScreenshare } from "../../hooks/use-local-screenshare";
import styles from "./device-select.module.css";

export const SelectDevice = ({
  value,
  devices,
  disabled,
  onChange,
}: {
  value: string | undefined;
  devices: { device: MediaDeviceInfo }[];
  disabled: boolean;
  onChange: (value: string) => void;
}) => {
  return (
    <div className={styles.selectDeviceContainer}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={styles.selectDevice}
      >
        {devices.map(({ device }) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      <span className={styles.selectArrow}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
};

export const MicSelectBtn = memo(() => {
  const { onToggleMicrophone, isMicReady, isMicMuted } = useLocalMicrophone();
  const { microphones, currentMic, setMicrophone } = useDevices();

  return (
    <div className={styles.deviceButtonContainer}>
      <button
        type="button"
        onClick={onToggleMicrophone}
        disabled={!isMicReady}
        className={styles.deviceButton}
      >
        <span className={styles.deviceButtonIcon}>
          {isMicMuted || !isMicReady ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Microphone Muted"
            >
              <path
                d="M12 18C10.1435 18 8.36301 17.2625 7.05025 15.9497C5.7375 14.637 5 12.8565 5 11V10M12 18C13.8565 18 15.637 17.2625 16.9497 15.9497C18.2625 14.637 18.1339 14.0992 18.1339 14.0992M12 18V21"
                stroke="#020617"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="1.30225"
                y="3"
                width="26"
                height="2.24738"
                rx="1.12369"
                transform="rotate(30 1.30225 3)"
                fill="#020617"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 9.39031V11C9 11.7956 9.31607 12.5587 9.87868 13.1213C10.4413 13.6839 11.2044 14 12 14C12.7956 14 13.5587 13.6839 14.1213 13.1213C14.2829 12.9597 14.4242 12.7816 14.5435 12.5908L9 9.39031ZM15 7.71466V6C15 5.20435 14.6839 4.44129 14.1213 3.87868C13.5587 3.31607 12.7956 3 12 3C11.2044 3 10.4413 3.31607 9.87868 3.87868C9.69528 4.06208 9.53807 4.26678 9.40948 4.48697L15 7.71466Z"
                fill="#020617"
              />
              <path
                d="M9 9.39031L9.41667 8.66862C9.15883 8.51976 8.84117 8.51976 8.58333 8.66862C8.3255 8.81748 8.16667 9.09259 8.16667 9.39031H9ZM9.87868 13.1213L9.28942 13.7106H9.28942L9.87868 13.1213ZM14.1213 13.1213L14.7106 13.7106L14.7106 13.7106L14.1213 13.1213ZM14.5435 12.5908L15.25 13.0327C15.3699 12.841 15.4068 12.6088 15.3521 12.3894C15.2974 12.17 15.156 11.9822 14.9601 11.8692L14.5435 12.5908ZM15 7.71466L14.5833 8.43635C14.8412 8.58521 15.1588 8.58521 15.4167 8.43635C15.6745 8.28749 15.8333 8.01238 15.8333 7.71466H15ZM14.1213 3.87868L14.7106 3.28942L14.7106 3.28942L14.1213 3.87868ZM9.87868 3.87868L9.28942 3.28942L9.28942 3.28942L9.87868 3.87868ZM9.40948 4.48697L8.68988 4.06671C8.57806 4.25818 8.54715 4.48633 8.604 4.70065C8.66086 4.91497 8.80078 5.09779 8.99281 5.20866L9.40948 4.48697ZM9.83333 11V9.39031H8.16667V11H9.83333ZM10.4679 12.5321C10.0616 12.1257 9.83333 11.5746 9.83333 11H8.16667C8.16667 12.0167 8.57053 12.9917 9.28942 13.7106L10.4679 12.5321ZM12 13.1667C11.4254 13.1667 10.8743 12.9384 10.4679 12.5321L9.28942 13.7106C10.0083 14.4295 10.9833 14.8333 12 14.8333V13.1667ZM13.5321 12.5321C13.1257 12.9384 12.5746 13.1667 12 13.1667V14.8333C13.0167 14.8333 13.9917 14.4295 14.7106 13.7106L13.5321 12.5321ZM13.837 12.149C13.7508 12.2867 13.6488 12.4153 13.5321 12.5321L14.7106 13.7106C14.917 13.5041 15.0976 13.2764 15.25 13.0327L13.837 12.149ZM14.9601 11.8692L9.41667 8.66862L8.58333 10.112L14.1268 13.3125L14.9601 11.8692ZM14.1667 6V7.71466H15.8333V6H14.1667ZM13.5321 4.46794C13.9384 4.87426 14.1667 5.42536 14.1667 6H15.8333C15.8333 4.98334 15.4295 4.00831 14.7106 3.28942L13.5321 4.46794ZM12 3.83333C12.5746 3.83333 13.1257 4.06161 13.5321 4.46794L14.7106 3.28942C13.9917 2.57053 13.0167 2.16667 12 2.16667V3.83333ZM10.4679 4.46794C10.8743 4.06161 11.4254 3.83333 12 3.83333V2.16667C10.9833 2.16667 10.0083 2.57053 9.28942 3.28942L10.4679 4.46794ZM10.1291 4.90724C10.2219 4.74824 10.3354 4.60042 10.4679 4.46794L9.28942 3.28942C9.05511 3.52374 8.85421 3.78533 8.68988 4.06671L10.1291 4.90724ZM8.99281 5.20866L14.5833 8.43635L15.4167 6.99298L9.82615 3.76529L8.99281 5.20866Z"
                fill="#020617"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Microphone"
            >
              <path
                d="M9 6C9 5.20435 9.31607 4.44129 9.87868 3.87868C10.4413 3.31607 11.2044 3 12 3C12.7956 3 13.5587 3.31607 14.1213 3.87868C14.6839 4.44129 15 5.20435 15 6V11C15 11.7956 14.6839 12.5587 14.1213 13.1213C13.5587 13.6839 12.7956 14 12 14C11.2044 14 10.4413 13.6839 9.87868 13.1213C9.31607 12.5587 9 11.7956 9 11V6Z"
                fill="#020617"
                stroke="#020617"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18C10.1435 18 8.36301 17.2625 7.05025 15.9497C5.7375 14.637 5 12.8565 5 11V10M12 18C13.8565 18 15.637 17.2625 16.9497 15.9497C18.2625 14.637 19 12.8565 19 11V10M12 18V21"
                stroke="#020617"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={styles.srOnly}>Microphone</span>
      </button>
      <SelectDevice
        value={currentMic?.device?.deviceId}
        devices={microphones || []}
        disabled={!isMicReady}
        onChange={(val) => setMicrophone(val)}
      />
    </div>
  );
});

MicSelectBtn.displayName = "MicSelectBtn";

export const CameraSelectBtn = memo(() => {
  const { onToggleCamera, isCamReady, isCamMuted } = useLocalCamera();
  const { currentCam, cameras, setCamera } = useDevices();


  return (
    <div className={styles.deviceButtonContainer}>
      <button
        type="button"
        onClick={onToggleCamera}
        disabled={!isCamReady || !currentCam}
        className={styles.deviceButton}
      >
        <span className={styles.deviceButtonIcon}>
          {isCamMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Camera Muted"
            >
              <g clipPath="url(#clip0_7082_14220)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.19874 5.60093C3.08628 5.68537 2.97928 5.77808 2.87868 5.87868C2.31607 6.44129 2 7.20435 2 8V16C2 16.7956 2.31607 17.5587 2.87868 18.1213C3.44129 18.6839 4.20435 19 5 19H15C15.7956 19 16.5587 18.6839 17.1213 18.1213C17.6839 17.5587 18 16.7956 18 16V15.048C17.7787 14.8204 17.5304 14.6189 17.2595 14.4485L3.19874 5.60093ZM22 12.655V8C22 7.80225 21.9413 7.60895 21.8314 7.44454C21.7215 7.28013 21.5654 7.15199 21.3827 7.07632C21.2 7.00065 20.9989 6.98085 20.805 7.01942C20.611 7.05798 20.4329 7.15319 20.293 7.293L18 9.586V8C18 7.20435 17.6839 6.44129 17.1213 5.87868C16.5587 5.31607 15.7956 5 15 5H8.7412L22 12.655Z"
                  fill="#020617"
                />
                <rect
                  x="0.777222"
                  y="2.64844"
                  width="26.7988"
                  height="2.24738"
                  rx="1.12369"
                  transform="rotate(30 0.777222 2.64844)"
                  fill="#020617"
                />
              </g>
              <defs>
                <clipPath id="clip0_7082_14220">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Camera"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 5C4.20435 5 3.44129 5.31607 2.87868 5.87868C2.31607 6.44129 2 7.20435 2 8V16C2 16.7956 2.31607 17.5587 2.87868 18.1213C3.44129 18.6839 4.20435 19 5 19H15C15.7956 19 16.5587 18.6839 17.1213 18.1213C17.6839 17.5587 18 16.7956 18 16V14.414L20.293 16.707C20.4329 16.8468 20.611 16.942 20.805 16.9806C20.9989 17.0192 21.2 16.9993 21.3827 16.9237C21.5654 16.848 21.7215 16.7199 21.8314 16.5555C21.9413 16.391 22 16.1978 22 16V8C22 7.80225 21.9413 7.60895 21.8314 7.44454C21.7215 7.28013 21.5654 7.15199 21.3827 7.07632C21.2 7.00065 20.9989 6.98085 20.805 7.01942C20.611 7.05798 20.4329 7.15319 20.293 7.293L18 9.586V8C18 7.20435 17.6839 6.44129 17.1213 5.87868C16.5587 5.31607 15.7956 5 15 5H5Z"
                fill="#020617"
              />
            </svg>
          )}
        </span>
        <span className={styles.srOnly}>Camera</span>
      </button>
      <SelectDevice
        value={currentCam?.device?.deviceId}
        devices={cameras || []}
        disabled={!isCamReady}
        onChange={(val) => setCamera(val)}
      />
    </div>
  );
});

CameraSelectBtn.displayName = "CameraSelectBtn";

export const ScreenShareButton = memo(() => {
  const { onToggleScreenshare, isScreenSharing } = useLocalScreenshare();

  return (
    <button
      type="button"
      onClick={onToggleScreenshare}
      className={`${styles.deviceButtonContainer} ${styles.screenShareButton}`}
    >
      <span>
        {isScreenSharing ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label="Screen Share"
          >
            <path
              d="M21.0008 19C21.2557 19.0003 21.5009 19.0979 21.6862 19.2728C21.8715 19.4478 21.9831 19.687 21.998 19.9414C22.013 20.1958 21.9302 20.4464 21.7666 20.6418C21.603 20.8373 21.3709 20.9629 21.1178 20.993L21.0008 21H3.00085C2.74597 20.9997 2.50081 20.9021 2.31548 20.7272C2.13014 20.5522 2.01861 20.313 2.00367 20.0586C1.98874 19.8042 2.07152 19.5536 2.23511 19.3582C2.3987 19.1627 2.63075 19.0371 2.88385 19.007L3.00085 19H21.0008ZM19.0008 4C19.5054 3.99984 19.9914 4.19041 20.3614 4.5335C20.7314 4.87659 20.958 5.34684 20.9958 5.85L21.0008 6V16C21.001 16.5046 20.8104 16.9906 20.4673 17.3605C20.1243 17.7305 19.654 17.9572 19.1508 17.995L19.0008 18H5.00085C4.49627 18.0002 4.01028 17.8096 3.6403 17.4665C3.27032 17.1234 3.04369 16.6532 3.00585 16.15L3.00085 16V6C3.00069 5.49542 3.19125 5.00943 3.53434 4.63945C3.87743 4.26947 4.34769 4.04284 4.85085 4.005L5.00085 4H19.0008Z"
              fill="#2D65FF"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label="Screen Share"
          >
            <path
              d="M20.9999 19C21.2547 19.0003 21.4999 19.0979 21.6852 19.2728C21.8706 19.4478 21.9821 19.687 21.997 19.9414C22.012 20.1958 21.9292 20.4464 21.7656 20.6418C21.602 20.8373 21.37 20.9629 21.1169 20.993L20.9999 21H2.99987C2.74499 20.9997 2.49984 20.9021 2.3145 20.7272C2.12916 20.5522 2.01763 20.313 2.0027 20.0586C1.98776 19.8042 2.07054 19.5536 2.23413 19.3582C2.39772 19.1627 2.62977 19.0371 2.88287 19.007L2.99987 19H20.9999ZM18.9999 4C19.5044 3.99984 19.9904 4.19041 20.3604 4.5335C20.7304 4.87659 20.957 5.34684 20.9949 5.85L20.9999 6V16C21 16.5046 20.8095 16.9906 20.4664 17.3605C20.1233 17.7305 19.653 17.9572 19.1499 17.995L18.9999 18H4.99987C4.49529 18.0002 4.0093 17.8096 3.63932 17.4665C3.26934 17.1234 3.04271 16.6532 3.00487 16.15L2.99987 16V6C2.99971 5.49542 3.19028 5.00943 3.53337 4.63945C3.87646 4.26947 4.34671 4.04284 4.84987 4.005L4.99987 4H18.9999Z"
              fill="white"
            />
          </svg>
        )}
      </span>
    </button>
  );
});

ScreenShareButton.displayName = "ScreenShareButton";