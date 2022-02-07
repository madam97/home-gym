interface IFormErrors {
  [name: string]: string | undefined
};

interface IRoute {
  path: string,
  exact: boolean,
  loginRequired: boolean,
  showInHeader: boolean,
  component: any,
  name: string,
  props?: object
};