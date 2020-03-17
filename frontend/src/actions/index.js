export const login = (token, name, email, id, group) => ({
  type: 'LOGIN',
  token,
  name,
  email,
  id,
  group
});

export const logout = () => ({type: "LOGOUT"});