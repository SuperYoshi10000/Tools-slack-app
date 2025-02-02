<<<<<<< HEAD
declare interface Set<T> {
    difference<U>(other: Set<U>): Set<T>;
    intersection<U>(other: Set<U>): Set<T&U>;
    symmetricDifference<U>(other: Set<U>): Set<T|U>;
    union<U>(other: Set<U>): Set<T|U>;

    isDisjointFrom(other: Set<any>): boolean;	
    isSubsetOf(other: Set<any>): boolean;	
    isSupersetOf(other: Set<any>): boolean;
=======
declare interface Set<T> {
    difference<U>(other: Set<U>): Set<T>;
    intersection<U>(other: Set<U>): Set<T&U>;
    symmetricDifference<U>(other: Set<U>): Set<T|U>;
    union<U>(other: Set<U>): Set<T|U>;

    isDisjointFrom(other: Set<any>): boolean;	
    isSubsetOf(other: Set<any>): boolean;	
    isSupersetOf(other: Set<any>): boolean;
>>>>>>> 7485003502804a8b4b3d7a0e9075b52980d970d8
}