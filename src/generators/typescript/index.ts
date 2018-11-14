import { i8 } from './integers';
import {BigInteger as BI} from 'jsbn'
import { EventEmitter } from 'events';

// <enums>

export interface ITypeNodeArgs {
  buffer: Buffer,
  parent?: TypeNode,
  root?: TypeNode
}

export class TypeNode {
  public buffer: Buffer;
  public array: Array<number> | undefined;
  public children: Array<TypeNode | RawType> = [];
  public root: TypeNode;
  public parent?: TypeNode;
  public pointers: Array<RawType> = [];
  public progress: number = 0;
  public bits: number = 0;
  constructor({parent, buffer, root}: ITypeNodeArgs) {
    this.root = (root) ? root : this;
    this.parent = (parent) ? parent : undefined;
    this.buffer = buffer;
  }

  protected get i8() { return new i8(this.buffer.slice(this.progress, this.progress + 1), this, 'i8') }
  // protected get u8() { return new u8(this.buffer.slice(), this) }

  // protected get i16b() { return new i16b(this.buffer.slice(), this) }
  // protected get u16b() { return new u16b(this.buffer.slice(), this) }
  // protected get u16l() { return new u16l(this.buffer.slice(), this) }
  // protected get i16l() { return new i16l(this.buffer.slice(), this) }

  // protected get i24b() { return new i24b(this.buffer.slice(), this) }
  // protected get u24b() { return new u24b(this.buffer.slice(), this) }
  // protected get u24l() { return new u24l(this.buffer.slice(), this) }
  // protected get i24l() { return new i24l(this.buffer.slice(), this) }

  // protected get i32b() { return new i32b(this.buffer.slice(), this) }
  // protected get u32b() { return new u32b(this.buffer.slice(), this) }
  // protected get u32l() { return new u32l(this.buffer.slice(), this) }
  // protected get i32l() { return new i32l(this.buffer.slice(), this) }

  // protected get i64b() { return new i64b(this.buffer.slice(), this) }
  // protected get u64b() { return new u64b(this.buffer.slice(), this) }
  // protected get u64l() { return new u64l(this.buffer.slice(), this) }
  // protected get i64l() { return new i64l(this.buffer.slice(), this) }

  // protected get i128b() { return new i128b(this.buffer.slice(), this) }
  // protected get u128b() { return new u128b(this.buffer.slice(), this) }
  // protected get u128l() { return new u128l(this.buffer.slice(), this) }
  // protected get i128l() { return new i128l(this.buffer.slice(), this) }

  // protected get f16b() { return new f16b(this.buffer.slice(), this) }
  // protected get f16l() { return new f16l(this.buffer.slice(), this) }

  // protected get f32b() { return new f32b(this.buffer.slice(), this) }
  // protected get f32l() { return new f32l(this.buffer.slice(), this) }

  protected get f64b() { return new RawType({ type: 'flt', endian: 'b',  }) }
  // protected get f64l() { return new f64l(this.buffer.slice(), this) }

  // protected get pointer() { return new pointer(this.buffer.slice(), this) }

  // protected bitfield(size: number) { return new bitfield(this.buffer.slice(), this) }


  /**
   * trims the buffer to its size
   * automatically called when a node has finished being initialized
   */
  protected finalize() {
    this.buffer.slice(0, this.progress);
  }

  /**
   * adds to the overall progress
   * @param amount how much progress to add (in bytes)
   */
  public incProgress(amount: number) {
    this.progress += amount;
    if (this.parent) this.parent.incProgress(amount);
  }

  /**
   * adds to the overall progress
   * @param amount how much progress to add (in bits)
   */
  public incBit(amount: number) {
    this.bits += amount;
    this.bits %= 8;

    if (this.parent) this.parent.incBit(amount);
  }
}

export type RawTypes = 'str' | 'dec' | 'flt' | 'ptr' | 'bit';
export type byteValues = 1 | 2 | 3 | 4 | 6 | 8 | 16 | 32 | 64 | 128 | 256 | 512;
export type bitValues =
  1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  |
  10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 |
  20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 |
  30 | 31 | 32;

export interface IRawTypeArgs {
  bytes: byteValues;
  buffer: Buffer;
  parent: TypeNode;
  kind: RawTypes;
  bits: bitValues;
  endian: 'b' | 'l';
}

export interface IRawTypeChange {
  bytes?: byteValues;
  buffer?: Buffer;
  parent?: TypeNode;
  kind?: RawTypes;
  bits?: bitValues;
  endian?: 'b' | 'l';
}

export class RawType {
  public bytes: byteValues;
  public bits: bitValues;
  public endian: 'b' | 'l';
  public buffer: Buffer;
  public array?: number[];
  public kind: RawTypes;
  public parent: TypeNode;
  public child?: TypeNode;
  constructor({bytes, kind, buffer, parent, bits, endian}: IRawTypeArgs) {
    this.bytes = bytes;
    this.kind = kind;
    this.buffer = buffer;
    this.parent = parent;
    this.bits = bits;
    this.endian = endian;
  }

  toString(): string {
    let out = '';
    for (const num of (this.array) ? this.array : [...this.buffer]) {
      if (31 < num && num < 127) out += String.fromCharCode(num);
      else out += '•';
    }
    return out;
  }

  toFloat(size: number): string {
    let fullBin = '';
    let exponentBitCount: number;
    switch(size) {
      case 2: exponentBitCount = 5; break;
      case 4: exponentBitCount = 8; break;
      case 8: exponentBitCount = 11; break;
      case 16: exponentBitCount = 15; break;
      case 32: exponentBitCount = 19; break;

      default:
        return "NA"
    }

    for (const num of (this.array) ? this.array : [...this.buffer]) {
      fullBin += num.toString(2).padStart(8, '0');
    }

    let sign = fullBin.substring(0, 1);
    let exponent = parseInt(fullBin.substring(1, exponentBitCount + 1), 2);
    let mantissa = '1' + fullBin.substring(exponentBitCount + 1);

    exponent -= Math.pow(2, exponentBitCount) / 2 - 1;

    let total = 0;
    for (let [i, num] of Object.entries(mantissa)) {
      if (num === '1') total += Math.pow(2, exponent - parseInt(i))
    }
    if (sign === '1') total *= -1;

    return total.toString();
  }

  toBinary(): string {
    if (this.array) return this.array.map(num => num.toString(2).padStart(8, '0')).join('');
    else return [...this.buffer].map(num => num.toString(2).padStart(8, '0')).join('');
  }

  toHex(): string {
    if (this.array) return this.array.map(num => num.toString(16).padStart(2, '0')).join('')
    else return [...this.buffer].map(num => num.toString(16).padStart(2, '0')).join('');
  }

  toDecimal(): string {
    if (this.array) {
      if (this.array.length > 4) return new BI(this.toHex(), 2).toString(10);
      else return parseInt(this.toHex()).toString(10);
    }

    if (this.buffer.length > 4) return new BI(this.toHex(), 2).toString(10);
    else return parseInt(this.toHex()).toString(10);
  }

  get value(): string {
    switch(this.kind) {
      case 'dec': return this.toDecimal();
      case 'flt': return this.toFloat(this.bytes);
      case 'ptr': return this.toDecimal();
      case 'str': return this.toString();
      case 'bit': return this.toBinary();
      default: return 'NA';
    }
  }

  set params({bytes, kind, buffer, parent, bits, endian}: IRawTypeChange) {
    if (!this.array) this.array = [...this.buffer];
    if (bytes !== this.bytes) this.bytes
  }
}
