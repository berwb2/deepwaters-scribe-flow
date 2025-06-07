
export type DocumentType = 
  | 'plan' 
  | 'doctrine' 
  | 'strategy' 
  | 'report' 
  | 'memo' 
  | 'note' 
  | 'analysis' 
  | 'proposal' 
  | 'framework' 
  | 'guide' 
  | 'manifesto'
  | 'markdown';

export interface DocumentTypeDefinition {
  id: DocumentType;
  name: string;
  description: string;
  icon: string;
  template: string;
  color: string;
}

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  {
    id: 'plan',
    name: 'Plan',
    description: 'Strategic planning documents',
    icon: 'target',
    color: 'bg-blue-100 text-blue-800',
    template: `# Strategic Plan

## Executive Summary
Brief overview of the plan's objectives and key outcomes.

## Objectives
- Primary objective
- Secondary objectives
- Success metrics

## Analysis
Current situation analysis and strategic context.

## Implementation Strategy
Step-by-step implementation approach.

## Timeline
Key milestones and deadlines.

## Resources Required
Personnel, budget, and material requirements.

## Risk Assessment
Potential risks and mitigation strategies.

## Success Metrics
How success will be measured and tracked.`
  },
  {
    id: 'doctrine',
    name: 'Doctrine',
    description: 'Core principles and beliefs',
    icon: 'book-open',
    color: 'bg-purple-100 text-purple-800',
    template: `# Core Doctrine

## Fundamental Principles
Core beliefs and values that guide decisions.

## Philosophical Foundation
The underlying philosophy and worldview.

## Operational Guidelines
How these principles translate into daily practice.

## Decision Framework
How to apply these principles when making decisions.

## Examples and Applications
Real-world examples of doctrine in action.

## Evolution and Adaptation
How these principles may evolve over time.`
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'High-level strategic documents',
    icon: 'chess',
    color: 'bg-green-100 text-green-800',
    template: `# Strategic Document

## Strategic Vision
Long-term vision and aspirational goals.

## Current State Analysis
Assessment of current position and capabilities.

## Strategic Objectives
Key strategic goals and priorities.

## Competitive Analysis
Market positioning and competitive landscape.

## Strategic Initiatives
Major initiatives and programs.

## Resource Allocation
How resources will be deployed strategically.

## Success Metrics
Key performance indicators and success measures.`
  },
  {
    id: 'report',
    name: 'Report',
    description: 'Formal reports and analyses',
    icon: 'file-text',
    color: 'bg-gray-100 text-gray-800',
    template: `# Report Title

## Executive Summary
Key findings and recommendations.

## Introduction
Purpose, scope, and methodology.

## Findings
Detailed analysis and discoveries.

## Data Analysis
Statistical analysis and supporting data.

## Conclusions
Summary of key insights and implications.

## Recommendations
Actionable recommendations based on findings.

## Appendices
Supporting documentation and additional data.`
  },
  {
    id: 'memo',
    name: 'Memo',
    description: 'Internal communications',
    icon: 'mail',
    color: 'bg-yellow-100 text-yellow-800',
    template: `# Memorandum

**To:** [Recipients]
**From:** [Your Name]
**Date:** ${new Date().toLocaleDateString()}
**Subject:** [Memo Subject]

## Purpose
Brief statement of the memo's purpose.

## Background
Relevant context and background information.

## Key Points
- Main point 1
- Main point 2
- Main point 3

## Action Items
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

## Next Steps
What happens next and by when.`
  },
  {
    id: 'note',
    name: 'Note',
    description: 'Quick notes and thoughts',
    icon: 'sticky-note',
    color: 'bg-orange-100 text-orange-800',
    template: `# Quick Note

**Date:** ${new Date().toLocaleDateString()}

## Main Idea
Core concept or idea being captured.

## Details
Additional thoughts, observations, or details.

## Follow-up
- [ ] Actions to take
- [ ] Questions to explore
- [ ] People to contact

## References
Links, sources, or related materials.`
  },
  {
    id: 'analysis',
    name: 'Analysis',
    description: 'Detailed analytical documents',
    icon: 'bar-chart',
    color: 'bg-indigo-100 text-indigo-800',
    template: `# Analysis Document

## Overview
High-level summary of the analysis.

## Methodology
Approach and methods used for analysis.

## Data Sources
Information sources and data collection methods.

## Key Findings
Primary discoveries and insights.

## Trend Analysis
Patterns and trends identified.

## Implications
What the findings mean for the organization.

## Recommendations
Suggested actions based on analysis.

## Further Research
Areas requiring additional investigation.`
  },
  {
    id: 'proposal',
    name: 'Proposal',
    description: 'Project and initiative proposals',
    icon: 'lightbulb',
    color: 'bg-teal-100 text-teal-800',
    template: `# Project Proposal

## Project Overview
Brief description of the proposed project.

## Problem Statement
The problem or opportunity being addressed.

## Proposed Solution
Detailed description of the proposed solution.

## Benefits and Value
Expected benefits and value proposition.

## Implementation Plan
Detailed implementation approach and timeline.

## Resource Requirements
Budget, personnel, and other resource needs.

## Risk Assessment
Potential risks and mitigation strategies.

## Success Metrics
How success will be measured.

## Approval Process
Next steps for approval and implementation.`
  },
  {
    id: 'framework',
    name: 'Framework',
    description: 'Structured frameworks and methodologies',
    icon: 'grid',
    color: 'bg-pink-100 text-pink-800',
    template: `# Framework Document

## Framework Overview
Description of the framework and its purpose.

## Core Components
The main elements that make up this framework.

## Principles and Rules
Governing principles and operational rules.

## Implementation Guide
Step-by-step guide for applying the framework.

## Use Cases
Scenarios where this framework applies.

## Examples
Practical examples of framework application.

## Evaluation Criteria
How to assess framework effectiveness.

## Refinement Process
How the framework evolves and improves.`
  },
  {
    id: 'guide',
    name: 'Guide',
    description: 'How-to guides and tutorials',
    icon: 'compass',
    color: 'bg-cyan-100 text-cyan-800',
    template: `# Complete Guide

## Introduction
Overview of what this guide covers.

## Prerequisites
What you need to know before starting.

## Step-by-Step Instructions

### Step 1: [First Step]
Detailed instructions for the first step.

### Step 2: [Second Step]
Detailed instructions for the second step.

### Step 3: [Third Step]
Detailed instructions for the third step.

## Tips and Best Practices
Helpful tips for better results.

## Common Issues
Troubleshooting common problems.

## Advanced Techniques
More sophisticated approaches.

## Additional Resources
Further reading and related materials.`
  },
  {
    id: 'manifesto',
    name: 'Manifesto',
    description: 'Vision and mission statements',
    icon: 'flag',
    color: 'bg-red-100 text-red-800',
    template: `# Manifesto

## Our Vision
The future we're working to create.

## Our Mission
Our purpose and core reason for existence.

## Core Values
The fundamental values that guide our actions.

## Beliefs and Principles
What we believe and stand for.

## Our Commitment
What we pledge to do and deliver.

## Call to Action
How others can join our mission.

## Measure of Success
How we'll know we're achieving our vision.`
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'General markdown document',
    icon: 'file',
    color: 'bg-slate-100 text-slate-800',
    template: `# Document Title

Start writing your content here...`
  }
];

export const getDocumentTypeDefinition = (type: DocumentType): DocumentTypeDefinition => {
  return DOCUMENT_TYPES.find(t => t.id === type) || DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
};

export const getDocumentTypeTemplate = (type: DocumentType): string => {
  const definition = getDocumentTypeDefinition(type);
  return definition.template;
};
