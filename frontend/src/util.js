export const inArray = (array, data) => array.find(element => element === data) !== undefined;

const prefixZero = (num, len = 2) => {
  const raw = String(num);
  return raw.length < len ? "0".repeat(len-raw.length)+raw : raw;
}

export const epochToTime = (_begin, _end) => {
  const begin = new Date(_begin);
  const end = new Date(_end);
  const year = begin.getFullYear();
  const beginMonth = begin.getMonth()+1;
  const endMonth = end.getMonth()+1;
  const beginDate = begin.getDate();
  const endDate = end.getDate();
  const beginHour = prefixZero(begin.getHours());
  const beginMinute = prefixZero(begin.getMinutes());
  const endHour = prefixZero(end.getHours());
  const endMinute = prefixZero(end.getMinutes());
  return `${year} ${beginMonth}/${beginDate} ${beginHour}:${beginMinute} ~ ${endMonth}/${endDate} ${endHour}:${endMinute}`;
}

export const epochToDate = (_time) => {
  const time = new Date(_time);
  const year = time.getFullYear();
  const beginMonth = time.getMonth()+1;
  const beginDate = time.getDate();
  return `${year} ${beginMonth}/${beginDate}`;
}

export const today = () => {
  const d = new Date();
  const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [{ value: mm },,{ value: dd },,{ value: yy }] = dtf.formatToParts(d);
  return `${yy}-${mm}-${dd}`;
}

export const todayRange = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return [d.getTime(), d.getTime()+60*60*24*1000];
}

export const parseQRCode = (data) => {
  let idx = data.indexOf('#') + 1;
  return data.substring(idx);
}

export const usedDate = (usedTime) => {
  const d = new Date(usedTime);
  const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit', hour:'2-digit', minute:'2-digit', hour12: false, });
  const [{ value: mm },,{ value: dd },,{ value: yy },,{ value: hh },,{ value: ii }] = dtf.formatToParts(d);
  return `${yy}-${mm}-${dd}-${hh}:${ii}`;
}