import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';
import { STAFF_DIRECTORY_DATABASE } from '../../Utils/constants';

export const GetStaffDirectory = {
  path: '/*/staffDirectory',
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
    const communityID = req.params[0];
    if (!communityID) {
      return res.status(400).send('No Community Passed In');
    }
    await MongoDB.db(STAFF_DIRECTORY_DATABASE)
      .listCollections({ name: communityID })
      .next(async (_, collinfo) => {
        if (collinfo) {
          return res
            .status(200)
            .send(
              await MongoDB.db(STAFF_DIRECTORY_DATABASE)
                .collection(communityID)
                .find()
                .toArray()
            );
        } else {
          return res.status(404).send('Staff list not found');
        }
      });
    return;
  },
} as RESTHandler;
export default GetStaffDirectory;
