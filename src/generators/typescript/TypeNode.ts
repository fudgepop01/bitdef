import { RawType } from './Types';

// <enums>

export interface ITypeNodeArgs {
  offset: number,
  parent?: TypeNode,
  root?: TypeNode
}

export class TypeNode {
  public offset: number;
  public array: Array<number> | undefined;
  public children: Array<TypeNode | RawType> = [];
  public root: TypeNode;
  public parent?: TypeNode;
  public progress: number = 0;
  public bits: number = 0;
  constructor({offset, parent, root}: ITypeNodeArgs) {
    this.offset = offset;
    this.root = (root) ? root : this;
    this.parent = (parent) ? parent : undefined;
  }
}