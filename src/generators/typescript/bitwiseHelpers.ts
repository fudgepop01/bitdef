type bitwiseArg = Buffer | string | number;

function toBin(arg1: bitwiseArg) {
  let a;
  if (arg1 instanceof Buffer ) {
    a = [...arg1].map(num => {
      return num.toString(2).padStart(8, '0')
    }).join('');
  } else if (typeof arg1 === "number") {
    a = arg1.toString(2).padStart(8, '0')
  } else {
    a = arg1;
  }

  a = a.match(/.{1,8}/g) || ['00000000'];
  a[a.length - 1] = a[a.length - 1].padStart(8, '0')

  return a;
}

// BINARY OPERATIONS

export function bigOR (subject: Buffer, modifier: bitwiseArg) {
  let a = toBin(subject);
  let b = toBin(modifier);

  let out: string[] | string = [];
  while (a.length > 0 || b.length > 0 ) {
    const atemp = parseInt(a.pop() || '0', 2);
    const btemp = parseInt(b.pop() || '0', 2);

    out.push((atemp | btemp).toString(2).padStart(8, '0'));
  }

  out = out.reverse().join('');

  const outValues = (out.match(/.{1,8}/g) || []).map(str => parseInt(str, 2));

  if (subject instanceof Buffer) {
    for (let i = subject.length - 1; i >= 0; i--) {
      subject[i] = outValues[i];
    }
  }
}

export function bigXOR (subject: Buffer, modifier: bitwiseArg) {
  let a = toBin(subject);
  let b = toBin(modifier);

  let out: string[] | string = [];
  while (a.length > 0 || b.length > 0 ) {
    const atemp = parseInt(a.pop() || '0', 2);
    const btemp = parseInt(b.pop() || '0', 2);

    out.push((atemp ^ btemp).toString(2).padStart(8, '0'));
  }

  out = out.reverse().join('');

  const outValues = (out.match(/.{1,8}/g) || []).map(str => parseInt(str, 2));

  if (subject instanceof Buffer) {
    for (let i = subject.length - 1; i >= 0; i--) {
      subject[i] = outValues[i];
    }
  }
}

export function bigAND (subject: Buffer, modifier: bitwiseArg) {
  let a = toBin(subject);
  let b = toBin(modifier);

  let out: string[] | string = [];
  while (a.length > 0 || b.length > 0 ) {
    const atemp = parseInt(a.pop() || '0', 2);
    const btemp = parseInt(b.pop() || '0', 2);

    out.push((atemp & btemp).toString(2).padStart(8, '0'));
  }

  out = out.reverse().join('');

  const outValues = (out.match(/.{1,8}/g) || []).map(str => parseInt(str, 2));

  if (subject instanceof Buffer) {
    for (let i = subject.length - 1; i >= 0; i--) {
      subject[i] = outValues[i];
    }
  }
}

// UNARY

export function bigNOT (subject: Buffer) {
  let a = toBin(subject);

  let out: string[] | string = [];
  while (a.length > 0 || b.length > 0 ) {
    const atemp = parseInt(a.pop() || '0', 2);

    out.push((~ atemp).toString(2).padStart(8, '0'));
  }

  out = out.reverse().join('');

  const outValues = (out.match(/.{1,8}/g) || []).map(str => parseInt(str, 2));

  if (subject instanceof Buffer) {
    for (let i = subject.length - 1; i >= 0; i--) {
      subject[i] = outValues[i];
    }
  }
}