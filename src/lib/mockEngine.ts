import type { UploadedFile, EngineResult, FileImpact, NewFileRecommendation } from '../types';

// Helper to extract meaningful keywords from the request
const extractKeywords = (request: string): string[] => {
  const stopWords = ['i', 'want', 'to', 'add', 'a', 'an', 'the', 'is', 'in', 'it', 'for', 'of', 'and', 'with', 'on', 'this', 'that', 'need'];
  const words = request.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  return words.filter(w => w.length > 2 && !stopWords.includes(w));
};

// Domain mappings to simulate AI understanding
const domainHints: Record<string, string[]> = {
  payment: ['api', 'backend', 'controller', 'route', 'service', 'stripe', 'checkout', 'server'],
  login: ['auth', 'user', 'session', 'middleware', 'passport', 'jwt', 'security'],
  auth: ['auth', 'user', 'session', 'middleware', 'jwt', 'security'],
  database: ['model', 'schema', 'db', 'migration', 'repository', 'entity'],
  ui: ['component', 'view', 'css', 'style', 'page', 'layout'],
};

// Basic knowledge dependencies: Feature X requires Feature Y to exist
const featureDependencies: Record<string, string[]> = {
  logout: ['login', 'auth', 'signin', 'authentication', 'session'],
  cart: ['product', 'item', 'inventory', 'shop'],
  checkout: ['cart', 'product', 'payment', 'order'],
  refund: ['payment', 'order', 'transaction', 'stripe'],
  password: ['login', 'auth', 'user', 'account'],
  profile: ['user', 'login', 'auth', 'account']
};

export const processImpactAnalysis = async (
  files: UploadedFile[],
  request: string
): Promise<EngineResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const fileImpacts: FileImpact[] = [];
  
  const keywords = extractKeywords(request);
  const reqLower = request.toLowerCase();
  
  // --- Dependency Check Heuristic ---
  // If the user asks for a feature that has prerequisites, check if they exist first.
  let missingPrerequisite = null;
  for (const [feature, prereqs] of Object.entries(featureDependencies)) {
    if (reqLower.includes(feature)) {
      // Check if ANY file contains ANY of the prerequisites
      const hasPrereq = files.some(file => {
        const nameAndContent = (file.name + ' ' + file.content).substring(0, 5000).toLowerCase();
        return prereqs.some(prereq => new RegExp(`\\b${prereq}\\b`, 'i').test(nameAndContent));
      });
      
      if (!hasPrereq) {
        missingPrerequisite = { feature, prereqs };
        break; // Stop checking, we found a missing dependency
      }
    }
  }

  if (missingPrerequisite) {
    return {
      overallSummary: `Dependency Error: Cannot implement "${request}" because required foundational systems are missing.`,
      explanation: `The Analysis Engine detected that you requested a **${missingPrerequisite.feature}** feature. However, based on our basic knowledge training, this requires an existing **${missingPrerequisite.prereqs.slice(0, 3).join(', ')}** system.\n\nA deep scan of your codebase found 0 traces of these prerequisites. You must implement the prerequisite systems before adding this feature.`,
      fileImpacts: [],
      newFiles: [
        {
          suggestedName: `src/features/${missingPrerequisite.prereqs[0]}/index.ts`,
          reason: `Foundational module required to support ${missingPrerequisite.feature}.`
        }
      ]
    };
  }
  // --- End Dependency Check ---

  // Expand keywords with domain hints to simulate deep understanding
  const expandedKeywords = [...keywords];
  keywords.forEach(kw => {
    Object.keys(domainHints).forEach(domain => {
      if (domain.includes(kw) || kw.includes(domain)) {
        expandedKeywords.push(...domainHints[domain]);
      }
    });
  });

  // Default to standard important files if no keywords matched
  if (expandedKeywords.length === 0) {
    expandedKeywords.push('api', 'app', 'main', 'config', 'index');
  }

  // Score each file to find the most relevant ones
  const scoredFiles = files.map(file => {
    let score = 0;
    const nameLower = file.name.toLowerCase();
    // Only check the first 5000 characters to prevent lagging on massive files like package-lock.json
    const sampleContent = file.content.substring(0, 5000).toLowerCase();

    expandedKeywords.forEach(kw => {
      // Use word boundaries to prevent 'border' from matching 'order'
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(nameLower)) score += 10;
      if (regex.test(sampleContent)) score += 1;
    });

    // Slight bump to common backend/frontend entry points to make it look realistic
    let defaultBonus = 0;
    if (nameLower.includes('api') || nameLower.includes('server') || nameLower.includes('route') || nameLower.includes('controller')) defaultBonus += 2;
    if (nameLower.includes('app') || nameLower.includes('main')) defaultBonus += 1;
    
    score += defaultBonus;

    return { file, score, baseScore: score - defaultBonus };
  });

  // Sort by score descending
  scoredFiles.sort((a, b) => b.score - a.score);

  // If the absolute highest score is just from default bonuses (baseScore is 0) and we didn't match the actual keywords,
  // it means this codebase has absolutely nothing to do with the requested feature.
  const highestBaseScore = scoredFiles[0]?.baseScore || 0;
  
  if (highestBaseScore === 0 && keywords.length > 0) {
    return {
      overallSummary: `Based on your request "${request}", we analyzed ${files.length} files but found NO existing infrastructure related to this.`,
      explanation: `The Analysis Engine extracted the keywords **[${keywords.join(', ')}]**, but a deep scan of your codebase returned 0 matches. It appears your current project does not support or have any foundational code for this feature (e.g., if you asked for "orders", there is no order logic in your app). You will need to build this entirely from scratch.`,
      fileImpacts: [],
      newFiles: [
        {
          suggestedName: `src/features/${keywords[0]}/index.ts`,
          reason: `Since no existing code handles this, you must create a new foundational module for ${keywords[0]}.`
        }
      ]
    };
  }

  // Pick a realistic number of files to modify
  const maxFilesToModify = Math.min(files.length, Math.floor(Math.random() * 3) + 3); // 3 to 5 files
  
  // Select the highest scoring files, fallback to some random ones if all scores are 0
  let selectedFiles = scoredFiles.slice(0, maxFilesToModify).map(sf => sf.file);

  selectedFiles.forEach((file) => {
    const lines = file.content.split('\n');
    const numLines = lines.length;
    
    // Find valid lines (not empty, not just braces)
    const validLineIndices: number[] = [];
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 2 && trimmed !== '}' && trimmed !== '{' && trimmed !== ');' && !trimmed.startsWith('//')) {
        validLineIndices.push(index + 1); // 1-indexed
      }
    });

    const impacts = [];
    const desiredImpactCount = Math.max(1, Math.floor(Math.random() * 3)); // 1 to 2 impacts
    const actualImpactCount = Math.min(desiredImpactCount, Math.max(1, validLineIndices.length));
    
    const pool = validLineIndices.length > 0 ? validLineIndices : Array.from({length: numLines}, (_, i) => i + 1);

    for (let i = 0; i < actualImpactCount; i++) {
      let poolIndex = Math.floor(Math.random() * pool.length);
      let lineNum = pool[poolIndex];
      
      let attempts = 0;
      while (impacts.some(imp => imp.lineNumber === lineNum) && attempts < 10) {
        poolIndex = Math.floor(Math.random() * pool.length);
        lineNum = pool[poolIndex];
        attempts++;
      }

      // Generate dynamic reasons based on the file type and request
      const isBackend = file.name.match(/api|server|route|controller|backend/i);
      const isUI = file.name.match(/tsx|jsx|css|html|component/i);
      const isConfig = file.name.match(/json|env|config|yaml/i);

      let dummyReasons = [
        `Integrate ${keywords[0] || 'requested'} logic into this section.`,
        `Update this function to support the new feature requirements.`,
      ];

      if (isBackend) {
        dummyReasons = [
          `Add a new API endpoint or middleware here to handle the ${keywords[0] || 'new'} request.`,
          `Implement validation and security checks for the incoming data.`,
          `Update the database query or ORM model to support the new data structure.`,
          `Handle the external service integration and ensure proper error catching.`,
        ];
      } else if (isUI) {
        dummyReasons = [
          `Update the state management here to handle the new ${keywords[0] || 'feature'} context.`,
          `Add a conditional render here to show the new UI elements.`,
          `Bind the new API endpoint to this component's event handler.`,
        ];
      } else if (isConfig) {
        dummyReasons = [
          `Modify this configuration to include the necessary API keys or environment variables.`,
          `Update the dependency list to include the required external libraries.`,
        ];
      }

      impacts.push({
        lineNumber: lineNum,
        reason: dummyReasons[Math.floor(Math.random() * dummyReasons.length)]
      });
    }

    impacts.sort((a, b) => a.lineNumber - b.lineNumber);

    fileImpacts.push({
      fileId: file.id,
      impacts
    });
  });

  const matchedDomains = keywords.length > 0 ? Object.keys(domainHints).filter(domain => 
    keywords.some(kw => domain.includes(kw) || kw.includes(domain))
  ) : ['core architecture'];

  const explanation = `
The Analysis Engine extracted the core keywords: **[${keywords.join(', ') || 'none'}]**. 
Based on our heuristics, these keywords map to the following architectural domains: **${matchedDomains.join(', ') || 'Standard Core'}**. 
We scanned your codebase and scored files based on keyword density in their names and contents. 
Files such as \`${selectedFiles[0]?.name.split('/').pop() || 'entry files'}\` scored highly because they match backend/frontend logic patterns required to fulfill this feature request.
`.trim();

  // Smart heuristic: if request contains 'add', 'new', 'page', 'create' we should recommend creating new files!
  const newFiles: NewFileRecommendation[] = [];
  if (reqLower.includes('new') || reqLower.includes('add') || reqLower.includes('create') || reqLower.includes('page')) {
    const mainFeature = keywords[0] || 'feature';
    
    // Suggest a Frontend component
    if (keywords.some(k => ['page', 'ui', 'view', 'frontend', 'screen'].includes(k))) {
      newFiles.push({
        suggestedName: `src/pages/${mainFeature.charAt(0).toUpperCase() + mainFeature.slice(1)}Page.tsx`,
        reason: `A new dedicated page component is required to render the ${mainFeature} interface to the user.`
      });
    } else {
      newFiles.push({
        suggestedName: `src/components/${mainFeature.charAt(0).toUpperCase() + mainFeature.slice(1)}/index.tsx`,
        reason: `A new modular component should be created to encapsulate the ${mainFeature} logic.`
      });
    }
    
    // Optionally suggest a backend file if domain maps to it
    if (matchedDomains.includes('payment') || matchedDomains.includes('database') || reqLower.includes('backend') || reqLower.includes('api')) {
      newFiles.push({
        suggestedName: `backend/routes/${mainFeature}_route.py`,
        reason: `A new API route handler is needed to process requests for the new ${mainFeature} functionality.`
      });
    }
  }

  return {
    overallSummary: `Based on your request "${request}", we have analyzed ${files.length} files. We identified ${fileImpacts.length} core files that require modifications, and recommend creating ${newFiles.length} new file(s) to implement this feature.`,
    explanation,
    fileImpacts,
    newFiles
  };
};
