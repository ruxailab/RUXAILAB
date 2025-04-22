<template>
  <div>
    <div
      v-if="editable"
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
    <!-- Read only -->
    <editor-content
      v-else
      style="outline-color: none !important;"
      :editor="editor"
    />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { EditorContent } from '@tiptap/vue-3';
import i18n from '@/i18n';

export default {
  components: {
    EditorContent,
  },
  props: {
    editable: {
      type: Boolean,
      default: true,
    },
    text: {
      type: String,
      default: '',
    },
  },
  emits: ['updateJson', 'updateHtml', 'mounted'],
  data() {
    return {
      editor: null,
      json: null,
      html: null,
    };
  },
  watch: {
    json() {
      this.$emit('updateJson', this.json);
    },
    html() {
      this.$emit('updateHtml', this.html);
    },
    text(newText) {
      this.editor.commands.setContent(newText);
    },
  },
  mounted() {
    this.editor = new Editor({
      content: this.text || '',
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
      editable: this.editable,
      onUpdate: ({ editor }) => {
        this.json = editor.getJSON();
        this.html = editor.getHTML();
      },
    });
    this.$emit('mounted');
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  },
  methods: {
    loadImage() {
      const url = prompt(i18n.t('alerts.imageURL'));
      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run();
      }
    },
    setLink() {
      let link = prompt('Link: ');
      if (link) {
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
          link = 'http://' + link;
        }
        this.editor.chain().focus().setLink({ href: link }).run();
      }
    },
    getJson() {
      return this.json;
    },
    getHtml() {
      return this.html;
    },
    setContent(text) {
      this.editor.commands.setContent(text);
    },
    resetContent() {
      this.editor.commands.clearContent();
    },
  },
};
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