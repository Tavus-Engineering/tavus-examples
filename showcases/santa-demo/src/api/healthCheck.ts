export const healthCheckApi = async (): Promise<{ status: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: true });
    }, 1000);
  });
};
