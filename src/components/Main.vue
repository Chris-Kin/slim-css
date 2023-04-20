<template>
  <div style="position: relative">
    <div id="monaco" ref="monaco"></div>
    <div class="btn" @click="onAnalyze">analyze</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as Monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

self.MonacoEnvironment = {
    getWorker(_, label) {
      if (['css', 'scss', 'less'].includes(label)) {
        return new cssWorker();
      }
      if (['typescript', 'javascript'].includes(label)) {
        return new tsWorker();
      }
      if (['json'].includes(label)) {
        return new jsonWorker();
      }
      if (['html'].includes(label)) {
        return new htmlWorker();
      }
      return new editorWorker();
    },
};

defineProps<{ msg: string }>()

const monaco = ref();

const value = 
`.a {
  color: red;
}
`;

let editor: Monaco.editor.IStandaloneCodeEditor;

onMounted(() => {
  editor = Monaco.editor.create(monaco.value, {
    value,
    language: 'css',
    folding: true,
    theme: 'vs-dark',
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 4,
    },
    // inDiffEditor: true,
    fontSize: 17,
    minimap: {
      enabled: true,
    },
    formatOnPaste: true,
    renderValidationDecorations: 'on',
  });

  window.addEventListener('resize', () => {
    editor.layout();
  });
})

onUnmounted(() => {

})

function onAnalyze() {
  const css = editor.getValue();
  console.log(css);
}

</script>

<style lang="less" scoped>
#monaco {
  height: 800px;
  text-align: left;
}
.btn {
  color: var(--color-main);
  font-size: 30px;
  font-weight: 600;
  z-index: 1;
  position: absolute;
  background: #444;
  width: 100%;
  line-height: 32px;
  height: 40px;
  opacity: 0.7;
  border-radius: 0 0 10px 10px;
  cursor: pointer;
  user-select: none;
  &:hover {
    opacity: 1;
  }
}
</style>
