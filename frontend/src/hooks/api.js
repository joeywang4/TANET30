import { useReducer } from 'react';

const initialState = ({
  status: NaN,
  resopnse: null,
  errMsg: null,
  loading: false,
  success: false,
  error: false,
  isInit: function() {
    return !this.loading && !this.success && !this.error;
  }
})

const reducer = (state, action) => {
  switch(action.type) {
    case 'CONNECT':
      return {...state, loading: true};
    case 'SUCCESS':
      return ({
        ...state,
        status: action.status || 200,
        response: action.response,
        errMsg: null,
        loading: false,
        success: true,
        error: false
      });
    case 'ERROR':
      return ({
        ...state,
        status: action.status || 400,
        response: null,
        errMsg: action.errMsg || "",
        loading: false,
        success: false,
        error: true
      });
    case 'INIT':
      return initialState;
    default:
      throw new Error("Invalid Action Type");
  }
}

export default (responseType, onSuccess, onError) => {
  const [conn, dispatch] = useReducer(reducer, initialState);
  const init = () => dispatch({type: 'INIT'});

  const connect = async (url, method, body, headers) => {
    dispatch({type: "CONNECT"});
    fetch(url, { method, body, headers })
    .then(res => {
      if(res.status !== 200){
        res.text()
        .then(errMsg => {
          dispatch({
            type: "ERROR",
            status: res.status,
            errMsg
          })
          if(onError) onError(errMsg, conn);
        })
      }
      else {
        let thenable = null;
        switch(responseType) {
          case 'json':
            thenable = res.json()
            break;
          case 'text':
            thenable = res.text()
            break;
          default:
            if(onSuccess) onSuccess();
            return dispatch({type: "SUCCESS"});
        }
        if(thenable === null) return;
        thenable.then(data => {
          dispatch({
            type: "SUCCESS",
            response: data
          })
          if(onSuccess) onSuccess();
        })
        .catch((err) => {
          console.error(err);
          dispatch({
            type: "ERROR",
            errMsg: "Response type Error"
          })
          if(onError) onError("Response type Error", conn);
        })
      }
    })
    .catch(err => {
      console.error(err);
      dispatch({
        type: "ERROR",
        errMsg: "Connection Error"
      })
      if(onError) onError("Connection Error", conn);
    })
  }

  return [conn, connect, init];
}