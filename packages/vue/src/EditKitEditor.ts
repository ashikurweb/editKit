import { defineComponent, ref, shallowRef, onMounted, onBeforeUnmount, watch, h, type PropType } from 'vue';
import { EditKitEditor as EditKitEditorCore } from '@editkit/core';
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
      type: String,
      default: '',
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

    onMounted(() => {
      if (!containerRef.value) return;

      const initialContent = props.modelValue || props.defaultValue || '';

      const instance = new EditKitEditorCore({
        content: initialContent,
        placeholder: props.placeholder,
        theme: props.theme,
        editable: props.editable,
        onUpdate: (ed) => {
          const html = ed.getHTML();
          emit('update:modelValue', html);
          emit('change', html);
        },
        onFocus: (ed) => emit('focus', ed),
        onBlur: (ed) => emit('blur', ed),
      });

      if (props.showToolbar) {
        const tbConfig: ToolbarConfig = props.toolbar || {
          features: props.features,
        };
        if (props.features && !tbConfig.features) {
          tbConfig.features = props.features;
        }
        const toolbar = createToolbar(instance, tbConfig);
        instance.root.insertBefore(toolbar.element, instance.contentEl);
      }

      if (props.bubbleMenu) {
        const bubble = new BubbleMenu(instance);
        bubble.mount(instance.root);
      }

      if (props.tableMenu) {
        const table = new TableFloatingMenu(instance);
        table.mount(instance.root);
      }

      if (props.imageMenu) {
        const img = new ImageFloatingMenu(instance);
        img.mount(instance.root);
      }

      instance.mount(containerRef.value);
      editor.value = instance;
    });

    onBeforeUnmount(() => {
      if (editor.value) {
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
