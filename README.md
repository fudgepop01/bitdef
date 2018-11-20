# Bitdef

a language to generate typescript code to parse binary file formats

---

I had a problem: there aren't many ways to write binary file parsers
that can support extremely complex structures in **typescript** without a large
amount of code repetition. Defining everything can be an extremely tedious
process if one desires the ability to get benefits from typescript.

It's an extremely tedious process which I aim to
make easier through the use of this custom langauge.

## Basics

Each sequence of parsing instructions will start with the `seq` keyword,
followed by what this sequence is called.

```bdef
seq <name> {}
```

There's no need to write things to tell it that it should have the same
structure as it is in the source code - the transpiler already knows that
much.

## Types

The types and their labels will be defined within the brackets. Here is a list
of the supported types:

```raw
integers:
  - big / little endian
  - signed / unsigned
  - 8, 16, 32, 64, 128, 256 bits
  written as: [signage (i or u)][bitcount][endian (b or l)]
    ex. i32b, u16l, etc.

floats:
  - big / little endian
  - 16, 32, 64 bits
  written as: f[bitcount][endian (b or l)]
    ex. f32l, f16b

strings / chars:
  - can be null-terminated or a set length
  written as:
    - char[-1]  for null-terminated
    - char[n]   for strings of n length
    - char      shorthand for char[1]
  non-ASCII charcter values will be written as •

pointers
  - size defined by preprocessor
  written as: ref (other sequence name) label

bitfields
  - can be 1-32 bits long
  written as: b[1-32][endian (b or l)]
```

## Enums

enums can be declared too! their syntax is as follows:

```bdef
enum <name> {
  <value>: <label>
  ...
}
```

They are used the same ways as pointers

```bdef
enum Thing {
  0x1: value
  2: otherValue
  0b11: yetAnotherValue
}

seq asdf {
  ...
  i32b (Thing) myThing
  ...
}
```