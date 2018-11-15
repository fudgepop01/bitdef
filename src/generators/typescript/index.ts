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

export type RawTypes = 'str' | 'dec' | 'flt' | 'ptr' | 'off' | 'bit';
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
  endian: 'b' | 'l';
  signed: boolean;
  position: number;
}

export interface IRawTypeChange {
  bytes?: byteValues;
  kind?: RawTypes;
  endian?: 'b' | 'l';
  signed?: boolean;
}

export class RawType {
  protected bytes: byteValues;
  protected endian: 'b' | 'l';
  protected buffer: Buffer;
  protected array?: number[];
  protected kind: RawTypes;
  protected parent: TypeNode;
  protected signed: boolean;
  protected child?: TypeNode | RawType;
  protected position: number;
  constructor({bytes, kind, buffer, parent, endian, signed, position}: IRawTypeArgs) {
    this.bytes = bytes;
    this.kind = kind;
    this.buffer = buffer;
    this.parent = parent;
    this.endian = endian;
    this.signed = signed;
    this.position = position;
  }

  // #region getters
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
    let exponentBitCount;
    switch(size) {
      case 16: exponentBitCount = 5; break;
      case 32: exponentBitCount = 8; break;
      case 64: exponentBitCount = 11; break;
      // case 128: exponentBitCount = 15; break;
      // case 256: exponentBitCount = 19; break;
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
  // #endregion

  // #region setters

  /**
   * creates a new array containing the characters specified
   * @param str the string to add
   */
  setString(str: string): void {
    if (!this.array) this.array = [...this.buffer];
    this.array = [];
    for (const char of str.split('')) {
      const code = char.charCodeAt(0);
      if (31 < code && code < 127) this.array.push(code);
    }
  }

  /**
   * creates a new array containing the hexidecimal values specified.
   * this can be any length
   * @param str the hexidecimal string of values that will be added
   */
  setStringHEX(str: string): void {
    if (!this.array) this.array = [...this.buffer];
    this.array = [];
    for (const char of str.match(/.{1,2}/)!) {
      const code = char.charCodeAt(0);
      if (31 < code && code < 127) this.array.push(code);
    }
  }

  /**
   * converts the input to a floating point number.
   * only supports 16, 32, 64, 128, and 256-bit numbers.
   * Well, it would, if javascript also went up to 256 bits
   * for its floats.
   * (IEEE-754 standard)
   * @param value what number to set / round it to
   * @param size the number of bytes it takes
   */
  setFloat(value: number, size: number): void {
    let exponentBitCount;
    switch(size) {
      case 16: exponentBitCount = 5; break;
      case 32: exponentBitCount = 8; break;
      case 64: exponentBitCount = 11; break;
      //case 128: exponentBitCount = 15; break;
      //case 256: exponentBitCount = 19; break;
      default:
        return;
    }

    let sign = (value < 0) ? 1 : 0;

    value = Math.abs(value);

    let fullNum = Math.floor(value);
    let decimal = value - fullNum;
    let decMantissaLimit = (size - 1 - exponentBitCount) - fullNum.toString(2).length + 3;
    let decMantissa = '';

    for (let i = 0; i < decMantissaLimit; i ++) {
      decimal *= 2;
      decMantissa += Math.floor(decimal);
      if (decimal >= 1) decimal -= 1;
    }

    let rounding = decMantissa.substring(decMantissa.length - 2);
    decMantissa = decMantissa.substring(0, decMantissa.length - 2);
    if (rounding.charAt(0) === '1') {
      decMantissa = (parseInt(decMantissa, 2) + 1).toString(2);
      if (/10+$/.test(decMantissa)) {
        fullNum += 1;
        decMantissa = '';
      }
    }
    let exponent = fullNum.toString(2).length - 1 + (Math.pow(2, exponentBitCount) / 2 - 1);
    if (fullNum === 0) {
      if (decMantissa === '') exponent = 0;
      else exponent = (Math.pow(2, exponentBitCount) / 2 - 1) - decMantissa.match(/^(0*)/)![0].length - 1;
    }
    let expBin = exponent.toString(2).padStart(exponentBitCount, '0');

    let fullBin = sign +
    expBin +
    (fullNum.toString(2) + decMantissa).padEnd((size - 1 - exponentBitCount) - fullNum.toString(2).length, '0').substring(1);

    this.array = [];
    for (let i = 0; i < size; i += 8) {
      this.array.push(parseInt(fullBin.substring(i, i+8), 2));
    }

    if (this.endian === 'l') this.array = this.array.reverse();
  }
  // #endregion

  get value(): string | number {
    switch(this.kind) {
      case 'dec': return this.toDecimal();
      case 'flt': return this.toFloat(this.bytes);
      case 'ptr': return this.toDecimal();
      case 'off': return this.toDecimal();
      case 'str': return this.toString();
      case 'bit': return this.toBinary();
      default: return 'NA';
    }
  }

  set value(newValue: string | number) {
    switch(this.kind) {
      case 'dec':
    }
  }

  set params({bytes, kind, endian, signed}: IRawTypeChange) {
    if (!this.array) this.array = [...this.buffer];
    let { array } = this;

    if (bytes && bytes !== this.bytes) {
      while (array.length !== bytes) {
        if (array.length > bytes) {
          switch(this.endian) {
            case 'b': array.shift(); break;
            case 'l': array.pop(); break;
          }
        } else {
          switch(this.endian) {
            case 'b': array.unshift(0); break;
            case 'l': array.push(0); break;
          }
        }
      }
    }

    if (kind && kind !== this.kind) {
      this.kind = kind;
    }

    if (endian && endian !== this.endian) {
      this.endian = endian;
      array = array.reverse();
    }

    if (signed && signed !== this.signed) {
      this.signed = signed;
    }
  }
}

export class bitField {
  protected position: number;
  protected fields: string[];
}