import { RawType, Pointer } from './Types';

// <enums>

export interface ITypeNodeArgs {
  position: number,
  parent?: TypeNode,
  referenced?: Pointer,
  root?: TypeNode
}

export class TypeNode {
  public position: number;
  public array: Array<number> | undefined;
  public children: Array<TypeNode | RawType> = [];
  public root: TypeNode;
  public referenced?: Pointer;
  public parent?: TypeNode;
  public progress: number = 0;
  public bits: number = 0;
  constructor({position, parent, root, referenced}: ITypeNodeArgs) {
    this.position = position;
    this.root = (root) ? root : this;
    this.parent = (parent) ? parent : undefined;
    this.referenced = (referenced) ? referenced : undefined;
  }
}