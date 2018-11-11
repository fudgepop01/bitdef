interface ITypeNodeArgs {
  parent: TypeNode,
  buffer: Buffer,
  root?: TypeNode,
  address: number
}

class TypeNode {
  public buffer: Buffer;
  public address: {
    abs?: number;
    rel?: number;
  } = {};
  public children: TypeNode[] = [];
  public parent: TypeNode;
  public root?: TypeNode;
  constructor(args: ITypeNodeArgs) {
    if (!args.root) { this.root = this; }
    this.parent = args.parent;
    this.address.rel = args.address;
    this.address.abs = args.address;
    this.buffer = args.buffer;
  }

  // <getters>
  // <setters>
}
