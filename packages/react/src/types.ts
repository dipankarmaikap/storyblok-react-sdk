interface ISbComponentType<T extends string> {
  _uid?: string;
  component?: T;
  _editable?: string;
}
type SbBlokKeyDataTypes = string | number | object | boolean | undefined;

export interface SbBlokData extends ISbComponentType<string> {
  [index: string]: SbBlokKeyDataTypes;
}
