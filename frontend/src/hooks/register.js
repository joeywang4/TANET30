import useAPI from './api';
import { BACKEND } from '../config'

export default () => {
  const [connection, connect] = useAPI();

  const register = (name, email, password, group) => {
    connect(BACKEND+"/auth/register", "POST", JSON.stringify({name, email, pwd: password, group}), {'content-type': "application/json"});
  }

  return [connection, register];
}