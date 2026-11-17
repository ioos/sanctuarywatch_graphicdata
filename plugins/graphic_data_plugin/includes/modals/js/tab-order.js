/** Return stable tab IDs in display order, with legacy numeric fallback. */
export function getModalTabOrder(value, count = 6) {
	const ids = String(value || '').split(',').map(Number);
	return [...new Set([...ids, 1, 2, 3, 4, 5, 6])].filter(
		(id) => Number.isInteger(id) && id >= 1 && id <= Math.min(6, Number(count))
	);
}
