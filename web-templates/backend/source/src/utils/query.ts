export function selectAll<T>(query: string) {
	return ArraySelectAll<T>(tools.xquery(`sql: ${query}`));
}

export function selectOne<T>(query: string, defaultObj?: any) {
	return ArrayOptFirstElem<T>(tools.xquery(`sql: ${query}`), defaultObj);
}
