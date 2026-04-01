import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { Copy, Check, Trash2, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

const DEFAULT_TEXT = `Background Information
You are a customer service representative (ID:500800) specializing in digital product repair services, responsible for handling all after-sales repair matters of customers' digital devices, including consultation, diagnosis, process introduction and guarantee explanation.

Rules
1. Maintain a courteous and professional tone throughout the conversation, ensuring a positive customer experience ; avoid jargon, explain technical terms simply.
2. Calm emotional customers first before proceeding; assist to the best of your ability.
3. Follow step-by-step process strictly; no key step skipping.
4. Conclude politely if the customer wants to end the conversation.
5. Refer to the FAQ for accuracy: Before responding to customer inquiries, consult the FAQ section to provide up-to-date and precise information. After answering, please go back to the original process and continue your conversation.
6. If the customer remains silent for a period, confirm whether they can hear you.

FAQ:
1. If the visitor asks if the repair will affect the device's official warranty, inform them that repairs at our authorized center won’t affect the original warranty (for in-warranty devices), while unauthorized repair/disassembly will void the warranty.
2. If the visitor asks how to track repair progress and the warranty period for replaced parts, inform them that real-time progress is available via official website, Mini Program or hotline (with SMS notifications), and replaced original parts have a 3-6 month warranty.

Formal Conversation Process
Step 1: Order Number Verification
Introduce yourself briefly, then request the customer to provide the order number, whenever the customer provided their order number, call function get_order_number.
1.1 If the function call is successful, proceed to step 2.
1.2 If the function call fails, or the customer refuses to provide their order number for any reason, please inform them that the repair service can’t be processed without a valid order number and conclude the conversation politely. 

Step 2: Confirm Product Purchase Time and Warranty Status
2.1 Ask the customer to provide the exact purchase time and inform them that they can confirm the exact date of purchase by checking the purchase documents or the device activation time. Then call collect_purchase_time function. 
2.1.1 If the function call is successful, proceed directly to Step 2.2.
2.1.2 If the function call fails, say:” We regret to inform you that your product is outside the official warranty period. Should you require repair services, relevant fees will apply (including inspection fees, parts costs, and labor charges). The specific repair process is as follows: upon receiving your device, we will first perform a comprehensive inspection, then issue you a detailed quotation, and proceed with the official repair only after you have confirmed the terms.” Then proceed step 3.
2.2 Ask the customer if they have kept the warranty documents (such as invoices, warranty cards, and purchase order screenshots) for warranty verification.
2.2.1 If yes, say:” Your purchased product is still covered under the official warranty period. If you need to have it repaired, simply submit your warranty certificate first, and then you will be eligible for free repair services or parts replacement upon inspection and confirmation.” Then proceed to step 3.
2.2.2 If no, say:” We regret to inform you that according to our current after-sales policy, free warranty service cannot be provided without valid warranty documents. Should you still wish to proceed with the repair, relevant fees will be incurred (including inspection fee, parts fee and labor fee). The repair process is straightforward: we’ll first inspect the device, then provide a quotation, and proceed with the repair only after your confirmation.” And proceed to step 3.

Step 3: Fault Information Collection & Preliminary Judgment
3.1 Confirm device type (mobile phone, computer, etc.), fault symptoms (unable to turn on, cracked screen, etc.) and occurrence scenario (sudden failure, post-drop/water exposure, etc.) all in one shot. Then proceed to Step 3.2.
3.2 Based on the fault symptoms and device type, provide a preliminary fault speculation (e.g., "If the device fails to power on and shows no response when charging, the issue may lie with the charging port or the battery."), and explain the repair priority corresponding to different faults (e.g., "A cracked screen is classified as an urgent repair and will be prioritized; software lag can be troubleshooted remotely first."). Then proceed to step 4.

Step 4: Device Data Backup Guidance
Inform the customer about the repair process and possible costs. Based on the information collected earlier, determine whether the customer’s device is within the warranty period or out of warranty. Then explain the process accordingly—follow 4.1 for in-warranty cases, and 4.2 for out-of-warranty ones. 
4.1 For devices under warranty, the customer should submit warranty documents, then we will do the inspection, and provide free repair or parts replacement. Explain possible fee types, such as inspection fee, parts fee and labor fee. Then proceed Step 5.
4.2 For devices out of warranty, we would do the inspection first and then give you a quotation. After your confirmation, we will proceed with the repair. Explain possible fee types, such as inspection fee, parts fee and labor fee. Then proceed Step 5.

Step 5: Confirm Device Delivery Method
Ask the customer about their preferred device delivery method, including self-drop-off at the service center, scheduled on-site pickup, or on-site repair service.
5.1 If the customer replies with one of the three options, call the record_delivery_method function (passing the customer’s ID and their selected delivery method as parameters), then proceed to Step 6.
5.2 If the customer states they are unsure at present, inform them: "We are unable to provide service for you if you cannot tell us your preferred delivery method." Then end the conversation politely.

Step 6: Repair Plan & Cost Notification
Inform the customer of the repair plan based on the diagnostic results. Diagnosis includes parts replacement (screen, battery, motherboard, etc.), system repair, hardware debugging, and other necessary procedures. Then, based on whether the customer’s product is still under warranty, specify the corresponding repair plan and explain the cost breakdown.
Plan 1 (If the product is still under warranty): Based on the information provided by the customer previously, the repair items include parts replacement (screen, battery, motherboard, etc.), system repair, hardware debugging, and other necessary procedures; the repair cost is covered by the warranty.
Plan 2 (If the product is out of warranty): Based on the information provided by the customer previously, the repair items include parts replacement (specify part model and unit price for each), system repair, hardware debugging, and other necessary procedures; the repair cost details: sum of the unit price of each replacement part plus the labor fee.
Recommend a repair plan based on the customer’s warranty status and ask the customer whether they accept the plan.
6.1 If the customer accepts the recommended plan, proceed to Step 7.
6.2 If the customer does not accept the recommended plan, explain that the plan is necessary for completing the repair and then ask again.
6.2.1 If the customer accepts, proceed to Step 7;
6.2.2 If the customer still does not accept, express understanding and end the conversation politely.

Step 7: Repair Cycle & Progress Query
7.1 Inform expected repair time (e.g., "1–2 working days for simple parts replacement; 3–5 days for complex motherboard repair"). Regardless of the customer’s respond, proceed to Step7.2.
7.2 Inform the customer that they can check the specific repair status via the after-sales interface on the purchase website, and we will also send SMS notifications to them each time the repair status is updated. Then proceed to Step 8.

Step 8: After-sales Guarantee & Closing
Confirm additional customer needs and questions: "Do you have any other questions about the repair process, fee standard, warranty commitment or service arrangement?"
8.1 If the customer has other questions, answer their questions one by one according to the above rules, then end the conversation politely.
8.2 If the customer doesn’t have other questions, end the conversation politely.`;

export default function App() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [toolsText, setToolsText] = useState('');
  const [activeTab, setActiveTab] = useState<'prompt' | 'tools'>('prompt');
  const [copied, setCopied] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    control: true,
    negative: true,
    'weak-negative': true,
    step: true,
    function: true,
    quote: true,
    logical: true
  });
  
  // YAML 高亮过滤器
  const [yamlFilters, setYamlFilters] = useState({
    'root-key': true,
    'framework-key': true,
    'custom-key': true,
    'data-type': true,
    'boolean': true,
    'description': true,
    'enum-value': true,
    'required-item': true,
    'number': true,
    'string': true,
  });
  
  // 折叠状态
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolsBackdropRef = useRef<HTMLDivElement>(null);
  const toolsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    textareaRef.current?.focus();
  };

  const toggleFilter = (type: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // 辅助函数：移除 # 和 * 符号
  const removeMarkdownSymbols = (text: string): string => {
    return text.replace(/[#*]/g, '');
  };

  // 统计大步骤数量（只匹配 "Step 数字:" 格式，不计算分支步骤）
  const countMainSteps = (text: string): number => {
    const cleanText = removeMarkdownSymbols(text);
    const lines = cleanText.split('\n');
    let count = 0;
    for (const line of lines) {
      // 匹配 "Step 1:", "Step 2:" 等大步骤，排除 "Step 1.1", "Step 2.1.3" 等分支
      if (/^Step\s+\d+[\s:.\-]/i.test(line.trim())) {
        count++;
      }
    }
    return count;
  };

  // 统计去重后的 functions，排除 {{{...}}} 内部的变量
  const countUniqueFunctions = (text: string): number => {
    const cleanText = removeMarkdownSymbols(text);
    // 先移除所有 {{{...}}} 变量块
    const textWithoutVars = cleanText.replace(/\{\{\{[\s\S]*?\}\}\}/g, '');
    // 匹配 snake_case 格式的 function（与 tokenizeInline 中的正则一致）
    const matches = textWithoutVars.match(/\b[a-zA-Z0-9]+_[a-zA-Z0-9_]+\b/g) || [];
    // 去重
    const uniqueSet = new Set(matches.map(m => m.trim()));
    return uniqueSet.size;
  };

  // 统计主流程中的 quotes（包括大步骤和分支步骤所在行）
  const countMainFlowQuotes = (text: string): number => {
    const cleanText = removeMarkdownSymbols(text);
    const lines = cleanText.split('\n');
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      // 检测主流程行：Step 标题、分支步骤行、或条件分支行
      // Step 标题: "Step 1:", "Step 2.1:"
      // 分支步骤: "1.1", "2.1.2"
      // 条件分支: "If the customer..."
      const isMainFlowLine = 
        /^Step\s+\d+(?:\.\d+)*[\s:.\-]/i.test(trimmed) || // Step 标题
        /^\d+(?:\.\d+)+[\s:.\-]/.test(trimmed) ||          // 分支步骤如 1.1, 2.1.2
        /^(If|When|Plan\s+\d+)/i.test(trimmed);            // 条件或计划说明

      if (isMainFlowLine) {
        // 匹配引号内容 "..." 或 "..." 或 "..."
        const quoteMatches = trimmed.match(/"[^"]*"|"[^"]*"|"[^"]*"/g) || [];
        count += quoteMatches.length;
      }
    }
    return count;
  };

  // 计算统计数据
  const stepCount = countMainSteps(text);
  const functionCount = countUniqueFunctions(text);
  const quoteCount = countMainFlowQuotes(text);

  // Shared tokenizer for both Editor and Preview
  const tokenizeInline = (line: string) => {
    const tokens = [];
    let lastIndex = 0;
    let match;
    const regex = /\b((?:go|jump|return|proceed|continue|move|follow)(?:[ \t]+[a-zA-Z]+){0,2}?)[ \t]+(Step ?\d+(?:\.\d+)*|\d+(?:\.\d+)+|Background Information|Role|Rules|FAQ|Standard Conversation Process|Formal Conversation Process)\b|\b(Do not|Must|Don't)\b|\b(Should|Might|May|Could not|Could|Can)\b|\b(Step ?\d+(?:\.\d+)*)\b|\b([a-zA-Z0-9]+_[a-zA-Z0-9_]+)\b|("[^"]*"|“[^”]*”|”[^”]*”)|\b(If|And|Or)\b/gi;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: line.slice(lastIndex, match.index) });
      }
      if (match[1] && match[2]) {
        tokens.push({ type: 'control', action: match[1], dest: match[2], content: match[0] });
      } else if (match[3]) {
        tokens.push({ type: 'negative', content: match[0] });
      } else if (match[4]) {
        tokens.push({ type: 'weak-negative', content: match[0] });
      } else if (match[5]) {
        tokens.push({ type: 'step', content: match[0] });
      } else if (match[6]) {
        tokens.push({ type: 'function', content: match[0] });
      } else if (match[7]) {
        tokens.push({ type: 'quote', content: match[0] });
      } else if (match[8]) {
        tokens.push({ type: 'logical', content: match[0] });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      tokens.push({ type: 'text', content: line.slice(lastIndex) });
    }
    return tokens;
  };

  const renderEditorText = () => {
    const tokens = tokenizeInline(text);
    return tokens.map((token, i) => {
      if (token.type === 'text' || (token.type !== 'text' && !activeFilters[token.type as keyof typeof activeFilters])) {
        return <span key={i} className="text-gray-800">{token.content}</span>;
      }
      if (token.type === 'control') return <span key={i} className="text-green-700 bg-green-100 rounded-sm">{token.content}</span>;
      if (token.type === 'negative') return <span key={i} className="text-red-600 bg-red-100 rounded-sm">{token.content}</span>;
      if (token.type === 'weak-negative') return <span key={i} className="text-red-400 bg-red-50 rounded-sm">{token.content}</span>;
      if (token.type === 'step') return <span key={i} className="text-green-600 bg-green-100 rounded-sm">{token.content}</span>;
      if (token.type === 'function') return <span key={i} className="text-indigo-700 bg-indigo-100 rounded-sm">{token.content}</span>;
      if (token.type === 'quote') return <span key={i} className="text-yellow-600">{token.content}</span>;
      if (token.type === 'logical') return <span key={i} className="text-purple-600 font-semibold">{token.content}</span>;
      return <span key={i} className="text-gray-800">{token.content}</span>;
    });
  };

  // ========================================
  // YAML Tokenizer for Tools Editor
  // ========================================
  
  // Framework keywords in YAML tools definition
  const FRAMEWORK_KEYWORDS = new Set([
    'description', 'parameters', 'properties', 'required', 'type', 'items', 
    'enum', 'default', 'minimum', 'maximum', 'minLength', 'maxLength',
    'pattern', 'format', 'additionalProperties', 'anyOf', 'allOf', 'oneOf',
    'title', 'example', 'examples', 'const', 'multipleOf', 'exclusiveMinimum',
    'exclusiveMaximum', 'minItems', 'maxItems', 'uniqueItems', 'minProperties',
    'maxProperties', '$ref', '$id', '$schema', 'definitions'
  ]);
  
  // Data type values
  const DATA_TYPES = new Set([
    'string', 'object', 'boolean', 'number', 'integer', 'array', 'null', 'any'
  ]);
  
  // Boolean values
  const BOOLEANS = new Set(['true', 'false']);
  
  // Get indentation level (number of leading spaces)
  const getIndentLevel = (line: string): number => {
    const match = line.match(/^( *)/);
    return match ? match[1].length : 0;
  };
  
  // Check if line is a root node (indent level 0 and has a key)
  const isRootNode = (lines: string[], lineIndex: number): boolean => {
    const line = lines[lineIndex];
    if (!line || line.trim() === '') return false;
    const indent = getIndentLevel(line);
    if (indent > 0) return false;
    // Has a key pattern (word followed by colon)
    return /^\s*\S+\s*:/.test(line);
  };
  
  // Tokenize a single YAML line (with context from parent key)
  const tokenizeYamlLine = (
    lines: string[], 
    lineIndex: number, 
    activeYamlFilters: typeof activeFilters,
    parentKeyContext?: { key: string; indent: number } // 父级键名上下文
  ) => {
    const line = lines[lineIndex];
    const tokens: Array<{ type: string; content: string }> = [];
    
    if (line.trim() === '') {
      return [{ type: 'empty', content: line }];
    }
    
    const indent = getIndentLevel(line);
    const content = line.slice(indent);
    let pos = 0;
    
    // Add indentation spaces (will be rendered with guide lines)
    if (indent > 0) {
      tokens.push({ type: 'indent', content: ' '.repeat(indent) });
    }
    
    // Empty after indent
    if (content.trim() === '') {
      return tokens;
    }
    
    // Check for list item (-)
    const isListItem = content.startsWith('- ');
    if (isListItem) {
      tokens.push({ type: 'list-marker', content: '- ' });
      pos = 2;
    }
    
    // Parse the rest of the line
    const remaining = content.slice(pos);
    
    // Key-value pattern
    const keyValueMatch = remaining.match(/^(\S+)(\s*)(:)(\s*)(.*)$/);
    if (keyValueMatch) {
      const [, key, spaceBeforeColon, colon, spaceAfterColon, value] = keyValueMatch;
      
      // Determine key type
      if (isRootNode(lines, lineIndex)) {
        tokens.push({ type: 'root-key', content: key });
      } else if (FRAMEWORK_KEYWORDS.has(key)) {
        tokens.push({ type: 'framework-key', content: key });
      } else {
        tokens.push({ type: 'custom-key', content: key });
      }
      
      // Add spacing and colon
      if (spaceBeforeColon) tokens.push({ type: 'text', content: spaceBeforeColon });
      tokens.push({ type: 'colon', content: colon });
      if (spaceAfterColon) tokens.push({ type: 'text', content: spaceAfterColon });
      
      // Parse value - check if this is a description key
      if (value) {
        if (key === 'description') {
          // description: 后面的值都是 description 类型
          tokens.push({ type: 'description', content: value });
        } else {
          const valueTokens = tokenizeYamlValue(value, activeYamlFilters);
          tokens.push(...valueTokens);
        }
      }
    } else if (isListItem) {
      // List item value - check if we're under 'enum' key
      if (parentKeyContext?.key === 'enum') {
        tokens.push({ type: 'enum-value', content: remaining });
      } else if (parentKeyContext?.key === 'required') {
        tokens.push({ type: 'required-item', content: remaining });
      } else {
        const valueTokens = tokenizeYamlValue(remaining, activeYamlFilters);
        tokens.push(...valueTokens);
      }
    } else {
      // No key-value pattern, just value
      if (remaining.trim()) {
        const valueTokens = tokenizeYamlValue(remaining, activeYamlFilters);
        tokens.push(...valueTokens);
      }
    }
    
    return tokens;
  };
  
  // Find parent key context for a given line
  const findParentKeyContext = (lines: string[], lineIndex: number): { key: string; indent: number } | undefined => {
    const currentIndent = getIndentLevel(lines[lineIndex]);
    
    // Search backwards for a line with less indent that has a key
    for (let i = lineIndex - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.trim() === '') continue;
      
      const indent = getIndentLevel(line);
      if (indent >= currentIndent) continue;
      
      // Check if this line has a key (not just a list item)
      const content = line.slice(indent);
      if (content.startsWith('- ')) continue;
      
      const keyMatch = content.match(/^(\S+)\s*:/);
      if (keyMatch) {
        return { key: keyMatch[1], indent };
      }
    }
    
    return undefined;
  };
  
  // Tokenize YAML value (inline value after colon)
  const tokenizeYamlValue = (value: string, activeYamlFilters: typeof activeFilters): Array<{ type: string; content: string }> => {
    const tokens: Array<{ type: string; content: string }> = [];
    const trimmed = value.trim();
    
    // Data type
    if (DATA_TYPES.has(trimmed)) {
      tokens.push({ type: 'data-type', content: value });
      return tokens;
    }
    
    // Boolean
    if (BOOLEANS.has(trimmed)) {
      tokens.push({ type: 'boolean', content: value });
      return tokens;
    }
    
    // Number (integer or float)
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      tokens.push({ type: 'number', content: value });
      return tokens;
    }
    
    // Quoted string or unquoted string
    tokens.push({ type: 'string', content: value });
    return tokens;
  };
  
  // Render YAML tokens with styling
  const renderYamlTokens = (tokens: Array<{ type: string; content: string }>, activeYamlFilters: typeof activeFilters) => {
    return tokens.map((token, i) => {
      if (!activeYamlFilters[token.type as keyof typeof activeYamlFilters]) {
        return <span key={i} className="text-gray-800">{token.content}</span>;
      }
      
      switch (token.type) {
        case 'indent':
          return <span key={i} className="text-gray-800">{token.content}</span>;
        case 'root-key':
          return <span key={i} className="text-indigo-600 font-semibold">{token.content}</span>;
        case 'framework-key':
          return <span key={i} className="text-cyan-600">{token.content}</span>;
        case 'custom-key':
          return <span key={i} className="text-blue-500">{token.content}</span>;
        case 'colon':
          return <span key={i} className="text-gray-400">{token.content}</span>;
        case 'data-type':
          return <span key={i} className="text-amber-500 font-medium">{token.content}</span>;
        case 'boolean':
          return <span key={i} className="text-pink-500 font-medium">{token.content}</span>;
        case 'description':
          return <span key={i} className="text-gray-500 italic">{token.content}</span>;
        case 'string':
          return <span key={i} className="text-emerald-600">{token.content}</span>;
        case 'number':
          return <span key={i} className="text-purple-500">{token.content}</span>;
        case 'list-marker':
          return <span key={i} className="text-gray-600">{token.content}</span>;
        case 'enum-value':
          return <span key={i} className="text-emerald-600 font-medium">{token.content}</span>;
        case 'required-item':
          return <span key={i} className="text-red-500 font-medium">{token.content}</span>;
        default:
          return <span key={i} className="text-gray-800">{token.content}</span>;
      }
    });
  };

  const scrollToDest = (destKey: string) => {
    let normalizedKey = destKey.toLowerCase();
    if (/^\d+(?:\.\d+)+$/.test(normalizedKey)) {
      normalizedKey = `step-${normalizedKey}`;
    } else if (normalizedKey.startsWith('step')) {
      normalizedKey = normalizedKey.replace(/^step\s*/, 'step-');
    }
    
    // Ensure consistent ID generation: replace spaces and dots with hyphens
    const id = `header-${normalizedKey.replace(/[\s.]+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a brief highlight flash to the destination header
      el.classList.add('bg-yellow-100', 'px-2', 'rounded-md');
      setTimeout(() => {
        el.classList.remove('bg-yellow-100', 'px-2', 'rounded-md');
      }, 1000);
    }
  };

  const renderPreview = () => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Lenient match: allows "Step 5", "Step 5:", "Step 5 - Check", etc., including sub-steps like "Step 2.1"
      const headerMatch = line.trim().match(/^(Background Information|Role|Rules|FAQ|Standard Conversation Process|Formal Conversation Process|Step ?\d+(?:\.\d+)*)(?:[\s:.\-].*)?$/i);
      if (headerMatch) {
        let destKey = headerMatch[1].toLowerCase();
        if (destKey.startsWith('step')) {
          destKey = destKey.replace(/^step\s*/, 'step-');
        }
        // Ensure consistent ID generation: replace spaces and dots with hyphens
        const id = `header-${destKey.replace(/[\s.]+/g, '-')}`;
        return (
          <div
            key={lineIndex}
            id={id}
            className="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2 transition-colors duration-500"
          >
            <div className="w-2 h-6 bg-indigo-500 rounded-full shrink-0"></div>
            <span>{line}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={lineIndex} className="h-4"></div>;
      }

      // Check if it's a sub-step paragraph (e.g., "1.1 ...", "2.1.2 ...")
      const subStepMatch = line.trim().match(/^(\d+(?:\.\d+)+)(?:[\s:.\-].*)?$/);
      let lineId = undefined;
      if (subStepMatch) {
        const destKey = `step-${subStepMatch[1]}`;
        lineId = `header-${destKey.replace(/[\s.]+/g, '-')}`;
      }

      const tokens = tokenizeInline(line);
      return (
        <div key={lineIndex} id={lineId} className={`mb-2 text-gray-800 leading-relaxed text-base ${lineId ? 'transition-colors duration-500' : ''}`}>
          {tokens.map((token, i) => {
            const key = `${lineIndex}-${i}`;
            if (token.type === 'text' || (token.type !== 'text' && !activeFilters[token.type as keyof typeof activeFilters])) {
              return <span key={key}>{token.content}</span>;
            }
            if (token.type === 'control') {
              const destKey = token.dest!.toLowerCase();
              return (
                <span
                  key={key}
                  onClick={() => scrollToDest(destKey)}
                  title={`Jump to ${token.dest}`}
                  className="text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mx-0.5 shadow-sm border border-green-200 cursor-pointer hover:bg-green-200 transition-colors"
                >
                  {token.content}
                  <ArrowRight className="w-3 h-3" />
                </span>
              );
            }
            if (token.type === 'negative') {
              return <span key={key} className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded mx-0.5 border border-red-100">{token.content}</span>;
            }
            if (token.type === 'weak-negative') {
              return <span key={key} className="text-red-400 font-semibold bg-red-50/50 px-1.5 py-0.5 rounded mx-0.5 border border-red-100/50">{token.content}</span>;
            }
            if (token.type === 'step') {
              return <span key={key} className="text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded mx-0.5 border border-green-100">{token.content}</span>;
            }
            if (token.type === 'function') {
              return <span key={key} className="text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded mx-0.5 border border-indigo-100">{token.content}</span>;
            }
            if (token.type === 'quote') {
              return <span key={key} className="text-yellow-600">{token.content}</span>;
            }
            if (token.type === 'logical') {
              return <span key={key} className="text-purple-600 font-semibold">{token.content}</span>;
            }
            return <span key={key}>{token.content}</span>;
          })}
        </div>
      );
    });
  };

  // Render YAML editor with syntax highlighting and indent guides
  const renderYamlEditor = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const indent = getIndentLevel(line);
      const indentLevel = Math.floor(indent / 2); // Assuming 2-space indent
      
      // Check if this line is a root node (potential collapsible section)
      const isRoot = isRootNode(lines, lineIndex);
      
      // Check if this section is collapsed
      const isCollapsed = collapsedSections.has(lineIndex);
      
      // Determine how many lines to skip if collapsed
      let skipUntil = -1;
      if (isCollapsed && isRoot) {
        // Find the next line at the same or lower indent level
        for (let i = lineIndex + 1; i < lines.length; i++) {
          const nextIndent = getIndentLevel(lines[i]);
          if (nextIndent <= indent && lines[i].trim() !== '') {
            skipUntil = i;
            break;
          }
        }
        if (skipUntil === -1) skipUntil = lines.length;
      }
      
      // Skip lines if within a collapsed section
      for (const collapsedStart of collapsedSections) {
        if (lineIndex > collapsedStart) {
          const collapsedIndent = getIndentLevel(lines[collapsedStart]);
          let endOfSection = lines.length;
          for (let i = collapsedStart + 1; i < lines.length; i++) {
            if (getIndentLevel(lines[i]) <= collapsedIndent && lines[i].trim() !== '') {
              endOfSection = i;
              break;
            }
          }
          if (lineIndex < endOfSection) {
            return null;
          }
        }
      }
      
      const parentContext = findParentKeyContext(lines, lineIndex);
      const tokens = tokenizeYamlLine(lines, lineIndex, yamlFilters, parentContext);
      
      // Build indent guide lines
      const indentGuides = [];
      for (let i = 0; i < indentLevel; i++) {
        indentGuides.push(
          <span 
            key={`guide-${i}`} 
            className="absolute w-px bg-gray-200" 
            style={{ 
              left: `${i * 2 + 1}ch`,
              top: 0,
              height: '100%'
            }}
          />
        );
      }
      
      return (
        <div 
          key={lineIndex} 
          className="relative"
          style={{ 
            display: 'flex',
            alignItems: 'flex-start',
            minHeight: '1.625em'
          }}
        >
          {/* Indent guides */}
          {indentGuides}
          
          {/* Collapse toggle for root nodes */}
          {isRoot && (
            <button
              className="absolute -left-4 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 z-20"
              onClick={() => {
                setCollapsedSections(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(lineIndex)) {
                    newSet.delete(lineIndex);
                  } else {
                    newSet.add(lineIndex);
                  }
                  return newSet;
                });
              }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
          
          {/* Line content */}
          <span className="relative z-10">
            {renderYamlTokens(tokens, yamlFilters)}
          </span>
        </div>
      );
    }).filter(Boolean);
  };

  const filterOptions = [
    { id: 'control', label: 'Flow Control', colorClass: 'bg-green-100 text-green-800' },
    { id: 'negative', label: 'Strong Negative', colorClass: 'bg-red-100 text-red-800' },
    { id: 'weak-negative', label: 'Weak Negative', colorClass: 'bg-red-50 text-red-600' },
    { id: 'step', label: `Steps: ${stepCount}`, colorClass: 'bg-green-100 text-green-800' },
    { id: 'function', label: `Functions: ${functionCount}`, colorClass: 'bg-indigo-100 text-indigo-800' },
    { id: 'quote', label: `Quotes: ${quoteCount}`, colorClass: 'bg-yellow-100 text-yellow-800' },
    { id: 'logical', label: 'Logical', colorClass: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 md:p-6 font-sans">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Prompt Viewer</h1>
            <p className="text-gray-500 text-sm mt-1">Edit on the left, view rich formatting and flow on the right.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'prompt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Prompt Editor
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tools Editor
          </button>
        </div>

        {/* Filter Bar - only show in Prompt Editor */}
        {activeTab === 'prompt' && (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <span className="text-sm font-semibold text-gray-600 mr-2">Highlight Filters:</span>
          {filterOptions.map(opt => {
            const isActive = activeFilters[opt.id as keyof typeof activeFilters];
            return (
              <button
                key={opt.id}
                onClick={() => toggleFilter(opt.id as keyof typeof activeFilters)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  isActive 
                    ? `${opt.colorClass} border-transparent` 
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-h-0">
          {activeTab === 'prompt' ? (
            // Prompt Editor: 双栏布局
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor Pane */}
              <div className="relative flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Raw Editor
                </div>
                <div className="relative flex-1 overflow-hidden">
                  <div 
                    ref={backdropRef}
                    className="absolute inset-0 p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-auto pointer-events-none"
                    aria-hidden="true"
                  >
                    {renderEditorText()}
                    {text.endsWith('\n') ? <br /> : null}
                  </div>
                  <textarea
                    ref={textareaRef}
                    className="absolute inset-0 w-full h-full p-6 font-mono text-sm leading-relaxed bg-transparent resize-none outline-none caret-black text-transparent selection:bg-indigo-200/50"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onScroll={handleScroll}
                    spellCheck="false"
                    placeholder="Paste your system prompt here..."
                  />
                </div>
              </div>

              {/* Preview Pane */}
              <div className="relative flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rich Preview & Flow
                </div>
                <div 
                  className="relative flex-1 overflow-y-auto p-8 bg-white scroll-smooth" 
                  ref={previewWrapperRef}
                >
                  {/* Rendered Content */}
                  <div className="relative z-20 max-w-3xl">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Tools Editor: YAML 高亮编辑器
            <div className="h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Tools Editor</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(toolsText);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setToolsText('')}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    title="Clear"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* YAML Filter Toggles */}
              <div className="flex flex-wrap gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs">
                <span className="text-gray-400 mr-2">Highlight:</span>
                {[
                  { key: 'root-key', label: 'Root Key', color: 'bg-indigo-100 text-indigo-600' },
                  { key: 'framework-key', label: 'Framework', color: 'bg-cyan-100 text-cyan-600' },
                  { key: 'custom-key', label: 'Custom Key', color: 'bg-blue-100 text-blue-500' },
                  { key: 'data-type', label: 'Type', color: 'bg-amber-100 text-amber-500' },
                  { key: 'boolean', label: 'Boolean', color: 'bg-pink-100 text-pink-500' },
                  { key: 'description', label: 'Description', color: 'bg-gray-200 text-gray-500' },
                  { key: 'enum-value', label: 'Enum', color: 'bg-emerald-100 text-emerald-600' },
                  { key: 'required-item', label: 'Required', color: 'bg-red-100 text-red-500' },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => setYamlFilters(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      yamlFilters[key as keyof typeof yamlFilters] ? color : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {/* Editor Area with Indent Guides */}
              <div className="flex-1 overflow-hidden relative">
                {/* Backdrop for syntax highlighting */}
                <div
                  ref={toolsBackdropRef}
                  className="absolute inset-0 overflow-auto pointer-events-none"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
                    fontSize: '14px',
                    lineHeight: '1.625',
                    padding: '24px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}
                >
                  {renderYamlEditor(toolsText)}
                </div>
                
                {/* Transparent textarea for editing */}
                <textarea
                  ref={toolsTextareaRef}
                  className="w-full h-full p-6 font-mono text-sm leading-relaxed resize-none outline-none relative z-10 bg-transparent text-transparent caret-gray-800"
                  value={toolsText}
                  onChange={(e) => setToolsText(e.target.value)}
                  onScroll={(e) => {
                    if (toolsBackdropRef.current) {
                      toolsBackdropRef.current.scrollTop = e.currentTarget.scrollTop;
                      toolsBackdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                  }}
                  spellCheck="false"
                  placeholder="Edit your tools here..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
