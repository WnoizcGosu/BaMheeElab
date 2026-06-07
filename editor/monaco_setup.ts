/// <reference types="monaco-editor" />
import * as monaco from 'monaco-editor';

// Configure the web worker paths
(window as any).MonacoEnvironment = {
    getWorkerUrl: function (_workerId: string, label: string) {
    if (label === 'typescript' || label === 'javascript') {
        return './ts.worker.bundle.js'; 
    }
    return './editor.worker.bundle.js'; 
}
};

monaco.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.typescript.ModuleKind.CommonJS,
    noEmit: true,
    jsx: monaco.typescript.JsxEmit.React,
});

// Create the container in your HTML template: <div id="editor-container" style="height:500px;"></div>
const container = document.getElementById('editor-container')!;

const codeValue = `const greeting: string = "Hello World";\nconsole.log(greeting);`;

// 1. Create a model mapping it to a simulated file path for precise resolution
const modelUri = monaco.Uri.file('main.ts');
const codeModel = monaco.editor.createModel(codeValue, 'typescript', modelUri);

// 2. Initialize the editor
const editorInstance = monaco.editor.create(container, {
    model: codeModel,
    theme: 'vs-dark', // Sets dark mode theme
    automaticLayout: true, // Auto-resizes layout with the container
});

const libraryTypeSource = `
    declare namespace MyGlobalLib {
    function computeSomething(value: number): string;
    }
`;

// Registers the types globally within the Monaco environment
monaco.typescript.typescriptDefaults.addExtraLib(
    libraryTypeSource,
    'file:///node_modules/@types/mygloballib/index.d.ts'
);

