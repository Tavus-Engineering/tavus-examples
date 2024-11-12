import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook to request media permissions for audio and video.
 * Returns true if permissions are granted, false if denied, and null if pending.
 */
const useMediaPermissions = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Check if the user has granted access to the camera and microphone
        // if access is not granted, label and deviceId will be empty strings
        const isAccessAllowed = (
          await navigator.mediaDevices.enumerateDevices()
        ).some((el) => !!el.deviceId);
        if (!isAccessAllowed) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          // Stop tracks immediately after getting permissions
          stream.getTracks().forEach((track) => track.stop());
          setHasPermission(true);
        } else {
          setHasPermission(true);
        }
      } catch (error) {
        console.error("Error requesting media permissions:", error);
        setHasPermission(false);
      }
    };
    requestPermissions();
  }, []);

  return hasPermission;
};

/**
 * Custom hook to manage media devices (audio and video inputs).
 * Returns lists of devices and the selected devices.
 * Fixes the issue where devices are not listed until permissions are granted.
 */
const useDevices = (hasPermission: boolean | null) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] =
    useState<MediaDeviceInfo | null>(null);
  const [selectedAudioDevice, setSelectedAudioDevice] =
    useState<MediaDeviceInfo | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput",
      );

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);

      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0]);
      }

      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0]);
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  useEffect(() => {
    if (hasPermission) {
      getDevices();
      navigator.mediaDevices.addEventListener("devicechange", getDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", getDevices);
      };
    }
  }, [getDevices, hasPermission]);

  return {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
  };
};

/**
 * Returns the first supported video MIME type and its file extension.
 * Throws an error if no supported type is found.
 */
const getSupportedVideoTypeAndExtension = (): [string, string] => {
  const videoTypes = ["video/webm", "video/mp4", "video/quicktime"] as const;
  for (const type of videoTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return [type, type.split("/")[1]];
    }
  }
  throw new Error("No supported video type found");
};

/**
 * Component that draws a static overlay over the video.
 */
export const StaticOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      // Adjust canvas size to match its displayed size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawOverlay();
    };

    const drawOverlay = () => {
      const { width, height } = canvas;

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw semi-transparent background
      ctx.fillStyle = `rgba(2, 6, 23, 0.66)`;
      ctx.fillRect(0, 0, width, height);

      // Define circle parameters
      const centerX = width / 2;
      const centerY = height / 2 - 10;
      const radius = Math.min(width, height) * 0.3;

      // Create circular clip
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
      ctx.clip();

      // Clear the circular area within the clip
      ctx.clearRect(0, 0, width, height);

      // Reset the path after clipping
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);

      // Draw circle border
      ctx.strokeStyle = "#fff";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
};

/**
 * Component that displays the video preview along with overlays and recording indicators.
 */
const VideoPreview: React.FC<{
  stream: MediaStream | null;
  isRecording: boolean;
  recordingTime: number;
  countdownValue: number | null;
}> = ({ stream, isRecording, recordingTime, countdownValue }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "56.25%", // Maintain 16:9 aspect ratio
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <StaticOverlay />
      {countdownValue !== null && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            fontSize: "2.25rem",
            color: "white",
          }}
        >
          {countdownValue}
        </div>
      )}
      {isRecording && (
        <div
          style={{
            position: "absolute",
            left: "1rem",
            top: "1rem",
            borderRadius: "0.25rem",
            backgroundColor: "#ef4444",
            padding: "0.25rem 0.5rem",
            color: "white",
          }}
        >
          Recording: {recordingTime}s
        </div>
      )}
    </div>
  );
};

/**
 * Component for selecting a media device from a list.
 */
const DeviceSelector: React.FC<{
  devices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo | null;
  onSelect: (device: MediaDeviceInfo) => void;
  label: string;
}> = ({ devices, selectedDevice, onSelect, label }) => (
  <select
    value={selectedDevice?.deviceId || ""}
    onChange={(e) => {
      const device = devices.find((d) => d.deviceId === e.target.value);
      if (device) onSelect(device);
    }}
  >
    <option value="">{label}</option>
    {devices.map((device, index) => (
      <option key={device.deviceId} value={device.deviceId}>
        {device.label || `${label} ${index + 1}`}
      </option>
    ))}
  </select>
);

/**
 * Component for rendering recording control buttons.
 */
const RecordingControls: React.FC<{
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  isDisabled: boolean;
  recordingTime: number;
  minimumRecordTime: number;
}> = ({
  isRecording,
  onStart,
  onStop,
  onCancel,
  isDisabled,
  recordingTime,
  minimumRecordTime,
}) => (
    <div style={{ marginTop: "1rem" }}>
      {!isRecording ? (
        <button type="button" onClick={onStart} disabled={isDisabled}>
          Start Recording
        </button>
      ) : (
        <>
          <button type="button" onClick={onCancel}>
            Cancel Recording
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={recordingTime < minimumRecordTime}
          >
            Stop Recording
          </button>
        </>
      )}
    </div>
  );

/**
 * Attempts to find the best supported resolution for the given video device.
 * Tries predefined resolutions and returns the first one that is supported.
 */
const resolutions = [
  { width: 3840, height: 2160 }, // 4K UHD, 16:9
  { width: 2160, height: 3840 }, // 4K UHD, 9:16
  { width: 2560, height: 1440 }, // 1440p QHD, 16:9
  { width: 1440, height: 2560 }, // 1440p QHD, 9:16
  { width: 1920, height: 1080 }, // 1080p FHD, 16:9
  { width: 1080, height: 1920 }, // 1080p FHD, 9:16
  { width: 1280, height: 720 }, // 720p HD, 16:9
  { width: 720, height: 1280 }, // 720p HD, 9:16
];

const findBestResolution = async (deviceId: string) => {
  for (const resolution of resolutions) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { exact: resolution.width },
          height: { exact: resolution.height },
        },
      });
      // Stop all tracks to release the camera
      stream.getTracks().forEach((track) => track.stop());
      return resolution;
    } catch (error) {
      console.log(
        `Resolution ${resolution.width}x${resolution.height} not supported`,
      );
    }
  }
  return null;
};

interface ReplicaRecordingProps {
  onSubmit?: (blob: Blob) => void;
  minimumRecordTime?: number;
}

/**
 * Custom hook to handle countdown logic before starting an action.
 * Provides countdown value and a function to start the countdown.
 */
const useCountdown = (
  initialValue: number,
  onCountdownComplete: () => void,
) => {
  const countdownIntervalRef = useRef<number | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  useEffect(() => {
    if (countdownValue === 0) {
      onCountdownComplete();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownValue(null);
    }
  }, [countdownValue, onCountdownComplete]);

  const startCountdown = useCallback(() => {
    setCountdownValue(initialValue);
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdownValue((prev) => {
        return prev ? prev - 1 : null;
      });
    }, 1000);
  }, [initialValue]);

  return {
    countdownValue,
    startCountdown,
  };
};

interface UseMediaRecorderProps {
  stream: MediaStream | null;
  onRecordingComplete: (blob: Blob) => void;
}

/**
 * Custom hook to handle media recording using MediaRecorder API.
 * Manages recording state, timing, and handles the recorded data.
 */
const useMediaRecorder = ({
  stream,
  onRecordingComplete,
}: UseMediaRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);

  const startTimer = useCallback(() => {
    const startTime = Date.now();
    recordingIntervalRef.current = window.setInterval(() => {
      setRecordingTime(() => {
        const elapsedTime = Date.now() - startTime;
        return Math.floor(elapsedTime / 1000);
      });
    }, 1000);
  }, []);

  const startRecording = useCallback(() => {
    if (stream) {
      const [mimeType] = getSupportedVideoTypeAndExtension();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      recordedChunksRef.current = [];
      cancelRef.current = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordingTime(0);
        if (cancelRef.current) {
          return;
        }
        const recordedBlob = new Blob(recordedChunksRef.current, {
          type: mimeType,
        });
        onRecordingComplete(recordedBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      startTimer();
    }
  }, [stream, onRecordingComplete, startTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingTime(0);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    cancelRef.current = true;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recordedChunksRef.current = [];
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};

interface UseMediaStreamProps {
  hasPermission: boolean | null;
  selectedVideoDevice: MediaDeviceInfo | null;
  selectedAudioDevice: MediaDeviceInfo | null;
}

/**
 * Custom hook to handle setting up the media stream.
 * Moves the useEffect with setupStream logic into this hook.
 */
const useMediaStream = ({
  hasPermission,
  selectedVideoDevice,
  selectedAudioDevice,
}: UseMediaStreamProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
    label: string;
    device: string;
  } | null>(null);
  const [isLowResolution, setIsLowResolution] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const setupStream = async () => {
      // Find the best supported resolution only if video device changed
      const bestResolution =
        selectedVideoDevice?.label !== resolution?.device
          ? await findBestResolution(selectedVideoDevice!.deviceId)
          : { width: resolution!.width, height: resolution!.height };

      // Prepare video constraints
      const videoConstraints: MediaTrackConstraints = {
        deviceId: { exact: selectedVideoDevice!.deviceId },
        // The minimum FPS for replica recording is 24, so we set the ideal to 25 to get the closest match
        // this param set fps depending on the browser and webcam settings
        // with this setup, the MacBook Pro M2 Pro records at 30 fps
        frameRate: { ideal: 25 },
      };

      if (bestResolution) {
        videoConstraints.width = { exact: bestResolution.width };
        videoConstraints.height = { exact: bestResolution.height };
      } else {
        // Fallback to ideal resolution if none found
        videoConstraints.width = { ideal: 4096 };
        videoConstraints.height = { ideal: 2160 };
      }

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: { deviceId: { exact: selectedAudioDevice!.deviceId } },
        });

        if (isMounted) {
          setStream(newStream);

          // Get actual resolution from the video track
          const { width, height } = newStream.getVideoTracks()[0].getSettings();
          setResolution({
            width: width || 0,
            height: height || 0,
            label: `${width}x${height}`,
            device: selectedVideoDevice!.label,
          });

          // Determine if the resolution is low
          const isPortrait = height! > width!;
          const minWidth = 1280;
          const minHeight = 720;
          const lowResolution = isPortrait
            ? height! < minWidth || width! < minHeight
            : width! < minWidth || height! < minHeight;
          setIsLowResolution(lowResolution);
        }
      } catch (error) {
        console.error("Error setting up media stream:", error);
      }
    };

    if (
      hasPermission &&
      hasPermission === true &&
      selectedVideoDevice &&
      selectedAudioDevice
    ) {
      setupStream();
    }

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hasPermission, selectedVideoDevice, selectedAudioDevice]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return { stream, resolution, isLowResolution };
};

/**
 * Main component that handles video recording logic and UI.
 * Now uses the `useMediaStream` hook to manage the media stream.
 */
export const ReplicaRecording: React.FC<ReplicaRecordingProps> = ({
  onSubmit,
  minimumRecordTime = 5,
}) => {
  const hasPermission = useMediaPermissions();

  const {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
  } = useDevices(hasPermission);

  // Use the new useMediaStream hook
  const { stream, resolution, isLowResolution } = useMediaStream({
    hasPermission,
    selectedVideoDevice,
    selectedAudioDevice,
  });

  // Handle recording logic
  const onRecordingComplete = useCallback(
    (blob: Blob) => {
      onSubmit?.(blob);
    },
    [onSubmit],
  );

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useMediaRecorder({ stream, onRecordingComplete });

  // Handle countdown
  const { countdownValue, startCountdown } = useCountdown(3, startRecording);

  // Function to start the countdown and then start recording
  const handleStart = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  useEffect(() => {
    if (hasPermission === false) {
      alert(
        "Camera and microphone permission denied. Please allow access to continue.",
      );
    }
  }, [hasPermission]);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <VideoPreview
        stream={stream}
        isRecording={isRecording}
        recordingTime={recordingTime}
        countdownValue={countdownValue}
      />
      {resolution && (
        <div style={{ display: "flex", gap: "1rem" }}>
          <p>Resolution: {resolution.label}</p>
          <p>Device: {resolution.device}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: "1rem" }}>
        <DeviceSelector
          devices={videoDevices}
          selectedDevice={selectedVideoDevice}
          onSelect={setSelectedVideoDevice}
          label="Select Video Device"
        />
        <DeviceSelector
          devices={audioDevices}
          selectedDevice={selectedAudioDevice}
          onSelect={setSelectedAudioDevice}
          label="Select Audio Device"
        />
      </div>
      <RecordingControls
        isRecording={isRecording}
        onStart={handleStart}
        onStop={stopRecording}
        onCancel={cancelRecording}
        isDisabled={isLowResolution || !!countdownValue}
        recordingTime={recordingTime}
        minimumRecordTime={minimumRecordTime}
      />
    </div>
  );
};

export const App = () => {
  const handleSubmit = (blob: Blob) => {
    const ext = blob.type.split("/")[1];
    const fileName = `${Date.now()}test-video.${ext}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  };

  return <ReplicaRecording onSubmit={handleSubmit} />;
};
