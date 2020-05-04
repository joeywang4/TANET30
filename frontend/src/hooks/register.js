import useAPI from './api';
import { useSelector } from 'react-redux';
import { BACKEND } from '../config'

export default () => {
  const [connection, connect] = useAPI();
  const {token} = useSelector(state => state.user);

  const register = (name, email, password, group) => {
    connect(
      BACKEND+"/auth/register", 
      "POST", 
      JSON.stringify({name, email, pwd: password, group}), 
      {'authorization': token, 'content-type': "application/json"}
    );
  }

  return [connection, register];
}