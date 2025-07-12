'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Highlighter,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface TiptapEditorProps {
  content?: any;
  onChange?: (content: any) => void;
  onSave?: (content: any) => void;
  placeholder?: string;
  collaboration?: {
    enabled: boolean;
    documentId: string;
    appId?: string;
    token?: string;
  };
  readOnly?: boolean;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  onSave,
  placeholder = 'Start writing your lead funnel content...',
  collaboration = { enabled: false, documentId: 'default' },
  readOnly = false,
}) => {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      ...(collaboration.enabled ? [
        Collaboration.configure({
          document: doc,
        }),
      ] : []),
    ],
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json);
    },
  });

  // Initialize collaboration
  useEffect(() => {
    if (collaboration.enabled && collaboration.appId) {
      const newProvider = new TiptapCollabProvider({
        name: collaboration.documentId,
        appId: collaboration.appId,
        token: collaboration.token || 'notoken',
        document: doc,
        onConnect: () => {
          setIsCollaborating(true);
        },
        onDisconnect: () => {
          setIsCollaborating(false);
        },
      });

      setProvider(newProvider);

      return () => {
        newProvider.destroy();
      };
    }
  }, [collaboration.enabled, collaboration.documentId, collaboration.appId, collaboration.token, doc]);

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleSave = () => {
    if (editor && onSave) {
      const json = editor.getJSON();
      onSave(json);
    }
  };

  if (!editor) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Media */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
              title="Add Link"
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200"
              title="Add Image"
            >
              <ImageIcon size={16} />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().setColor('#958DF1').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#958DF1' }) ? 'bg-gray-200' : ''}`}
              title="Purple"
            >
              <Palette size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
              title="Highlight"
            >
              <Highlighter size={16} />
            </button>
          </div>

          {/* Collaboration Status */}
          {collaboration.enabled && (
            <div className="flex items-center gap-2 ml-auto">
              <div className={`flex items-center gap-1 text-xs ${isCollaborating ? 'text-green-600' : 'text-gray-500'}`}>
                {isCollaborating ? <Eye size={14} /> : <EyeOff size={14} />}
                {isCollaborating ? 'Collaborating' : 'Offline'}
              </div>
            </div>
          )}

          {/* Save Button */}
          {onSave && (
            <button
              onClick={handleSave}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
            >
              <Save size={14} />
              Save
            </button>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="p-4 min-h-[400px]">
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  );
};

export default TiptapEditor; 