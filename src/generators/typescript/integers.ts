import { TypeNode, RawType, IRawType } from './index';


export class i8 extends RawType implements IRawType {
  constructor(buffer: Buffer, parent: TypeNode) {
    super(buffer, parent);
  }

  get value(): string { return this.biValue.toString() }
}