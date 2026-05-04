import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Pilcrow, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo, Redo, Link as LinkIcon, Unlink } from 'lucide-react';

// Helper untuk membersihkan HTML dari tag yang tidak diinginkan sebelum simpan
const sanitizeHtml = (htmlString) => {
    if (!htmlString) return '';
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    // Hapus atribut style dan class yang mungkin disisipkan browser
    doc.body.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        if (el.tagName === 'A') {
            if (!el.hasAttribute('href')) {
                const textNode = document.createTextNode(el.textContent);
                el.parentNode.replaceChild(textNode, el);
            } else {
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
            }
        }
    });
    // Hapus tag yang tidak diinginkan, misal <script>
    doc.body.querySelectorAll('script, style, meta').forEach(el => el.remove());
    return doc.body.innerHTML;
};

const MiniTextEditor = ({ value, initialValue = "", onChange, label, error }) => {
    const editorRef = useRef(null);
    const isInternalUpdate = useRef(false);

    // Sync value to editor only when it changes from outside
    useEffect(() => {
        const incomingValue = value ?? initialValue;
        if (editorRef.current && editorRef.current.innerHTML !== incomingValue) {
            // Jika update datang dari luar (bukan dari pengetikan user), update innerHTML
            if (!isInternalUpdate.current) {
                editorRef.current.innerHTML = incomingValue || '';
            }
        }
        isInternalUpdate.current = false;
    }, [value, initialValue]);

    const handleContentChange = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            isInternalUpdate.current = true;
            if (onChange) {
                onChange(sanitizeHtml(newContent));
            }
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        handleContentChange();
    };

    const handleInsertLink = () => {
        const url = prompt('Masukkan URL tautan (termasuk https://):', 'https://');
        if (url) {
            const selection = window.getSelection();
            if (selection.toString().length === 0) {
                const textNode = document.createTextNode(url);
                const range = selection.getRangeAt(0);
                range.insertNode(textNode);
                range.selectNodeContents(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            execCommand('createLink', url);
        }
    };

    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">{label}</label>}
            <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
                <div className="flex items-center p-2 border-b bg-slate-50/50 space-x-1">
                    <button 
                        type="button" 
                        onClick={() => execCommand('undo')} 
                        title="Undo (Ctrl+Z)" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                    >
                        <Undo size={16} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => execCommand('redo')} 
                        title="Redo (Ctrl+Y)" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors mr-2"
                    >
                        <Redo size={16} />
                    </button>
                    
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    
                    <button 
                        type="button" 
                        onClick={() => execCommand('bold')} 
                        title="Bold" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-700 font-bold transition-colors"
                    >
                        <Bold size={16} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => execCommand('italic')} 
                        title="Italic" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-700 italic transition-colors"
                    >
                        <Italic size={16} />
                    </button>
                    
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    
                    <button 
                        type="button" 
                        onClick={() => execCommand('insertUnorderedList')} 
                        title="Bullet List" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                    >
                        <List size={16} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => execCommand('insertOrderedList')} 
                        title="Numbered List" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                    >
                        <ListOrdered size={16} />
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    <button 
                        type="button" 
                        onClick={handleInsertLink} 
                        title="Insert Link" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                    >
                        <LinkIcon size={16} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => execCommand('unlink')} 
                        title="Remove Link" 
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                    >
                        <Unlink size={16} />
                    </button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable={true}
                    onInput={handleContentChange}
                    onBlur={handleContentChange}
                    className="block w-full p-4 min-h-[180px] prose prose-sm max-w-none focus:outline-none"
                    style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600 ml-1">{error}</p>}
        </div>
    );
};

export default MiniTextEditor;