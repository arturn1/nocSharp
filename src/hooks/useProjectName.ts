import { useState } from 'react';

export const useProjectName = () => {
  const [projectName, setProjectName] = useState('');

  return {
    projectName,
    setProjectName,
  };
};
