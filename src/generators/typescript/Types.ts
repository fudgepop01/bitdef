import { BigInteger as BI, BigInteger } from "jsbn";
import { TypeNode } from './TypeNode';
import { NodeFactory, TypeNodes } from "./NodeFactory";

export type RawTypes = 'str' | 'dec' | 'flt' ;
export type byteValues = 8 | 16 | 32 | 64 | 128 | 256 | 512;

export enum Endian {
  BIG,
  LITTLE
}

export interface IRawTypeArgs {
  buffer: Buffer;
  parent: TypeNode;
  kind: RawTypes;
  endian: Endian;
  signed: boolean;
  position: number;
}

export interface IRawTypeChange {
  bytes?: byteValues;
  kind?: RawTypes;
  endian?: Endian;
  signed?: boolean;
}

/**
 * a basic type container. can be string,
 * integer, or float
 *
 * @export
 * @class RawType
 */
export class RawType {
  protected endian: Endian;
  protected buffer: Buffer;
  protected array?: number[];
  protected kind: RawTypes;
  protected signed: boolean;
  public parent: TypeNode;
  protected position: number;
  constructor({kind, buffer, parent, endian, signed, position}: IRawTypeArgs) {
    this.kind = kind;
    this.buffer = buffer;
    this.parent = parent;
    this.endian = endian;
    this.signed = signed;
    this.position = position;
  }

  // #region getters
  get size(): number {
    return this.current.length * 8;
  }

  get current(): number[] | Buffer {
    if (this.array) return this.array;
    else return this.buffer;
  }
  // #endregion

  // #region formatters
  /**
   * displays each value as an ASCII character when possible.
   * all other values will be represented as •
   */
  toString(): string {
    let out = '';
    for (const num of this.current) {
      if (31 < num && num < 127) out += String.fromCharCode(num);
      else out += '•';
    }
    return out;
  }

  /**
   * represents the number as a float with the specified
   * amount of precision
   * @param size represents the number of bits
   *  can be 16, 32, or 64
   */
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

    for (const num of this.current) {
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

  /**
   * represents the value as binary
   */
  toBinary(): string { return [ ...this.current ].map(num => num.toString(2).padStart(8, '0')).join(''); }

  /**
   * represents the value as hex
   */
  toHex(): string { return [ ...this.current ].map(num => num.toString(16).padStart(2, '0')).join('') }

  /**
   * interperts the value as decimal
   */
  toDecimal(): string {
    let value: number | BigInteger;
    if (this.size > 4) value = new BI(this.toHex(), 16);
    else value = parseInt(this.toHex());
    if (value instanceof BigInteger) value.subtract(new BI(Math.ceil(Math.pow(2, this.size) / 2).toString(10)))

    return value.toString(10);
  }
  // #endregion

  // #region setters

  /**
   * creates a new array containing the characters specified
   * @param str the string to add
   */
  setString(str: string): void {
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
   * @param dependent weather or not it should care about the endinness
   */
  setHEX(hexCode: string, dependent?: boolean): void {
    if (!this.array) this.array = [...this.buffer];
    this.array = [];
    for (const hex of hexCode.match(/.{2}/)!) {
      this.array.push(parseInt(hex, 16));
    }
    if (dependent && this.endian === Endian.LITTLE) this.array = this.array.reverse();
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
  setFloat(value: number, size: byteValues): void {
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

    if (this.endian === Endian.LITTLE) this.array = this.array.reverse();
  }

  /**
   * stores the given number into this class' array
   * @param value the number to store
   * @param size the size of this value (in bits)
   * multiples of 8 only
   */
  setDecimal(value: number, size?: byteValues) {
    this.array = [];
    this.array = value.toString(16).match(/.{2}/)!.map(val => parseInt(val, 16))
    if (size) {
      let target = Math.floor(size / 8);
      while (this.array.length !== target) {
        if(this.array.length > target) this.array.shift();
        else this.array.unshift(0);
      }
    }
    if (this.endian === Endian.LITTLE) this.array = this.array.reverse();
  }
  // #endregion

  // #region general
  /**
   * gets the value based on what kind this is
   *
   * @type {string}
   * @memberof RawType
   */
  get value(): string {
    switch(this.kind) {
      case 'dec': return this.toDecimal();
      case 'flt': return this.toFloat(this.size);
      case 'str': return this.toString();
      default: return 'NA';
    }
  }

  /**
   * a somewhoat dangerous and incomplete method
   * - does not yet work with pointers / offsets
   * gets the value depending on the kind of value this is
   * @memberof RawType
   */
  set value(newValue: string) {
    switch(this.kind) {
      case 'dec': this.setDecimal(parseInt(newValue)); break;
      case 'flt': this.setFloat(parseInt(newValue), this.current.length * 8 as byteValues); break;
      case 'str': this.setString(newValue); break;
      default: return;
    }
  }

  /**
   * sets the parameters of this variable
   * - can set bytecount, kind, endian, and the signage
   *
   * @memberof RawType
   */
  set params({bytes, kind, endian, signed}: IRawTypeChange) {
    if (!this.array) this.array = [...this.buffer];
    let { array } = this;

    if (bytes && bytes !== this.current.length) {
      while (array.length !== bytes) {
        if (array.length > bytes) {
          switch(this.endian) {
            case Endian.BIG: array.shift(); break;
            case Endian.LITTLE: array.pop(); break;
          }
        } else {
          switch(this.endian) {
            case Endian.BIG: array.unshift(0); break;
            case Endian.LITTLE: array.push(0); break;
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
  // #endregion
}

export interface IBitFieldArgs {
  parent: TypeNode;
  position: number;
  subPosition: number;
  bitCount: number;
  chunk: number[];
  endian: Endian;
}

/**
 * part of a field of individual bits with
 * varying lengths
 *
 * @export
 * @class BitField
 */
export class BitField {
  protected position: number;
  protected subPosition: number;
  protected parent: TypeNode;
  protected bitCount: number;
  protected chunk: number[];
  protected value: number;

  constructor({parent, position, subPosition, bitCount, chunk, endian}: IBitFieldArgs) {
    this.parent = parent;
    this.position = position;
    this.subPosition = subPosition;
    this.bitCount = bitCount;
    this.chunk = chunk;

    if (endian === Endian.LITTLE) chunk = chunk.reverse();

    let allBits = this.chunk.map(num => num.toString(2).padStart(8, '0')).join('');
    let mask = (new Array(this.subPosition).fill('0').join('') + new Array(this.bitCount).fill('1').join('')).padEnd(this.chunk.length * 8, '0');
    this.value = parseInt(allBits, 2) & parseInt(mask, 2);
  }

  setValue(value: number) {
    if (value > parseInt(new Array(this.bitCount).fill('1').join(''), 2) || value < 0) return;
    this.value = value;
  }

  getValue() { return this.value }
}

/**
 * a pointer creates and references another node
 * based upon a given type
 *
 * @export
 * @class Pointer
 */
export class Pointer {
  protected position: number;
  protected parent: TypeNode;
  protected reference: TypeNode;
  protected value: number;

  constructor({parent, position, reference, buf, endian}: {parent: TypeNode, position: number, reference: TypeNodes, buf: Buffer, endian: Endian}) {
    this.parent = parent;
    this.position = position;

    let arr: number[];
    if (endian === Endian.LITTLE) arr = [...buf].reverse();
    else arr = [...buf];
    this.value = parseInt(arr.map(num => num.toString(16).padStart(2, '0')).join(''), 16);
    this.reference = NodeFactory(reference, {root: this.parent.root, position: this.position + this.value, referenced: this});
  }
}