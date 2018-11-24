import { readFileSync } from "fs";
import { RawType, Endian, IRawTypeArgs, BitField, Pointer } from './Types';
import { TypeNode } from './TypeNode';
import { TypeNodes } from "./NodeFactory";

export class FileReader {
  public position: number = 0; // bytes
  public subPosition: number = 0; // bits
  public buffer: Buffer;
  constructor (path: string) {
    this.buffer = readFileSync(path);
  }

  // #region utility
  jump (location: number) {
    this.position = location;
  }

  skip (byteCount: number) {
    this.position += byteCount;
  }

  align (alignment: number) {
    if (this.subPosition !== 0) {
      this.position ++;
      this.subPosition = 0;
    }
    while (this.position % alignment !== 0) this.position ++;
  }
  // #endregion

  // #region factory methods
  getRawType (adjustment: number, parent: TypeNode, endian: Endian, kind: IRawTypeArgs['kind'], signed: boolean) {
    this.position += adjustment;
    return new RawType({kind, buffer: this.buffer.slice(this.position - adjustment, this.position), parent, endian, signed, position: this.position - adjustment});
  }

  // shorthands
  i8 (parent: TypeNode) { return this.getRawType(1, parent, Endian.BIG, 'dec', true) }
  u8 (parent: TypeNode) { return this.getRawType(1, parent, Endian.BIG, 'dec', false) }

  i16b (parent: TypeNode) { return this.getRawType(2, parent, Endian.BIG, 'dec', true) }
  i16l (parent: TypeNode) { return this.getRawType(2, parent, Endian.LITTLE, 'dec', true) }
  u16b (parent: TypeNode) { return this.getRawType(2, parent, Endian.BIG, 'dec', false) }
  u16l (parent: TypeNode) { return this.getRawType(2, parent, Endian.LITTLE, 'dec', false) }

  i32b (parent: TypeNode) { return this.getRawType(4, parent, Endian.BIG, 'dec', true) }
  i32l (parent: TypeNode) { return this.getRawType(4, parent, Endian.LITTLE, 'dec', true) }
  u32b (parent: TypeNode) { return this.getRawType(4, parent, Endian.BIG, 'dec', false) }
  u32l (parent: TypeNode) { return this.getRawType(4, parent, Endian.LITTLE, 'dec', false) }

  i64b (parent: TypeNode) { return this.getRawType(8, parent, Endian.BIG, 'dec', true) }
  i64l (parent: TypeNode) { return this.getRawType(8, parent, Endian.LITTLE, 'dec', true) }
  u64b (parent: TypeNode) { return this.getRawType(8, parent, Endian.BIG, 'dec', false) }
  u64l (parent: TypeNode) { return this.getRawType(8, parent, Endian.LITTLE, 'dec', false) }

  i128b (parent: TypeNode) { return this.getRawType(16, parent, Endian.BIG, 'dec', true) }
  i128l (parent: TypeNode) { return this.getRawType(16, parent, Endian.LITTLE, 'dec', true) }
  u128b (parent: TypeNode) { return this.getRawType(16, parent, Endian.BIG, 'dec', false) }
  u128l (parent: TypeNode) { return this.getRawType(16, parent, Endian.LITTLE, 'dec', false) }

  i256b (parent: TypeNode) { return this.getRawType(32, parent, Endian.BIG, 'dec', true) }
  i256l (parent: TypeNode) { return this.getRawType(32, parent, Endian.LITTLE, 'dec', true) }
  u256b (parent: TypeNode) { return this.getRawType(32, parent, Endian.BIG, 'dec', false) }
  u256l (parent: TypeNode) { return this.getRawType(32, parent, Endian.LITTLE, 'dec', false) }

  // floats
  f16b (parent: TypeNode) { return this.getRawType(2, parent, Endian.BIG, 'flt', true) }
  f16l (parent: TypeNode) { return this.getRawType(2, parent, Endian.LITTLE, 'flt', true) }

  f32b (parent: TypeNode) { return this.getRawType(4, parent, Endian.BIG, 'flt', true) }
  f32l (parent: TypeNode) { return this.getRawType(4, parent, Endian.LITTLE, 'flt', true) }

  f64b (parent: TypeNode) { return this.getRawType(8, parent, Endian.BIG, 'flt', true) }
  f64l (parent: TypeNode) { return this.getRawType(8, parent, Endian.LITTLE, 'flt', true) }

  // char / strings
  str (parent: TypeNode, size: number) {
    return this.getRawType(size, parent, Endian.BIG, 'str', true)
  }

  // null-terminated string
  ntstr (parent: TypeNode) {
    let adjustment = 1;
    while (this.buffer[this.position + adjustment] !== 0) {
      adjustment ++;
    }
    return this.getRawType(adjustment, parent, Endian.BIG, 'str', true);
  }

  // bitfields
  bitfield(length: number, parent: TypeNode, endian: Endian) {
    let adjustment = Math.floor(length / 8);
    let subAdjustment = length % 8;

    this.position += adjustment;
    this.subPosition += subAdjustment;

    let chunk = [...this.buffer.slice(this.position - adjustment, this.position)];

    return new BitField({parent, position: this.position, subPosition: this.subPosition, bitCount: length, chunk, endian})
  }

  // pointers

  // signed-pointer
  spointer(parent: TypeNode, targetType: TypeNodes, endian: Endian) {
    let adjustment = 4;
    let ptr = new Pointer({parent, reference: targetType, buf: this.buffer.slice(this.position, this.position + adjustment), position: this.position, endian, signed: true});
    let temp = this.position;
    this.position += ptr.value;
    ptr.initReference();
    this.position = temp;

  }

  // unsigned-pointer
  upointer(parent: TypeNode, targetType: TypeNodes, endian: Endian) {
    let adjustment = 4;
    let ptr = new Pointer({parent, reference: targetType, buf: this.buffer.slice(this.position, this.position + adjustment), position: this.position, endian, signed: false})
    let temp = this.position;
    this.position += ptr.value;
    ptr.initReference();
    this.position = temp;
  }

  // #endregion
}