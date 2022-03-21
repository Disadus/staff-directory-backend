import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';
import { StaffMember } from '../../../types/StaffTypes';
import { checkForPermission } from '../../Helpers/PermissionsChecker';
import {
  STAFF_DIRECTORY_DATABASE,
  STAFF_DIRECTORY_PERMISSION_SCOPE,
} from '../../Utils/constants';

export const SetStaffMembers = {
  path: '/*/staffDirectory/members',
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, user) => {
    const communityID = req.params[0];

    if (!communityID) {
      return res.status(400).send('No Community Passed In');
    }

    if (!user) {
      return res.status(401).send('User Unknown');
    }

    if (
      !checkForPermission(
        user?.id,
        communityID,
        `${STAFF_DIRECTORY_PERMISSION_SCOPE}.setStaff`
      )
    ) {
      return res.status(403).send('Unauthorized');
    }

    if (!req.body.staff) {
      return res.status(400).send('No Staff Members Passed In');
    }

    if (
      !(
        req.body.staff &&
        Array.isArray(req.body.staff) &&
        !req.body.staff.some((x: any) => typeof x != 'object')
      )
    ) {
      return res.status(400).send('No Staff Members List invalid');
    }

    let staffList: StaffMember[] = [];

    for (let staff of req.body.staff) {
      if (!staff.name || !staff.email || !staff.occupation)
        return res.status(400).send('Staff information missing');

      let schedule = null;

      if (staff.schedule && Array.isArray(staff.schedule)) {
        if (!staff.schedule.some((x: any) => typeof x != 'string')) {
          schedule = staff.schedule;
        }
      }

      const staffMember = {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        occupation: staff.occupation,
        pfp:
          !!staff.pfp && typeof staff.pfp == 'string' ? typeof staff.pfp : null,
        description:
          !!staff.description && typeof staff.description == 'string'
            ? typeof staff.description
            : null,
        schedule,
      } as StaffMember;

      if (
        typeof staffMember.name != 'string' ||
        typeof staffMember.email != 'string' ||
        typeof staffMember.occupation != 'string'
      )
        return res.status(400).send('Staff information invalid');

      staffList.push(staffMember);
    }

    const staffIDs = staffList.filter(x => x.id);

    if (staffIDs.length > Array.from(new Set(staffIDs)).length) {
      return res.status(400).send("Duplicate Staff IDs");
    }

    await MongoDB.db(STAFF_DIRECTORY_DATABASE)
      .listCollections({ name: communityID })
      .next(async (_, collinfo) => {
        if (!collinfo) {
          await MongoDB.db(STAFF_DIRECTORY_DATABASE).createCollection(
            communityID
          );
        }
        await MongoDB.db(STAFF_DIRECTORY_DATABASE)
          .collection(communityID)
          .deleteMany({});
        await MongoDB.db(STAFF_DIRECTORY_DATABASE)
          .collection(communityID)
          .insertMany(staffList);

        return res.status(201).send(communityID);
      });
    return;
  },
} as RESTHandler;
export default SetStaffMembers;
