import useAPI from './api';
import { BACKEND } from '../config'

export default () => {
  const [connection, connect] = useAPI(BACKEND+"/auth/register");

  const register = (name, email, password, group) => {
    connect("POST", JSON.stringify({name, email, pwd: password, group}), {'content-type': "application/json"});
  }

  return [connection, register];
}