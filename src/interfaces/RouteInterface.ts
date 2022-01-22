interface IRoute {
  path: string,
  exact: boolean,
  component: any,
  props?: object
};