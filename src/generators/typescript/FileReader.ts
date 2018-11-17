import { readFileSync } from "fs";

export class FileReader {
  public position: number = 0;
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
    while (this.position % alignment !== 0) this.position ++;
  }
  // #endregion

  // #region getters
  get i8 () { return  }

  // #endregion
}