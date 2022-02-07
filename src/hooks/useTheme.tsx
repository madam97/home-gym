import React, { createContext, useContext, useState } from 'react';

type ProvideThemeProps = {
  children: React.ReactChild
};

type TUseThemeService = {
  navTransparent: boolean,
  setNavTransparent(navTransparent: boolean): void
};

const useThemeService = (): TUseThemeService => {
  
  const [navTransparent, setNavTransparent] = useState<boolean>(false);

  return {
    navTransparent,
    setNavTransparent
  };

}

const themeContext = createContext<TUseThemeService>({
  navTransparent: false,
  setNavTransparent: (navTransparent: boolean): void => {}
});


export function useTheme(): TUseThemeService {
  return useContext(themeContext);
}

export function ProvideTheme({ children }: ProvideThemeProps): JSX.Element {
  const theme = useThemeService();

  return (
    <themeContext.Provider value={theme}>
      {children}
    </themeContext.Provider>
  );
}

