import { localStateName } from './config';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(`${localStateName}-state`);
    if(serializedState === null) return undefined;
    const expirationTime = parseInt(localStorage.getItem(`${localStateName}-expiration`));
    if(!isNaN(expirationTime) && Date.now() < expirationTime) return JSON.parse(serializedState);
    else {
      localStorage.removeItem(`${localStateName}-state`);
      localStorage.removeItem(`${localStateName}-expiration`);
      return undefined;
    }
  } catch(err) {
    console.error(err);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(`${localStateName}-state`, serializedState);
    const bestBefore = Date.now() + 24*60*60*1000; // one day
    localStorage.setItem(`${localStateName}-expiration`, bestBefore.toString());
  } catch(err) {
    console.error(err);
  }
};