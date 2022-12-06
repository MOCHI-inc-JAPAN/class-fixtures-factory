/**
 * Get possible values from an enum
 * @param enumObj
 */
export const getEnumValues = (enumObj: {
  [key: string]: any;
  propertyIsEnumerable: (key: string) => boolean;
}) => {
  const keysList = Object.getOwnPropertyNames(enumObj).filter((key: string) => {
    // eslint-disable-next-line no-prototype-builtins
    return enumObj.propertyIsEnumerable(key) && key !== String(parseFloat(key));
  });
  const length = keysList.length;
  const valuesList = new Array<any>(length);
  for (let index = 0; index < length; ++index) {
    const key = keysList[index];
    const value = enumObj[key];
    valuesList[index] = value;
  }
  return valuesList;
};
