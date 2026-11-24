# 이미지 제작 기록 · 2026-11-24

내장 이미지 생성 도구로 새로 만든 색연필화 2장을 프로젝트 자산으로 사용합니다. 외부 이미지 주소에 의존하지 않습니다. 원본 PNG는 생성 이미지 폴더에 보존하고, 게시용 WebP는 `assets/`에 저장했습니다. 소녀의 투명도를 유지했습니다.

## 배경 최종 프롬프트

Use case: illustration-story. Asset type: original background painting for an interactive pencil-drawn animation website named '바람이 머무는 오후'. Generate one exquisitely warm, hand-drawn colored-pencil landscape, wide horizontal composition approximately 3:2 or 16:9. A quiet spring afternoon with an old flowering cherry tree in a meadow. The main trunk is at 72% of the width and its roots at 83% height. Delicate asymmetrical branches reach across the upper right two-thirds, clusters of airy blush and dusty-rose cherry blossoms; do not create a dense wall of blossoms. A curving pale footpath crosses from bottom left into the far right distance, rolling sage hills, fine grasses and tiny daisies, warm ivory sky. LEFT THIRD upper half is almost empty warm cream paper/sky for later HTML typography, very sparse marks, no branches behind that text area. Clear space around the tree base near x68% y83% for a separately composited standing girl, no people in this image. Medium: unmistakable real colored pencil and soft graphite on visible fine warm cotton paper, layered hatching, broken pigment edges, expressive organic imperfect linework, subtle watercolor underpainting, sophisticated storybook animation background. A gentle warm cream + sage green + muted peach + dusty rose palette; atmospheric perspective, sunlit tenderness. Broad quietly detailed meadow extends fully to all image edges. No text, letters, logos, border, frame, watermark or UI. Not vector, not flat geometric forms, not 3D, not photorealistic, not oversaturated. Final image itself is only the painting.

출력: `assets/spring-landscape.webp` (1536 × 1024).

## 소녀 최종 프롬프트

배경 원본을 그림체 참고용으로 첨부했습니다.

Use case: illustration-story. Asset type: one transparent character layer for a moving colored-pencil storybook scene. The provided image is STYLE REFERENCE ONLY: match its warm natural colored-pencil hatching and graphite texture, its gentle sunlight and muted colors. Generate ONLY a full-body girl viewed from behind in a gentle three-quarter rear view looking up and right at cherry blossoms. She has long gently windblown dark chestnut hair flowing a little to the left, a modest muted sage-teal long-sleeved calf-length dress with soft folds, small brown leather shoes, ivory socks. One hand is slightly outstretched, fingers softly relaxed to catch a falling petal. The other arm hangs naturally. The pose is still and peaceful, feet firmly planted, anatomy carefully drawn. A small youthful figure with natural storybook proportions (about 6 heads high), NOT chibi. All hair, fingers, hem and both shoes fully visible, centered with 8% padding. Real colored pencil and graphite outlines, visible fine pigment and warm hatching; tender hand-drawn animation cel with naturally imperfect lines. Fair skin with subtle warm blush. Render actual transparent alpha background, isolated girl only, no landscape, no tree, no ground, no shadow plane, no petals, no frame, no text, no watermark. Do NOT reproduce the background reference. Not vector, not 3D, not photorealism. The transparent edges should preserve fine pencil strokes.

출력: `assets/spring-girl.webp` (700 × 1050, alpha).
