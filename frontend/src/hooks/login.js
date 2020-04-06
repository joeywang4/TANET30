import useAPI from './api';
import { BACKEND } from '../config';

export default () => {
  const [connection, connect] = useAPI("json");

  const login = (email, password) => {
    connect(BACKEND+"/auth/login", "POST", JSON.stringify({email, pwd: password}), {'content-type': "application/json"});
  }

  return [{...connection, ...connection.response}, login];
}