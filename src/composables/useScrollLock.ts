import { ref, onScopeDispose } from "vue";

interface LockEntry {
	count: number;
	original: {
		overflow: string;
		paddingRight: string
	};
}

const lockRegistry = new Map<Element, LockEntry>();

function acquireLock(target: Element) {
	const existing = lockRegistry.get(target);
	if (existing) {
		existing.count++;
		return;
	}

	const el = target as HTMLElement;

	const original = {
		overflow: el.style.overflow,
		paddingRight: el.style.paddingRight,
	};

	lockRegistry.set(target, { count: 1, original });

	const scrollbarWidth =
		target === document.documentElement
			? window.innerWidth - document.documentElement.clientWidth
			: (target as HTMLElement).offsetWidth - target.clientWidth;

	el.style.overflow = "hidden";

	if (scrollbarWidth > 0) {
		const current = parseFloat(getComputedStyle(el).paddingRight) || 0;
		el.style.paddingRight = `${current + scrollbarWidth}px`;
	}
}

function releaseLock(target: Element) {
	const entry = lockRegistry.get(target);
	if (!entry) return;

	entry.count--;
	if (entry.count > 0) return;

	const el = target as HTMLElement;
	el.style.overflow = entry.original.overflow;
	el.style.paddingRight = entry.original.paddingRight;

	lockRegistry.delete(target);
}

export function useScrollLock(options: { target?: Element; autoLock?: boolean } = {}) {
	const { target = document.documentElement, autoLock = false } = options;

	const locked = ref(false);

	function lock() {
		if (locked.value) return;
		acquireLock(target);
		locked.value = true;
	}

	function unlock() {
		if (!locked.value) return;
		releaseLock(target);
		locked.value = false;
	}

	if (autoLock) lock();

	onScopeDispose(() => {
		unlock();
	});

	return { locked, lock, unlock };
}
