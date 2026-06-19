# ROUNZ

> “사용자의 쇼핑 여정을 구조화한 인터랙티브 웹 플랫폼”

---

## Live Demo
https://github.com/jang98dd/EST_2nd_project-DOMino

---

## 프로젝트 개요

ROUNZ는 상품 탐색 → 상세 확인 → 장바구니 → 분석/가상 피팅 → 로그인까지  
사용자의 전체 쇼핑 흐름을 하나의 웹 구조로 설계한 프로젝트입니다.

Vanilla JavaScript 기반으로 SPA 구조를 모사하며  
페이지 간 상태 흐름과 UI 컴포넌트 설계를 직접 구현했습니다.

---

## 페이지 구조

- Main Page
- Product List Page
- Product Detail Page
- Cart Page
- Analysis / Virtual Fitting Page
- Login / Sign-up Page

---

## 공통 컴포넌트

- Header (네비게이션 / 상태 표시)
- Footer (정보 영역)

 모든 페이지에서 재사용되도록 설계하여 코드 중복을 최소화했습니다.

---

## JavaScript 구조


 기능 단위로 분리하여 유지보수성과 확장성을 고려했습니다.

---

## 기술 스택

- HTML5 (Semantic Structure)
- CSS3 (Flex / Grid / Responsive Design)
- JavaScript (ES6+ Vanilla)
- LocalStorage (상태 유지)
- Git / GitHub (버전 관리)

---

## 핵심 기능

- 상품 필터링 및 정렬
- 상품 상세 정보 렌더링
- 장바구니 추가 / 삭제 / 유지
- 로그인 / 회원가입 UI 흐름
- 분석 / 가상 피팅 인터페이스
- 반응형 웹 구현

---

## 상태 관리 설계

- LocalStorage 기반 장바구니 상태 유지
- 페이지 간 데이터 흐름 구조 설계
- 모듈 단위로 상태 분리하여 관리

---

## 문제 해결 과정

- Grid / Flex 혼합 사용 시 깨짐 현상 수정
- Hover 시 dropdown width 변경 문제 해결
- LocalStorage sync 타이밍 오류 해결
- 모바일 / 태블릿 / 데스크탑 breakpoint 재설계

---

## 프로젝트 목표

- SPA 구조의 동작 방식 이해
- DOM 기반 상태 관리 경험
- 컴포넌트 구조 설계 능력 향상
- Git 기반 협업 흐름 경험

---

## 향후 개선 방향

- API 연동을 통한 데이터 구조 개선
- React / Vue 전환 고려
- Router 시스템 도입
- 디자인 시스템 구축
- 성능 최적화 및 리팩토링

---

## Team

| Name | Role | GitHub |
|------|------|--------|
| 강채희 | Header / Product / Detail / Fitting / Analysis | https://github.com/chae3110 |
| 장도담 | Main / Footer | https://github.com/jang98dd |
| 박채원 | Login / SignUp / Header | https://github.com/chaewon5205 |
| 조영빈 | Cart | https://github.com/JoYoungBin00 |
| 김태현 | Footer | https://github.com/flos0804 |

---

## 실행 방법

```bash
git clone https://github.com/jang98dd/EST_2nd_project-DOMino
cd ROUNZ
open index.html
