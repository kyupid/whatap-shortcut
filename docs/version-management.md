# 버전 관리 가이드

## 버전 규칙

```
MAJOR.MINOR.PATCH
1.0.0 → 1.0.1 (버그 수정)
1.0.1 → 1.1.0 (기능 추가)
1.1.0 → 2.0.0 (대규모 변경)
```

## 버전 업데이트 방법

```bash
# 1. manifest.json 수정
"version": "1.0.0"  →  "version": "1.0.1"

# 2. 커밋 & 태그
git add . && git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1 && git push origin main --tags

# 3. GitHub Release (선택)
gh release create v1.0.1 whatap-quick-nav.zip --title "v1.0.1"
```
