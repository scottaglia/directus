<template>
	<div ref="mermaidInterface" class="interface-input-rich-text-mmd" :class="[preview[0], { disabled }]">
		<div class="toolbar">
			<div class="spacer"></div>
			<v-item-group v-model="preview" class="view" mandatory rounded>
				<v-button small value="off" v-tooltip="t('interfaces.input-rich-text-mmd.hidePreview')" icon :class="[{ active: preview[0] === 'off' }]">
					<v-icon name="visibility_off" />
				</v-button>
				<v-button small value="horizontal" v-tooltip="t('interfaces.input-rich-text-mmd.previewSide')" icon
					:class="[{ active: preview[0] === 'horizontal' }]">
					<v-icon name="view_column_2" />
				</v-button>
				<v-button small value="vertical" v-tooltip="t('interfaces.input-rich-text-mmd.previewBottom')" icon
					:class="[{ active: preview[0] === 'vertical' }]">
					<v-icon name="splitscreen" />
				</v-button>
			</v-item-group>
		</div>
		<div id="positioner">
			<div class="editor-box" ref="codemirrorEl"></div>
			<div v-html="mermaidString" class="preview-box"></div>
		</div>
		<div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import CodeMirror from 'codemirror';
import 'codemirror/addon/display/placeholder.js';
import 'codemirror/mode/php/php';
import mermaid from 'mermaid';

import { useWindowSize } from '@/composables/use-window-size';

const props = withDefaults(
	defineProps<{
		value: string | null;
		disabled?: boolean;
		placeholder?: string;
		editorFont?: 'sans-serif' | 'serif' | 'monospace';
	}>(),
	{
		editorFont: 'monospace',
	}
);

const emit = defineEmits(['input']);

const { t } = useI18n();

const { width } = useWindowSize();

const mermaidInterface = ref<HTMLElement>();
const codemirrorEl = ref<HTMLTextAreaElement>();
let codemirror: CodeMirror.Editor | null = null;
let previousContent: string | null = null;

const preview = ref(['vertical']);
const mermaidString = ref('');

const readOnly = computed(() => {
	if (width.value < 600) {
		// mobile requires 'nocursor' to avoid bringing up the keyboard
		return props.disabled ? 'nocursor' : false;
	} else {
		// desktop cannot use 'nocursor' as it prevents copy/paste
		return props.disabled;
	}
});

onMounted(async () => {

	mermaid.initialize({ startOnLoad: false, theme: 'dark' });

	if (codemirrorEl.value) {
		codemirror = CodeMirror(codemirrorEl.value, {
			// mode: 'simple',
			configureMouse: () => ({ addNew: false }),
			lineWrapping: true,
			readOnly: readOnly.value,
			cursorBlinkRate: props.disabled ? -1 : 530,
			placeholder: props.placeholder,
			value: props.value || '',
			spellcheck: false,
			inputStyle: 'contenteditable',
		});

		codemirror.on('change', (cm, { origin }) => {
			const content = cm.getValue();

			// prevent duplicate emits with same content
			if (content === previousContent) return;
			previousContent = content;

			if (origin === 'setValue') return;

			emit('input', content);
		});
	}

	const graphDefinition = props.value || '';
	renderMermaid(graphDefinition);
});

const renderMermaid = (graphDefinition: string) => {
	mermaid.render('graphDiv', graphDefinition)
		.then(({ svg, bindFunctions }) => {
			mermaidString.value = svg;
		})
		.catch((e) => {
		})
}

watch(
	() => props.value,
	(newValue) => {
		if (!codemirror) return;

		const existingValue = codemirror.getValue();

		if (existingValue !== newValue) {
			codemirror.setValue('');
			codemirror.clearHistory();
			codemirror.setValue(newValue ?? '');
			codemirror.refresh();
		}
	}
);

watch(
	() => props.disabled,
	(disabled) => {
		codemirror?.setOption('readOnly', readOnly.value);
		codemirror?.setOption('cursorBlinkRate', disabled ? -1 : 530);
	},
	{ immediate: true }
);

watch(
	() => props.value,
	async (newValue) => {
		const graphDefinition = newValue || '';
		renderMermaid(graphDefinition);
	}
);

const editFamily = computed(() => {
	return `var(--family-${props.editorFont})`;
});

</script>

<style lang="scss" scoped>
@import '@/styles/mixins/form-grid';

.interface-input-rich-text-mmd {
	--v-button-background-color: transparent;
	--v-button-color: var(--foreground-normal);
	--v-button-background-color-hover: var(--border-normal);
	--v-button-color-hover: var(--foreground-normal);

	min-height: 300px;
	overflow: hidden;
	font-family: var(--family-sans-serif);
	border: 2px solid var(--border-normal);
	border-radius: var(--border-radius);
}

.interface-input-rich-text-mmd.disabled {
	background-color: var(--background-subdued);
}

.interface-input-rich-text-mmd:not(.disabled):focus-within {
	border-color: var(--primary);
	box-shadow: 0 0 16px -8px var(--primary);
}

.interface-input-rich-text-mmd .preview-box {
	text-align: center;
}
.interface-input-rich-text-mmd.disabled .preview-box {
	color: var(--foreground-subdued);
}

.interface-input-rich-text-mmd :deep(.CodeMirror) {
	font-family: v-bind(editFamily), sans-serif;
	border: none;
	border-radius: 0;
	box-shadow: none;
}

.interface-input-rich-text-mmd :deep(.CodeMirror .CodeMirror-lines) {
	padding: 0 20px;
}

.interface-input-rich-text-mmd :deep(.CodeMirror .CodeMirror-lines:first-of-type) {
	margin-top: 20px;
}

.interface-input-rich-text-mmd :deep(.CodeMirror .CodeMirror-lines:last-of-type) {
	margin-bottom: 20px;
}

.interface-input-rich-text-mmd.preview :deep(.CodeMirror) {
	display: none;
}

.interface-input-rich-text-mmd.off .preview-box {
	display: none;
}

.interface-input-rich-text-mmd.horizontal #positioner {
	display: flex;
	flex-direction: row;

	.editor-box {
		flex: 1
	}

	.preview-box {
		flex: 1
	}
}

.toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	min-height: 40px;
	padding: 0 4px;
	background-color: var(--background-subdued);
	border-bottom: 2px solid var(--border-normal);

	.v-button+.v-button {
		margin-left: 2px;
	}

	.spacer {
		flex-grow: 1;
	}

	.view {
		--v-button-background-color: var(--border-subdued);
		--v-button-color: var(--foreground-subdued);
		--v-button-background-color-hover: var(--border-normal);
		--v-button-color-hover: var(--foreground-normal);
		--v-button-background-color-active: var(--border-normal);
		--v-button-color-active: var(--foreground-normal);
	}
}
</style>
