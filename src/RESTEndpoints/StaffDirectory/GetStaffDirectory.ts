import { RESTMethods, RESTHandler } from '../../../types/DisadusTypes';

export const GetGame = {
  path: '/*/staff-directory',
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const communityID = req.params[0];
    if (!communityID) {
      return res.status(400).send('No Community Passed In');
    }
    await MongoDB.db('StaffDirectory')
      .listCollections({ name: communityID })
      .next(async (_, collinfo) => {
        if (collinfo) {
          res
            .status(200)
            .send(
              await MongoDB.db('StaffDirectory')
                .collection(communityID)
                .find()
                .toArray()
            );
        } else {
          res.status(404).send('Staff list not found');
        }
      });
    return;
  },
} as RESTHandler;
export default GetGame;
