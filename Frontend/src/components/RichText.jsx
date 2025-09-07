import React, { useState, useRef } from "react";

const RichText = () => {
  const [formData, setFormData] = useState({
    planetaryPositions: "",
    prediction: "",
    suggestions: "",
  });

  // Custom Rich Text Editor Component
  const CustomRichTextEditor = ({ value, onChange, placeholder, label }) => {
    const editorRef = useRef(null);

    // Execute formatting commands
    const execCommand = (command, value = null) => {
      document.execCommand(command, false, value);
      // Trigger onChange after command execution
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    // Handle content changes
    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    // Toolbar Button Component
    const ToolbarButton = ({ onClick, title, children, isActive = false }) => (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        title={title}
      >
        {children}
      </button>
    );

    // Insert Link
    const insertLink = () => {
      const url = prompt('Enter URL:');
      if (url) {
        execCommand('createLink', url);
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="border rounded-md overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
            <ToolbarButton
              onClick={() => execCommand('bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('underline')}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </ToolbarButton>

            <div className="border-l mx-1"></div>

            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'h1')}
              title="Heading 1"
            >
              H1
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'h2')}
              title="Heading 2"
            >
              H2
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'h3')}
              title="Heading 3"
            >
              H3
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'p')}
              title="Paragraph"
            >
              P
            </ToolbarButton>

            <div className="border-l mx-1"></div>

            <ToolbarButton
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet List"
            >
              • List
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('insertOrderedList')}
              title="Numbered List"
            >
              1. List
            </ToolbarButton>

            <div className="border-l mx-1"></div>

            <ToolbarButton
              onClick={() => execCommand('justifyLeft')}
              title="Align Left"
            >
              ⬅
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('justifyCenter')}
              title="Align Center"
            >
              ⬌
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('justifyRight')}
              title="Align Right"
            >
              ➡
            </ToolbarButton>

            <div className="border-l mx-1"></div>

            <ToolbarButton
              onClick={insertLink}
              title="Insert Link"
            >
              🔗
            </ToolbarButton>

            <ToolbarButton
              onClick={() => execCommand('removeFormat')}
              title="Clear Formatting"
            >
              Clear
            </ToolbarButton>

            <div className="border-l mx-1"></div>

            <ToolbarButton
              onClick={() => execCommand('undo')}
              title="Undo (Ctrl+Z)"
            >
              ↶
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => execCommand('redo')}
              title="Redo (Ctrl+Y)"
            >
              ↷
            </ToolbarButton>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            className="p-3 min-h-[150px] max-h-[300px] overflow-y-auto outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            style={{ 
              minHeight: '150px',
              lineHeight: '1.5'
            }}
            dangerouslySetInnerHTML={{ __html: value }}
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
          />
        </div>

        {/* Custom CSS for placeholder and styling */}
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: italic;
          }
          [contenteditable] h1 {
            font-size: 1.75em;
            font-weight: bold;
            margin: 0.5em 0;
            line-height: 1.2;
          }
          [contenteditable] h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.5em 0;
            line-height: 1.2;
          }
          [contenteditable] h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 0.5em 0;
            line-height: 1.2;
          }
          [contenteditable] p {
            margin: 0.5em 0;
          }
          [contenteditable] ul, [contenteditable] ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          [contenteditable] li {
            margin: 0.25em 0;
          }
          [contenteditable] a {
            color: #3b82f6;
            text-decoration: underline;
          }
          [contenteditable]:focus {
            outline: none;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CustomRichTextEditor
        label="Current Planetary Positions"
        value={formData.planetaryPositions}
        onChange={(content) => 
          setFormData(prev => ({ ...prev, planetaryPositions: content }))
        }
        placeholder="Enter planetary positions..."
      />

      <CustomRichTextEditor
        label="Prediction"
        value={formData.prediction}
        onChange={(content) => 
          setFormData(prev => ({ ...prev, prediction: content }))
        }
        placeholder="Enter prediction..."
      />

      <CustomRichTextEditor
        label="Suggestions"
        value={formData.suggestions}
        onChange={(content) => 
          setFormData(prev => ({ ...prev, suggestions: content }))
        }
        placeholder="Enter suggestions..."
      />

      {/* Optional: Display the current data for debugging */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Data:</h3>
        <div className="space-y-2 text-xs">
          <div>
            <strong>Planetary Positions:</strong>
            <div dangerouslySetInnerHTML={{ __html: formData.planetaryPositions }} />
          </div>
          <div>
            <strong>Prediction:</strong>
            <div dangerouslySetInnerHTML={{ __html: formData.prediction }} />
          </div>
          <div>
            <strong>Suggestions:</strong>
            <div dangerouslySetInnerHTML={{ __html: formData.suggestions }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichText;