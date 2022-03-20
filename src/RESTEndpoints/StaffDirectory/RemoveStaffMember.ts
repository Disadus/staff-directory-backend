import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';
import { checkForPermission } from '../../Helpers/PermissionsChecker';
import {
  STAFF_DIRECTORY_DATABASE,
  STAFF_DIRECTORY_PERMISSION_SCOPE,
} from '../../Utils/constants';

export const GetGame = {
  path: '/*/staffDirectory/*',
  method: RESTMethods.DELETE,
  sendUser: false,
  run: async (req, res, next, user) => {
    const communityID = req.params[0];
    const staffID = req.params[1];

    if (!communityID) {
      return res.status(400).send('No Community Passed In');
    }
    if (!staffID) {
      return res.status(400).send('No Staff ID Passed In');
    }

    if (staffID.indexOf('/') != -1) {
      if (next) {
        next();
        return;
      }
      return res.status(400).send('Staff Member invalid');
    }

    if (!user) {
      return res.status(401).send('User Unknown');
    }

    if (
      !checkForPermission(
        user?.id,
        communityID,
        `${STAFF_DIRECTORY_PERMISSION_SCOPE}.remove`
      )
    ) {
      return res.status(403).send('Unauthorized');
    }

    await MongoDB.db(STAFF_DIRECTORY_DATABASE)
      .listCollections({ name: communityID })
      .next(async (_, collinfo) => {
        if (collinfo) {
          const deletionInfo = await MongoDB.db(STAFF_DIRECTORY_DATABASE)
            .collection(communityID)
            .deleteOne({ id: staffID });

          if (deletionInfo.deletedCount == 0) {
            return res.status(404).send('Nothing deleted');
          }

          return res.status(201).send(staffID);
        } else {
          return res.status(404).send('Staff list not found');
        }
      });
    return;
  },
} as RESTHandler;
export default GetGame;
