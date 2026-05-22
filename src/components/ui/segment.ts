import type { InjectionKey, Ref } from "vue";

/** A segment's value — kept loose so segments can key on strings or numbers. */
export type SegmentValue = string | number;

/**
 * Contract shared between <WSegment> and its descendants
 * (<WSegmentButton> today; <WSegmentView> / <WSegmentContent> in the future).
 *
 * <WSegment> is the single source of truth: it owns the selected value and
 * exposes a `select` callback. Any descendant injects this context rather
 * than talking to the parent through props/events directly.
 */
export interface SegmentContext {
	/** Currently selected value of the parent segment. */
	selected: Readonly<Ref<SegmentValue | undefined>>;
	/** Whether the whole segment is disabled. */
	disabled: Readonly<Ref<boolean>>;
	/** Request a new selection. Ignored while the segment is disabled. */
	select: (value: SegmentValue) => void;
}

export const SEGMENT_INJECTION_KEY: InjectionKey<SegmentContext> = Symbol("WSegment");
