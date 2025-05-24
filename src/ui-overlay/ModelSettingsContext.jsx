import { createContext, useContext } from 'react';

export const ModelSettingsContext = createContext();

export const useModelSettings = () => useContext(ModelSettingsContext);
