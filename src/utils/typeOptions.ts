import { Entity } from '../models/Entity';

export const csharpTypes = [
  'bool', 'byte', 'char', 'DateTime', 'decimal', 'double', 'dynamic', 'float', 'Guid',
  'int', 'long', 'object', 'sbyte', 'short', 'string', 'TimeSpan', 'uint', 'ulong', 'ushort'
];

export const collectionTypes = [
  'BlockingCollection', 'ConcurrentDictionary', 'ConcurrentQueue', 'ConcurrentStack', 'Dictionary', 'HashSet',
  'ICollection', 'IDictionary', 'IEnumerable', 'IList', 'KeyedCollection', 'LinkedList', 'List',
  'ObservableCollection', 'ReadOnlyCollection', 'ReadOnlyDictionary', 'SortedDictionary', 'SortedList'
];

export const getTypeOptions = (entities: Entity[], entityIndex: number) => {
  const previousEntities = entities.slice(0, entityIndex).map(e => e.name).filter(name => name !== '');
  return [...csharpTypes, ...previousEntities];
};
