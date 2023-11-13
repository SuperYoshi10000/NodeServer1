export function combineLists<T1, T2, R = string>(
    list1: T1[], list2: T2[],
    combiner: (al: T1, bl: T2, ai: number, bi: number) => R | string = (al, bl) => "" + al + bl
): (R | string)[] {
    const results: (R | string)[] = [];
    list1.forEach((item1, index1) => list2.forEach((item2, index2) => results.push(combiner(item1, item2, index1, index2))));
    return results;
}
export function reduce<T, K, V>(base: V[] | Map<K, V>, value: T, combine: (t: T, v: V, k?: K|number) => T | void): T {
    var result: T = value;
    base.forEach((v: V, k: number | K) => {
        result = combine(result, v, k) || result;
    });
    return result;
}
export function map<T, K, V, R>(base: V[] | Map<K, V>, combine: (v: V, k?: K | number) => R): R[] {
    var result: R[] = [];
    base.forEach((v: V, k: number | K) => {
        result.push(combine(v, k));
    });
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

export default {
    combineLists,
    reduce,
    map,
    merge
}