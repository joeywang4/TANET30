import useAPI from './api';
import { BACKEND } from '../config';

export default () => {
  const [connection, connect] = useAPI(BACKEND+"/auth/login", "json");

  const login = (email, password) => {
    connect("POST", JSON.stringify({email, pwd: password}), {'content-type': "application/json"});
  }

  return [{...connection, ...connection.response}, login];
}