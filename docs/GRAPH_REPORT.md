# Graph Report - .  (2026-06-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 488 nodes · 1095 edges · 27 communities (25 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5673e096`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 41 edges
2. `StorageAdapter` - 32 edges
3. `AppText()` - 24 edges
4. `lightColors` - 20 edges
5. `ThemeTokens` - 20 edges
6. `scripts` - 17 edges
7. `ColorPalette` - 15 edges
8. `AppSection()` - 11 edges
9. `useReduceMotion()` - 10 edges
10. `GalleryStack()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `TabsLayout()` --calls--> `useTheme()`  [EXTRACTED]
  app/(tabs)/_layout.tsx → src/theme/useTheme.ts
- `SettingsScreen()` --calls--> `useTheme()`  [EXTRACTED]
  app/(tabs)/settings.tsx → src/theme/useTheme.ts
- `SettingsScreen()` --calls--> `useA11y()`  [EXTRACTED]
  app/(tabs)/settings.tsx → src/a11y/useA11y.ts
- `Root()` --calls--> `buildPreHydrationBackgroundCss()`  [EXTRACTED]
  app/+html.tsx → src/theme/preHydrationTheme.ts
- `Invoke-CheckHealth()` --calls--> `Get-RepoRoot()`  [INFERRED]
  scripts/steps/CheckHealth.ps1 → scripts/steps/Common.ps1

## Import Cycles
- None detected.

## Communities (27 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (47): AppButtonProps, AppButtonSize, AppButtonVariant, ResolvedColors, SIZE_SPEC, styles, VARIANTS, AppCard() (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (39): AppErrorBoundaryState, DefaultErrorFallback(), ErrorFallbackProps, FallbackStyles, DEFAULT_EDGES, StorageAdapter, WebStorageLike, createWebStorage() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (47): Root(), ToneColors, VariantColors, VariantColors, makeStorage(), renderWithTheme(), ACCENT_SURFACES, ACCENTS (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (47): { defineConfig }, expoConfig, prettierConfig, reactNativeA11y, dependencies, expo, expo-constants, expo-font (+39 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (25): A11yContextValue, A11yProviderProps, announceForAccessibility(), AnnounceOptions, applyGlobalFontScaleCap(), applyTo(), CappableComponent, A11yRole (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (20): AppBadgeProps, AppBadgeTone, AppBadgeVariant, ResolvedBadge, SIZE_SPEC, TONES, SIZE_VARIANT, styles (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (14): Invoke-CheckHealth(), Get-Duration(), Get-RepoRoot(), Invoke-Tool(), New-StepResult(), Write-GateFail(), Write-GateHeader(), Write-GateLine() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (15): AppBackButtonProps, GLYPH_SIZE, LABEL_VARIANT, styles, AppIcon, AppIconButtonProps, AppIconButtonVariant, AppIconRenderProps (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (15): AppToast(), AppToastProps, TONE_STYLES, ToastAction, ToastContextValue, ToastOptions, ToastTone, styles (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (15): AppChip(), AppChipProps, AppChipSize, ChipColors, resolveColors(), SIZE_SPEC, styles, BaseGroupProps (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (17): scripts, android, build:dev, build:preview, build:prod, check, format, format:check (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (11): build, development, preview, production, cli, appVersionSource, version, developmentClient (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (6): createExampleStore(), defaultDeps, ExampleState, ExampleStoreDeps, StorageAdapter, useExampleStore

### Community 13 - "Community 13"
Cohesion: 0.31
Nodes (8): AppCardPadding, AppCardProps, AppCardVariant, BaseProps, PressableCardProps, StaticCardProps, makeStorage(), renderWithTheme()

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, strict, exclude, extends, include, @/*

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (3): RootLayout(), TabsLayout(), storage

### Community 16 - "Community 16"
Cohesion: 0.83
Nodes (3): Assert-Tooling(), Invoke-Expo(), Write-Banner()

## Knowledge Gaps
- **147 isolated node(s):** `storage`, `mockPush`, `METRICS`, `METRICS`, `SpyStorage` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `StorageAdapter` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 13`, `Community 15`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 13`, `Community 15`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `lightColors` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 13`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `storage`, `mockPush`, `METRICS` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06651017214397496 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0504828797190518 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0679563492063492 - nodes in this community are weakly interconnected._