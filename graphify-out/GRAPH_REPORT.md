# Graph Report - .  (2026-06-12)

## Corpus Check
- 129 files · ~56,697 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 481 nodes · 822 edges · 22 communities (15 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Background Services|Background Services]]
- [[_COMMUNITY_UI Layout Components|UI Layout Components]]
- [[_COMMUNITY_View Components|View Components]]
- [[_COMMUNITY_UI Layout Components|UI Layout Components]]
- [[_COMMUNITY_Popup State & Hooks|Popup State & Hooks]]
- [[_COMMUNITY_UI Layout Components|UI Layout Components]]
- [[_COMMUNITY_View Components|View Components]]
- [[_COMMUNITY_View Components|View Components]]
- [[_COMMUNITY_Popup State & Hooks|Popup State & Hooks]]
- [[_COMMUNITY_Icon Components|Icon Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_View Components|View Components]]
- [[_COMMUNITY_View Components|View Components]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Core Libraries|Core Libraries]]
- [[_COMMUNITY_Core Libraries|Core Libraries]]
- [[_COMMUNITY_UI Layout Components|UI Layout Components]]
- [[_COMMUNITY_Popup State & Hooks|Popup State & Hooks]]
- [[_COMMUNITY_Conceptual Architecture|Conceptual Architecture]]
- [[_COMMUNITY_Conceptual Architecture|Conceptual Architecture]]
- [[_COMMUNITY_Documentation|Documentation]]

## God Nodes (most connected - your core abstractions)
1. `ListenersService` - 39 edges
2. `StorageService` - 16 edges
3. `NotificationsService` - 9 edges
4. `createDynamicIconSet()` - 8 edges
5. `createTranslator()` - 8 edges
6. `main()` - 7 edges
7. `resolveLanguage()` - 7 edges
8. `IconsService` - 7 edges
9. `sanitizeUserColorPresets()` - 6 edges
10. `summarizeServer()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ProxyXT README` --references--> `Automatic Failover System`  [EXTRACTED]
  README.md → src/services/listeners.service.js
- `ProxyXT README` --references--> `Browser Account Sync`  [EXTRACTED]
  README.md → src/services/listeners.service.js
- `Internationalization System` --references--> `i18n Message Definitions`  [EXTRACTED]
  src/lib/i18n.js → messages/en.yml
- `ProxyXT README` --references--> `Internationalization System`  [EXTRACTED]
  README.md → src/lib/i18n.js
- `Extension Manifest` --references--> `ProxyXT README`  [INFERRED]
  src/manifest.yml → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Failover Pipeline: Detection to Recovery** — concept_failover_system, listeners_listenersservice, services_notificationsservice, services_iconsservice, services_storageservice [INFERRED 0.85]
- **Background Service Layer Architecture** — services_storageservice, services_iconsservice, services_notificationsservice, listeners_listenersservice, concept_composition_root [EXTRACTED 1.00]
- **Popup UI Architecture** — hooks_useproxyapp, concept_popup_state_management, concept_ui_view_navigation, concept_i18n_system, concept_permission_flow [INFERRED 0.85]

## Communities (22 total, 7 thin omitted)

### Community 0 - "Background Services"
Cohesion: 0.06
Nodes (28): clearConnectionFailure(), createDynamicIconSet(), drawRoundedRect(), dynamicIconCache, generateId(), getCanvasContext(), getContrastingTextColor(), getLogContext() (+20 more)

### Community 1 - "UI Layout Components"
Cohesion: 0.06
Nodes (54): ColorField(), Control, Swatch, clamp(), COLOR_PRESETS, componentToHex(), FormView(), hsvToRgb() (+46 more)

### Community 2 - "View Components"
Cohesion: 0.05
Nodes (52): BanSymbolSvg(), CopySymbolSvg(), FilterSymbolSvg(), NewWindowSvg(), SadFaceSvg(), LOG_LEVELS, LogEntry(), serializeLogForClipboard() (+44 more)

### Community 3 - "UI Layout Components"
Cohesion: 0.07
Nodes (23): SquaredButton(), footerSlotStyles, headerSlotStyles, iconDefaultStyles, plusToggleStyles, sharedButtonStyles, StyledSquaredButton, StyledAppHeader (+15 more)

### Community 4 - "Popup State & Hooks"
Cohesion: 0.11
Nodes (27): Permission Request Flow, Popup State Management, UI View Navigation System, getBackgroundTranslator(), getLogMessage(), createTranslator(), dictionaries, getByPath() (+19 more)

### Community 5 - "UI Layout Components"
Cohesion: 0.10
Nodes (20): ActiveFooter(), getActiveFooterClassName(), StyledAppFooter, FooterActions(), connectionNoticeEnter, connectionNoticeExit, StyledFooterActions, StyledFooterConnectionBadge (+12 more)

### Community 6 - "View Components"
Cohesion: 0.10
Nodes (23): CheckboxField(), Control, LabelBadge, LabelText, Wrapper, Control, FieldFrame, Label (+15 more)

### Community 7 - "View Components"
Cohesion: 0.16
Nodes (20): getContrastingTextColor(), ServerRow(), cardEnter, driftOverlay, EmptyStateActionButton, EmptyStateDivider, EmptyStateForm, EmptyStateMessage (+12 more)

### Community 8 - "Popup State & Hooks"
Cohesion: 0.13
Nodes (14): AppFooter(), AppHeader(), useProxyApp(), ListView(), LogsView(), AppMain(), appReveal, StyledAppMain (+6 more)

### Community 9 - "Icon Components"
Cohesion: 0.15
Nodes (11): LanguageBadge(), BadgeFlag, BadgeText, StyledLanguageBadge, LanguageFlag(), FlagSvgDE(), FlagSvgES(), FlagSvgFR() (+3 more)

### Community 10 - "UI Components"
Cohesion: 0.12
Nodes (15): dependencies, goober, js-yaml, preact, styled-components, devDependencies, esbuild, name (+7 more)

### Community 12 - "View Components"
Cohesion: 0.29
Nodes (11): collectLeafPaths(), __dirname, extractPlaceholders(), __filename, formatList(), formatPlaceholderDiffs(), getByPath(), isPlainObject() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (9): __dirname, distDir, __filename, manifest, manifestTemplate, packageJson, root, srcDir (+1 more)

### Community 15 - "Core Libraries"
Cohesion: 0.25
Nodes (8): Automatic Failover System, Internationalization System, Dynamic Icon Management, Failover Notification System, Browser Account Sync, i18n Message Definitions, Extension Manifest, ProxyXT README

## Knowledge Gaps
- **93 isolated node(s):** `PreToolUse`, `name`, `version`, `private`, `type` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `resolveLanguage()` connect `Popup State & Hooks` to `Popup State & Hooks`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `name`, `version` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Background Services` be split into smaller, more focused modules?**
  _Cohesion score 0.05627705627705628 - nodes in this community are weakly interconnected._
- **Should `UI Layout Components` be split into smaller, more focused modules?**
  _Cohesion score 0.055191256830601096 - nodes in this community are weakly interconnected._
- **Should `View Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05493863237872589 - nodes in this community are weakly interconnected._
- **Should `UI Layout Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07307692307692308 - nodes in this community are weakly interconnected._
- **Should `Popup State & Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.11260504201680673 - nodes in this community are weakly interconnected._