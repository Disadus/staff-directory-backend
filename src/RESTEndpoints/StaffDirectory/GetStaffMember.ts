import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';
import { STAFF_DIRECTORY_DATABASE } from '../../Utils/constants';

export const GetStaffMember = {
  path: '/*/staffDirectory/member/*',
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
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

    await MongoDB.db(STAFF_DIRECTORY_DATABASE)
      .listCollections({ name: communityID })
      .next(async (_, collinfo) => {
        if (collinfo) {
          const possibleStaff = await MongoDB.db(STAFF_DIRECTORY_DATABASE)
            .collection(communityID)
            .findOne({ id: staffID });

          if (!possibleStaff) {
            return res.status(404).send('Staff Member not found');
          }
          return res.status(200).send(possibleStaff);
        } else {
          return res.status(404).send('Staff list not found');
        }
      });
    return;
  },
} as RESTHandler;
export default GetStaffMember;
