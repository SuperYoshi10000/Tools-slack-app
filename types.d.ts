declare interface Set<T> {
    difference<U>(other: Set<U>): Set<T>;
    intersection<U>(other: Set<U>): Set<T&U>;
    symmetricDifference<U>(other: Set<U>): Set<T|U>;
    union<U>(other: Set<U>): Set<T|U>;

    isDisjointFrom(other: Set<any>): boolean;	
    isSubsetOf(other: Set<any>): boolean;	
    isSupersetOf(other: Set<any>): boolean;
}