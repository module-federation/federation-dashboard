const versionManager = process.env.VERSION_MANAGER || null;

export const versionManagementEnabled = () => {
  return versionManager !== null;
};
