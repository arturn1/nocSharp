export const joinPaths = (...paths: string[]): string => {
    return paths.join('/').replace(/\\/g, '/');
  };
  