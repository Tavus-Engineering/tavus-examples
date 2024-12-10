import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSessionTime() {
  const sessionTime = Cookies.get("sessionTime");

  if (sessionTime) {
    const totalTimeInSeconds = Math.floor(
      JSON.parse(sessionTime).reduce(
        (total: number, session: { start: number; end: number }) =>
          total + (session.end - session.start) / 1000,
        0,
      ),
    );
    return totalTimeInSeconds;
  }

  return 0;
}

const expirationMinutes = 60 * 6;
export function setSessionStartTime() {
  const sessionTime = Cookies.get("sessionTime");
  const arr = sessionTime ? JSON.parse(sessionTime) : [];
  const currentTime = Date.now();
  arr.push({
    start: currentTime,
    end: currentTime,
    exp: (1 / 24 / 60) * expirationMinutes,
  });
  const exp = arr[0].exp;

  Cookies.set("sessionTime", JSON.stringify(arr), {
    expires: exp,
  });
}

export function updateSessionEndTime() {
  const sessionTime = Cookies.get("sessionTime");
  if (!sessionTime) return;
  const arr = JSON.parse(sessionTime);
  const currentTime = Date.now();
  arr[arr.length - 1].end = currentTime;
  const exp = arr[0].exp;

  Cookies.set("sessionTime", JSON.stringify(arr), { expires: exp });
}

export const clearSessionTime = () => {
  Cookies.remove("sessionTime");
};
