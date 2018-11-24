import { TypeNode, ITypeNodeArgs } from './TypeNode';
import { RawType, BitField, Pointer } from './Types';


export enum TypeNodes {
  // <TYPENODES>
}

/**
 * used in pointers to generate the pointer's
 * target type
 * @param type which typenode to generate
 * @param args the args for that typenode
 */
export const NodeFactory = (type: TypeNodes, args: ITypeNodeArgs): TypeNode | undefined => {
  return ({
    // <TYPENODES_FACTORY>
    default: () => { return undefined }
  })[type]();
}