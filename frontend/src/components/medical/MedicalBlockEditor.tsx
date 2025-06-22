"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Block,
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems
} from "@blocknote/core";
import { 
  BlockNoteViewRaw,
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Heart, 
  FileText, 
  Clock,
  User,
  Save,
  Eye,
  Sparkles
} from 'lucide-react';

interface MedicalBlockEditorProps {
  patient?: {
    id: string;
    full_name: string;
    age: number;
    gender: string;
  };
  initialContent?: Block[];
  onSave?: (content: Block[], soapData: SOAPData) => void;
  onPreview?: () => void;
  readOnly?: boolean;
  className?: string;
}

interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Use default schema for now
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs
  }
});

export function MedicalBlockEditor({
  patient,
  initialContent,
  onSave,
  onPreview,
  readOnly = false,
  className = ""
}: MedicalBlockEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Create BlockNote editor with simpler initial content
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent || [
      {
        type: "heading",
        content: patient ? `${patient.full_name} 様の診療記録` : "診療記録"
      },
      {
        type: "paragraph",
        content: `診療日: ${new Date().toLocaleDateString('ja-JP')}`
      },
      {
        type: "heading",
        content: "S - Subjective (主観的情報)"
      },
      {
        type: "paragraph",
        content: "患者の主訴、現病歴、症状の詳細など..."
      },
      {
        type: "heading", 
        content: "O - Objective (客観的情報)"
      },
      {
        type: "paragraph",
        content: "身体所見、検査結果、観察可能な事実..."
      },
      {
        type: "heading",
        content: "A - Assessment (評価)"
      },
      {
        type: "paragraph",
        content: "診断、病状の評価、鑑別診断..."
      },
      {
        type: "heading",
        content: "P - Plan (計画)"
      },
      {
        type: "paragraph",
        content: "治療計画、フォローアップ、追加検査..."
      }
    ]
  });

  // Extract SOAP data from editor content
  const extractSOAPData = useCallback((blocks: Block[]): SOAPData => {
    const soapData: SOAPData = {
      subjective: "",
      objective: "",
      assessment: "",
      plan: ""
    };

    let currentSection = "";
    let sectionContent: string[] = [];

    blocks.forEach((block: any) => {
      if (block.type === "heading") {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          const content = sectionContent.join(" ").trim();
          if (currentSection.includes("Subjective")) {
            soapData.subjective = content;
          } else if (currentSection.includes("Objective")) {
            soapData.objective = content;
          } else if (currentSection.includes("Assessment")) {
            soapData.assessment = content;
          } else if (currentSection.includes("Plan")) {
            soapData.plan = content;
          }
        }

        // Start new section
        const headingText = typeof block.content === 'string' 
          ? block.content 
          : "";
        currentSection = headingText;
        sectionContent = [];
      } else if (block.type === "paragraph" && currentSection) {
        const text = typeof block.content === 'string'
          ? block.content
          : "";
        if (text.trim()) {
          sectionContent.push(text);
        }
      }
    });

    // Save last section
    if (currentSection && sectionContent.length > 0) {
      const content = sectionContent.join(" ").trim();
      if (currentSection.includes("Subjective")) {
        soapData.subjective = content;
      } else if (currentSection.includes("Objective")) {
        soapData.objective = content;
      } else if (currentSection.includes("Assessment")) {
        soapData.assessment = content;
      } else if (currentSection.includes("Plan")) {
        soapData.plan = content;
      }
    }

    return soapData;
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      const blocks = editor.document;
      const soapData = extractSOAPData(blocks);
      
      await onSave(blocks, soapData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, extractSOAPData]);

  // Auto-save functionality
  React.useEffect(() => {
    if (readOnly || !onSave) return;

    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [handleSave, readOnly, onSave]);

  // Custom slash menu items for medical use
  const getCustomSlashMenuItems = () => [
    ...getDefaultReactSlashMenuItems(editor),
    {
      title: "SOAP構造",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "heading",
            content: "S - Subjective (主観的情報)",
            props: { level: 2 }
          },
          { type: "paragraph", content: "" },
          {
            type: "heading",
            content: "O - Objective (客観的情報)", 
            props: { level: 2 }
          },
          { type: "paragraph", content: "" },
          {
            type: "heading",
            content: "A - Assessment (評価)",
            props: { level: 2 }
          },
          { type: "paragraph", content: "" },
          {
            type: "heading",
            content: "P - Plan (計画)",
            props: { level: 2 }
          },
          { type: "paragraph", content: "" }
        ], editor.getTextCursorPosition().block);
      },
      aliases: ["soap", "構造", "診療"],
      group: "医療記録",
      icon: <Stethoscope className="w-4 h-4" />
    },
    {
      title: "バイタルサイン",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "heading",
            content: "バイタルサイン",
            props: { level: 3 }
          },
          {
            type: "paragraph",
            content: "血圧: ___/___mmHg, 心拍数: ___bpm, 体温: ___°C, SpO2: ___%"
          }
        ], editor.getTextCursorPosition().block);
      },
      aliases: ["vital", "バイタル", "生体"],
      group: "医療記録",
      icon: <Heart className="w-4 h-4" />
    },
    {
      title: "診断・治療計画",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "heading",
            content: "診断",
            props: { level: 3 }
          },
          { type: "paragraph", content: "1. " },
          {
            type: "heading", 
            content: "治療計画",
            props: { level: 3 }
          },
          { type: "paragraph", content: "1. " }
        ], editor.getTextCursorPosition().block);
      },
      aliases: ["diagnosis", "treatment", "診断", "治療"],
      group: "医療記録",
      icon: <FileText className="w-4 h-4" />
    }
  ];

  return (
    <div className={`medical-block-editor ${className}`}>
      {/* Header */}
      <Card className="glass-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass-accent flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-apple-blue" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-system-gray-900">
                  BlockNote医療記録エディタ
                </CardTitle>
                {patient && (
                  <div className="flex items-center gap-4 text-sm text-system-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {patient.full_name}
                    </div>
                    <span>{patient.age}歳 {patient.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {!readOnly && (
              <div className="flex items-center gap-3">
                {lastSaved && (
                  <div className="flex items-center gap-1 text-sm text-system-gray-500">
                    <Clock className="w-4 h-4" />
                    最終保存: {lastSaved.toLocaleTimeString('ja-JP')}
                  </div>
                )}
                
                {onPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreview}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    プレビュー
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  leftIcon={isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Editor */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="medical-editor-container">
            <BlockNoteViewRaw
              editor={editor}
              editable={!readOnly}
              className="min-h-[600px] p-6"
              theme="light"
              slashMenu={false}
            >
              <SuggestionMenuController
                triggerCharacter="/"
                getItems={async (query) =>
                  filterSuggestionItems(getCustomSlashMenuItems(), query)
                }
              />
            </BlockNoteViewRaw>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Integration Placeholder */}
      {!readOnly && (
        <Card className="glass-card mt-6 bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-800">AI記録支援</div>
                <div className="text-sm text-purple-600">
                  診断支援、薬物相互作用チェック、記録改善提案などのAI機能が利用可能です
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="ml-auto border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                AI支援を有効化
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom styles for BlockNote */}
      <style jsx>{`
        .medical-editor-container {
          --bn-color-editor-background: transparent;
          --bn-color-side-menu: rgb(107 114 128);
          --bn-color-outline: rgb(209 213 219);
          --bn-color-selected: rgb(59 130 246 / 0.1);
        }
        
        .medical-editor-container .ProseMirror {
          outline: none !important;
          padding: 1.5rem;
        }
        
        .medical-editor-container .ProseMirror h1 {
          color: rgb(17 24 39);
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .medical-editor-container .ProseMirror h2 {
          color: rgb(59 130 246);
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          border-left: 4px solid rgb(59 130 246);
          padding-left: 1rem;
        }
        
        .medical-editor-container .ProseMirror h3 {
          color: rgb(75 85 99);
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .medical-editor-container .ProseMirror p {
          color: rgb(55 65 81);
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
}