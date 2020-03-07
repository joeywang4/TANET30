export const login = (token, name, email, id) => ({
  type: 'LOGIN',
  token,
  name,
  email,
  id
});

export const logout = () => ({type: "LOGOUT"});