import { defineInterface } from '@directus/utils';
import InterfaceInputMermaid from './input-rich-text-mmd.vue';
import PreviewSVG from './preview.svg?raw';

export default defineInterface({
	id: 'input-rich-text-mmd',
	name: '$t:interfaces.input-rich-text-mmd.mermaid',
	description: '$t:interfaces.input-rich-text-mmd.description',
	icon: 'schema',
	component: InterfaceInputMermaid,
	types: ['text'],
	group: 'standard',
	preview: PreviewSVG,
	options: {
		standard: [
			{
				field: 'placeholder',
				name: '$t:placeholder',
				type: 'string',
				meta: {
					width: 'half',
					interface: 'system-input-translated-string',
					options: {
						placeholder: '$t:enter_a_placeholder',
					},
				},
			},
			{
				field: 'editorFont',
				name: '$t:interfaces.input-rich-text-md.editorFont',
				type: 'string',
				meta: {
					width: 'half',
					interface: 'select-dropdown',
					options: {
						choices: [
							{ text: '$t:sans_serif', value: 'sans-serif' },
							{ text: '$t:monospace', value: 'monospace' },
							{ text: '$t:serif', value: 'serif' },
						],
					},
				},
				schema: {
					default_value: 'monospace',
				},
			},
		],
		advanced: [
		]
	},
});
