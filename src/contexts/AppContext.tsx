import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Entity } from '../models/Entity';

export interface AppState {
  projectName: string;
  entities: Entity[];
  directoryPath: string;
  isExistingProject: boolean;
  executeCommands: boolean;
  logs: string[];
  errors: string[];
  isLoading: boolean;
}

export type AppAction =
  | { type: 'SET_PROJECT_NAME'; payload: string }
  | { type: 'SET_ENTITIES'; payload: Entity[] }
  | { type: 'ADD_ENTITY'; payload: Entity }
  | { type: 'UPDATE_ENTITY'; payload: { index: number; entity: Entity } }
  | { type: 'REMOVE_ENTITY'; payload: number }
  | { type: 'SET_DIRECTORY_PATH'; payload: string }
  | { type: 'SET_IS_EXISTING_PROJECT'; payload: boolean }
  | { type: 'SET_EXECUTE_COMMANDS'; payload: boolean }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_LOGS' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  projectName: '',
  entities: [],
  directoryPath: '',
  isExistingProject: false,
  executeCommands: true,
  logs: [],
  errors: [],
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  
  let newState: AppState;
  
  switch (action.type) {
    case 'SET_PROJECT_NAME':
      newState = { ...state, projectName: action.payload };
      break;
    case 'SET_ENTITIES':
      newState = { ...state, entities: action.payload };
      break;
    case 'ADD_ENTITY':
      newState = { ...state, entities: [...state.entities, action.payload] };
      break;
    case 'UPDATE_ENTITY':
      newState = {
        ...state,
        entities: state.entities.map((entity, index) =>
          index === action.payload.index ? action.payload.entity : entity
        ),
      };
      break;
    case 'REMOVE_ENTITY':
      newState = {
        ...state,
        entities: state.entities.filter((_, index) => index !== action.payload),
      };
      break;
    case 'SET_DIRECTORY_PATH':
      newState = { ...state, directoryPath: action.payload };
      break;
    case 'SET_IS_EXISTING_PROJECT':
      newState = { ...state, isExistingProject: action.payload };
      break;
    case 'SET_EXECUTE_COMMANDS':
      newState = { ...state, executeCommands: action.payload };
      break;
    case 'ADD_LOG':
      newState = { ...state, logs: [...state.logs, action.payload] };
      break;
    case 'ADD_ERROR':
      newState = { ...state, errors: [...state.errors, action.payload] };
      break;
    case 'CLEAR_LOGS':
      newState = { ...state, logs: [] };
      break;
    case 'CLEAR_ERRORS':
      newState = { ...state, errors: [] };
      break;
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload };
      break;
    case 'RESET_STATE':
      newState = initialState;
      break;
    default:
      newState = state;
  }
  
  return newState;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
