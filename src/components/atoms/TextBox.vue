<template>
  <div>
    <!-- Editable toolbar only shows when editor is initialized -->
    <div
      v-if="editable && editor"
      class="main-box"
    >
      <!-- Custom Toolbar -->
      <div class="bg-grey-lighten-3 editor-bar">
        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().undo().run()"
        >
          <v-icon color="grey-darken-1">
            mdi-undo
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().redo().run()"
        >
          <v-icon color="grey-darken-1">
            mdi-redo
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <v-icon :color="editor.isActive('bold') ? '#FCA326' : 'grey darken-1'">
            mdi-format-bold
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <v-icon :color="editor.isActive('italic') ? '#FCA326' : 'grey darken-1'">
            mdi-format-italic
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <v-icon :color="editor.isActive('underline') ? '#FCA326' : 'grey darken-1'">
            mdi-format-underline
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <v-icon :color="editor.isActive('heading', { level: 1 }) ? '#FCA326' : 'grey darken-1'">
            mdi-format-header-1
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <v-icon :color="editor.isActive('heading', { level: 2 }) ? '#FCA326' : 'grey darken-1'">
            mdi-format-header-2
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <v-icon :color="editor.isActive('heading', { level: 3 }) ? '#FCA326' : 'grey darken-1'">
            mdi-format-header-3
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <v-icon :color="editor.isActive('bulletList') ? '#FCA326' : 'grey darken-1'">
            mdi-format-list-bulleted
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <v-icon :color="editor.isActive('orderedList') ? '#FCA326' : 'grey darken-1'">
            mdi-format-list-numbered
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="loadImage()"
        >
          <v-icon color="grey-darken-1">
            mdi-image
          </v-icon>
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="#FCA326"
          @click="setLink()"
        >
          <v-icon :color="editor.isActive('link') ? '#FCA326' : 'grey darken-1'">
            mdi-link-variant-plus
          </v-icon>
        </v-btn>
      </div>

      <v-divider />
      <editor-content
        class="text-box pa-1"
        :editor="editor"
      />
    </div>

    <!-- Read-only display when not editable -->
    <editor-content
      v-else-if="editor"
      style="outline-color: none !important;"
      :editor="editor"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  editable: {
    type: Boolean,
    default: true,
  },
  text: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['updateJson', 'updateHtml', 'mounted']);

const { t } = useI18n();

const editor = ref(null);
const json = ref(null);
const html = ref(null);

onMounted(() => {
  editor.value = new Editor({
    content: props.text || '',
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Underline,
    ],
    editable: props.editable,
    onUpdate: ({ editor }) => {
      json.value = editor.getJSON();
      html.value = editor.getHTML();
    },
  });
  emit('mounted');
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

watch(json, (newJson) => {
  emit('updateJson', newJson);
});

watch(html, (newHtml) => {
  emit('updateHtml', newHtml);
});

watch(
  () => props.text,
  (newText) => {
    editor.value.commands.setContent(newText);
  }
);

const loadImage = () => {
  const url = prompt(t('alerts.imageURL'));
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run();
  }
};

const setLink = () => {
  let link = prompt('Link: ');
  if (link) {
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = 'http://' + link;
    }
    editor.value.chain().focus().setLink({ href: link }).run();
  }
};

const getJson = () => {
  return json.value;
};

const getHtml = () => {
  return html.value;
};

const setContent = (text) => {
  if (editor.value) {
      editor.value.commands.setContent(text);
    }
};

const resetContent = () => {
  editor.value.commands.clearContent();
};

defineExpose({
  setContent,
  getHtml: () => {
    return editor.value?.getHTML() || '';
  },
  resetContent,
  getJson,
});
</script>

<style scoped>
.editor-bar {
  border-radius: 4px;
}
.text-box {
  border-radius: 4px;
  max-height: 300px;
  height: 300px;
  overflow: auto;
  caret-color: #fca326;
  line-height: 1.3em;
  outline-color: none !important;
}
.main-box {
  border: 1px solid #3f3d56;
  border-radius: 4px;
}
/* width */
::-webkit-scrollbar {
  width: 7px;
}
/* Track */
::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>