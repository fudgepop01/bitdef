import { RawType, Pointer } from './Types';
import { FileReader } from './FileReader';

// <enums>

export interface ITypeNodeArgs {
  position: number,
  parent?: TypeNode,
  referenced?: Pointer,
  root?: TypeNode,
  reader?: FileReader
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
  public reader: FileReader;
  constructor({position, parent, root, referenced, reader}: ITypeNodeArgs) {
    this.position = position;
    this.root = (root) ? root : this;
    this.parent = (parent) ? parent : undefined;
    this.reader = (reader) ? reader : this.root.reader;
    this.referenced = (referenced) ? referenced : undefined;
  }

  finalize() {
    if (this.parent) this.parent.progress += this.progress;
  }
}