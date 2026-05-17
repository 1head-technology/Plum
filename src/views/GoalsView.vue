<template>
	<div class="goals">
		<p v-if="savingsStore.loading">Loading goals...</p>
		<p v-if="savingsStore.error" class="error">{{ savingsStore.error }}</p>

		<template v-if="!savingsStore.loading">
			<div class="goals__grid" v-if="displayGoals.length">
				<WCard v-for="g in displayGoals" :key="g.id" :padding="22">
					<div class="goal-card__top">
						<div>
							<div class="goal-card__name">{{ g.name }}</div>
							<div class="goal-card__tag">{{ g.tag }}</div>
						</div>
						<AvatarMark :size="36" char="る" tone="accent" />
					</div>
					<div class="goal-card__amount">
						<WMoney :value="g.saved" :size="28" :weight="500" />
						<span class="goal-card__target">/ ${{ g.target.toLocaleString() }}</span>
					</div>
					<div style="margin-top: 14px"><WBar :value="g.saved" :max="g.target" :tone="g.tone" /></div>
					<div class="goal-card__footer">
						<span>{{ Math.round((g.saved / g.target) * 100) }}% saved</span>
						<span style="font-variant-numeric: tabular-nums">${{ (g.target - g.saved).toLocaleString() }} to go</span>
					</div>
				</WCard>
			</div>

			<WCard tone="sunk" :padding="28" class="goals__cta">
				<div>
					<WEyebrow>new goal</WEyebrow>
					<div class="goals__cta-title">Pick something to become.</div>
				</div>
				<WButton variant="dark" icon="plus" size="lg">Add goal</WButton>
			</WCard>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WCard, WEyebrow, WMoney, WBar, WButton, AvatarMark } from "@/components/ui";
import { useSavingsGoalsStore } from "@/stores/savingsGoals";
import { toDisplayGoal } from "@/data/fixtures";

const savingsStore = useSavingsGoalsStore();

const displayGoals = computed(() =>
	savingsStore.goals.map(toDisplayGoal),
);
</script>

<style scoped>
.goals { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
.goals__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.goal-card__top { display: flex; justify-content: space-between; align-items: flex-start; }
.goal-card__name { font-size: 16px; font-weight: 500; color: var(--ink); }
.goal-card__tag { font-size: 11px; color: var(--fg-4); letter-spacing: 0.04em; text-transform: uppercase; margin-top: 3px; }
.goal-card__amount { margin-top: 18px; display: flex; align-items: baseline; gap: 8px; }
.goal-card__target { font-size: 14px; color: var(--fg-4); }
.goal-card__footer { display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: var(--fg-3); }

.goals__cta { display: flex; justify-content: space-between; align-items: center; }
.goals__cta-title { font-size: 18px; color: var(--ink); margin-top: 8px; }
.error { color: var(--loss); }
</style>
