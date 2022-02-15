interface IUser {
  username: string,
  role: string,
  accessToken: string
};

interface IUser2 {
  id: number,
  username: string
};

interface IAuth extends IUser2 {
  role: string,
  accessToken: string,
  refreshToken: string
};
