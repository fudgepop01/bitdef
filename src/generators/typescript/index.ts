import { i8 } from './integers';
import {BigInteger as BI} from 'jsbn'
import { EventEmitter } from 'events';

// <enums>

export interface ITypeNodeArgs {
  buffer: Buffer,
  parent?: TypeNode,
  root?: TypeNode
}

/**
 * extends EventEmitter so that it may send events to
 * other nodes
 */
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

  protected get i8() { return new i8(this.buffer.slice(), this) }
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

  // protected get f64b() { return new f64b(this.buffer.slice(), this) }
  // protected get f64l() { return new f64l(this.buffer.slice(), this) }

  // protected get pointer() { return new pointer(this.buffer.slice(), this) }

  // protected bitfield(size: number) { return new bitfield(this.buffer.slice(), this) }

  /**
   * automatically called when a node has finished being initialized
   */
  protected finalize() {

  }

  /**
   * adds to the overall progress of the root's
   * @param amount how much progress to add (in bytes)
   */
  public incProgress(amount: number) {
    this.progress += amount;
  }
  public incBit(amount: number) {
    this.
    this.bits += amount;
    this.bits %= 8;
  }
}

export interface IRawType {
  size: number;
  buffer: Buffer;
  parent: TypeNode;
  biValue: BI;
  value: string | number;
}

export abstract class RawType {
  public buffer: Buffer;
  public parent: TypeNode;
  public biValue: BI;
  constructor(buffer: Buffer, parent: TypeNode) {
    this.buffer = buffer;
    this.biValue = new BI([...buffer].map(val => val.toString(2).padStart(2, '0')).join(''), 16);
    this.parent = parent;
  }
}
