export function combineLists<T1, T2, R = string>(
    list1: T1[], list2: T2[],
    combiner: (al: T1, bl: T2, ai: number, bi: number) => R | string = (al, bl) => "" + al + bl
): (R | string)[] {
    const results: (R | string)[] = [];
    list1.forEach((item1, index1) => list2.forEach((item2, index2) => results.push(combiner(item1, item2, index1, index2))));
    return results;
}
export function reduce<T, K, V>(base: V[] | Map<K|undefined, V>, value: T, combine: (t: T, v: V, k?: number | K) => T | void): T {
    var result: T = value;
    base.forEach((v: V, k: number | K) => {
        result = combine(result, v, k) || result;
    });
    return result;
}
export function map<K, V, R>(base: V[] | Map<K, V>, combine: (v: V, k: number | K, a: V[] | Map<K, V>) => R): R[] {
    var result: R[] = [];
    base.forEach((v: V, k: number | K, a: V[] | Map<K, V>) => result.push(combine(v, k, a)));
    return result;

}
export function merge<A, B, R>(a: A[], b: B[], combine: (a: A, b: B) => R): R[] {
    var result: R[] = [];
    for (let i = 0; i < a.length; i++) {
        result.push(combine(a[i], b[i]));
    }
    return result;
}

export function asArray<T>(value: T | T[]) {
    return Array.isArray(value) ? value : [value];
}
export function splitLines(s: string, trim: boolean = false, removeEmpty: boolean = false, split: RegExp = /\r\n?|\n/) {
    return s.split(split).map(s => trim ? s.trim() : s).filter(s => !removeEmpty || s.length > 0);
}
export function newlineIfMultipleLines(s: string, prefix: string = "", trim: boolean = false, removeEmpty: boolean = false, split: RegExp = /\r\n?|\n/) {
    return s.split(split).length > 1 ? (trim ? s.split(split).map(s => s.trim()) : [s]).filter(s => !removeEmpty || s.length > 0) : [prefix + (trim ? s.trim() : s)];
}
export function stringToCharList(value: string, codepoint?: boolean): number[] {
    return value.split("").map(c => (codepoint ? c.codePointAt : c.charCodeAt)(0));
}
export function charListToString(...value: number[]): string {
    return value.map(c => String.fromCodePoint(c)).join("");
}

export function toTitleCase(s: any, separator: RegExp = /\W/): string {
    if (typeof s != "string") s = s.toString();
    const l: string[] = s.split("");
    for (let i = 0; i < l.length; i++) {
        // if (i < 100) console.log(i + " " + l[i - 1] + " " + l[i]);
        if (i == 0 || separator.test(l[i - 1]) && /\w/.test(l[i])) {
            l[i] = l[i].toUpperCase();
        }
    }
    return l.join("");
}
export function asObjectKey(value: any): string {
    if (typeof value == "string") return value;
    if (typeof value == "object") return JSON.stringify(value);
    return `[${value.toString()}]`;
}

export function stringify<V extends { toString(): string }, T = string>(obj: object,
    prop2string: ((key: string, value: V) => string | T) | [string?, string?, string?] = (k, v) => asObjectKey(k) + ": " + v?.toString?.(),
    combiner: ((s: (string | T)[]) => string) | [string?, string?, string?] | string | null = (s) => `{\n\t${s.join(",\n\t")}\n}`
): string {
    if (combiner == null) combiner = (s) => s.join("");
    const entries: [string, any][] = Object.entries(obj);
    var realProp2string = 
        prop2string instanceof Array
        ? (k: string, v: V) => 
            (prop2string[0] ? prop2string[0] + asObjectKey(k) : "")
            + prop2string[1] || "" + v.toString()
            + prop2string[2] || ""
        : prop2string;
    var realCombiner =
        combiner instanceof Array ? (s: (string | T)[]) => combiner[0] + s.join(combiner[1]) + combiner[2] :
        typeof combiner == "string" ? (s: (string | T)[]) => s.join(combiner.toString()) :
        combiner;
    return realCombiner(entries.map(([k, v]) => realProp2string(k, v)));
}

export default {
    combineLists,
    reduce,
    map,
    merge,
    asArray,
    splitLines,
    newlineIfMultipleLines,
    stringToCharList,
    charListToString,
    toTitleCase,
    asObjectKey,
    stringify
}