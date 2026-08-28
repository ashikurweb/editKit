import { defineComponent, ref, shallowRef, onMounted, onBeforeUnmount, watch, h, type PropType } from 'vue';
import {
  EditKitEditor as EditKitEditorCore,
  type Extension,
  type CustomToolbarItem,
} from '@editkit/core';
import {
  createToolbar,
  BubbleMenu,
  TableFloatingMenu,
  ImageFloatingMenu,
  type ToolbarConfig,
  type ToolbarFeaturesConfig,
} from '@editkit/ui';

export const EditKitEditor = defineComponent({
  name: 'EditKitEditor',
  props: {
    modelValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: 'Write something with EditKit...',
    },
    theme: {
      type: String as PropType<'light' | 'dark' | 'system'>,
      default: 'dark',
    },
    editable: {
      type: Boolean,
      default: true,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    defaultFontFamily: {
      type: String,
      default: 'DM Sans',
    },
    defaultFontSize: {
      type: Number,
      default: 14,
    },
    historyDepth: {
      type: Number,
      default: 100,
    },
    extensions: {
      type: Array as PropType<Extension[]>,
      default: () => [],
    },
    customToolbarItems: {
      type: Array as PropType<CustomToolbarItem[]>,
      default: () => [],
    },
    showToolbar: {
      type: Boolean,
      default: true,
    },
    toolbar: {
      type: Object as PropType<ToolbarConfig>,
      default: undefined,
    },
    features: {
      type: Object as PropType<ToolbarFeaturesConfig>,
      default: undefined,
    },
    bubbleMenu: {
      type: Boolean,
      default: true,
    },
    tableMenu: {
      type: Boolean,
      default: true,
    },
    imageMenu: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const editor = shallowRef<EditKitEditorCore | null>(null);
    const uiComponents: Array<{ destroy(): void }> = [];

    onMounted(() => {
      if (!containerRef.value) return;

      const initialContent =
        props.modelValue !== undefined
          ? props.modelValue
          : props.defaultValue !== undefined
          ? props.defaultValue
          : '';

      const instance = new EditKitEditorCore({
        content: initialContent,
        placeholder: props.placeholder,
        theme: props.theme,
        editable: props.editable,
        autofocus: props.autofocus,
        defaultFontFamily: props.defaultFontFamily,
        defaultFontSize: props.defaultFontSize,
        historyDepth: props.historyDepth,
        extensions: props.extensions,
        customToolbarItems: props.customToolbarItems,
        onUpdate: (ed) => {
          const html = ed.getHTML();
          emit('update:modelValue', html);
          emit('change', html);
        },
        onFocus: (ed) => emit('focus', ed),
        onBlur: (ed) => emit('blur', ed),
      });

      if (props.showToolbar) {
        const tbConfig: ToolbarConfig = {
          ...props.toolbar,
          features: props.toolbar?.features ?? props.features,
        };
        const toolbar = createToolbar(instance, tbConfig);
        if (!tbConfig.container) {
          instance.root.insertBefore(toolbar.element, instance.contentEl);
        }
        uiComponents.push(toolbar);
      }

      if (props.bubbleMenu) {
        const bubble = new BubbleMenu(instance);
        bubble.mount(instance.root);
        uiComponents.push(bubble);
      }

      if (props.tableMenu) {
        const table = new TableFloatingMenu(instance);
        table.mount(instance.root);
        uiComponents.push(table);
      }

      if (props.imageMenu) {
        const img = new ImageFloatingMenu(instance);
        img.mount(instance.root);
        uiComponents.push(img);
      }

      instance.mount(containerRef.value);
      editor.value = instance;
    });

    onBeforeUnmount(() => {
      if (editor.value) {
        for (const component of uiComponents.reverse()) {
          component.destroy();
        }
        uiComponents.length = 0;
        editor.value.destroy();
        editor.value = null;
      }
    });

    watch(
      () => props.modelValue,
      (newVal) => {
        if (editor.value && newVal !== undefined && newVal !== editor.value.getHTML()) {
          editor.value.setContent(newVal, false);
        }
      }
    );

    watch(
      () => props.theme,
      (newTheme) => {
        if (editor.value && newTheme) {
          editor.value.setTheme(newTheme);
        }
      }
    );

    watch(
      () => props.editable,
      (newEditable) => {
        if (editor.value) {
          editor.value.setEditable(newEditable);
        }
      }
    );

    expose({
      getEditor: () => editor.value,
      editor,
    });

    return () =>
      h('div', {
        ref: containerRef,
        class: `editkit-vue-root ${props.className}`.trim(),
      });
  },
});
