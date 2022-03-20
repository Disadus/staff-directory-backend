import { MongoClient } from 'mongodb';
import { env } from './env';
import { RESTServer } from './src/Utils/RESTServer';
import PermissionsManager from 'disadus-permissions';
declare global {
  var MongoDB: MongoClient;
  var AuthManager: PermissionsManager;
}
globalThis.MongoDB = new MongoClient(env.mongo, {});
console.log('Connecting to MongoDB...');
MongoDB.connect().then(async () => {
  console.log('Connected to MongoDB');
  global.AuthManager = new PermissionsManager(MongoDB);
  await global.AuthManager.setup()
  const server = RESTServer();
});
