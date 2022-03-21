import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';
import { checkForPermission } from '../../Helpers/PermissionsChecker';
import {
  STAFF_DIRECTORY_DATABASE,
  STAFF_DIRECTORY_PERMISSION_SCOPE,
} from '../../Utils/constants';

export const EditStaffMember = {
  path: '/*/staffDirectory/member/*',
  method: RESTMethods.PUT,
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

    if (!req.body.name || !req.body.email || !req.body.occupation)
      return res.status(400).send('Staff information missing');

    let schedule = null;

    if (req.body.schedule && Array.isArray(req.body.schedule)) {
      if (!req.body.schedule.some((x: any) => typeof x != 'string')) {
        schedule = req.body.schedule;
      }
    }

    const staffMember = {
      id: staffID,
      name: req.body.name,
      email: req.body.email,
      occupation: req.body.occupation,
      pfp:
        !!req.body.pfp && typeof req.body.pfp == 'string'
          ? typeof req.body.pfp
          : null,
      description:
        !!req.body.description && typeof req.body.description == 'string'
          ? typeof req.body.description
          : null,
      schedule,
    };

    if (
      typeof staffMember.name != 'string' ||
      typeof staffMember.email != 'string' ||
      typeof staffMember.occupation != 'string'
    )
      return res.status(400).send('Staff information invalid');

    if (!user) {
      return res.status(401).send('User Unknown');
    }

    if (
      !checkForPermission(
        user?.id,
        communityID,
        `${STAFF_DIRECTORY_PERMISSION_SCOPE}.edit`
      )
    ) {
      return res.status(403).send('Unauthorized');
    }

    await MongoDB.db(STAFF_DIRECTORY_DATABASE)
      .listCollections({ name: communityID })
      .next(async (_, collinfo) => {
        if (collinfo) {
          const updatedInfo = await MongoDB.db(STAFF_DIRECTORY_DATABASE)
            .collection(communityID)
            .updateOne({ id: staffMember.id }, staffMember);

          if (updatedInfo.modifiedCount == 0) {
            return res.status(404).send('Nothing Updated');
          }

          return res.status(201).send(staffMember.id);
        } else {
          return res.status(404).send('Staff list not found');
        }
      });
    return;
  },
} as RESTHandler;
export default EditStaffMember;
