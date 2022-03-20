import { EVERYONE_PERMISSION_ID } from '../Utils/constants';

export const checkForPermission = async (
  user: string,
  community: string,
  permissionQuery: string
) => {
  // Checks if user has the permission and if not just make sure that the permission is not assigned to _@everyone instead
  return (
    (await globalThis.AuthManager.userHasPermission(
      user,
      permissionQuery,
      false,
      community
    )) ||
    (await globalThis.AuthManager.userHasPermission(
      EVERYONE_PERMISSION_ID,
      permissionQuery,
      false,
      community
    ))
  );
};
