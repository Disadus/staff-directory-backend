import { Community } from '../../types/DisadusTypes';
import { API_DOMAIN, EVERYONE_PERMISSION_ID } from '../Utils/constants';
import nFetch from '../Utils/fetch';

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

export const isAdminOfCommunity = async (user: string, community: string): Promise<boolean | null> => {
  const res = await nFetch(`${API_DOMAIN}/community/${community}/`);

  if (res.status != 200) {
    return null
  }

  const communityData = (await res.json()) as Community;

  return communityData.admins.indexOf(user) != -1
}