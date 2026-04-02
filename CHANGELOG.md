# Changelog

## [0.2.1](https://github.com/thisuxhq/sveltednd/compare/sveltednd-v0.2.0...sveltednd-v0.2.1) (2026-04-02)


### Bug Fixes

* skip husky in CI to prevent publish failure ([7f42b79](https://github.com/thisuxhq/sveltednd/commit/7f42b79648e506144ff8c0163ffad8ee79f163b9))

## [0.2.0](https://github.com/thisuxhq/sveltednd/compare/sveltednd-v0.1.2...sveltednd-v0.2.0) (2026-04-02)


### Features

* add conditional check example and update dependencies to version 0.0.17 ([d2e80a0](https://github.com/thisuxhq/sveltednd/commit/d2e80a08085dc337d169bfc1aa69ef5a0d4414bb))
* add custom dragstart event and improve drag enter/leave handling ([badc252](https://github.com/thisuxhq/sveltednd/commit/badc2526a8b2fd3973dc4dc0ed4b9ea047c22296))
* add drag handle support ([#20](https://github.com/thisuxhq/sveltednd/issues/20)) ([3371cec](https://github.com/thisuxhq/sveltednd/commit/3371ceca9505fe194d032b4b98e9fb3686a12e42))
* add interactive elements support to draggable functionality and update version to 0.0.17 ([2078147](https://github.com/thisuxhq/sveltednd/commit/2078147253533becad291d2fdbd9bee34d2e1df4))
* added ability to use custom classes ([25cfa65](https://github.com/thisuxhq/sveltednd/commit/25cfa65c827d6884cb4062b61ae2b631d0dbd46e))
* enhance drag and drop interface with custom classes and improved styles ([a1661b6](https://github.com/thisuxhq/sveltednd/commit/a1661b6b44213a77c507878997ed0dbc45b23889))
* implement dark mode with system preference and toggle ([1f9b2af](https://github.com/thisuxhq/sveltednd/commit/1f9b2affdaabf7a4b1be015e41f2ecbc1e5e3722))
* redesign website with Swiss Grid design system ([ee9619b](https://github.com/thisuxhq/sveltednd/commit/ee9619be68bf83d0f65bf903cb1f360acc045acc))
* update layout text and links for improved user engagement ([03eaeba](https://github.com/thisuxhq/sveltednd/commit/03eaebacc938ecfaf0eff5f34349b45fedb22980))
* update layout text for improved clarity and engagement ([26c0070](https://github.com/thisuxhq/sveltednd/commit/26c00707e677f61c63eaa648331073120d141544))
* update SvelteDnD dependency to version 0.0.18 and enhance layout with new GitHub and NPM links ([f490d52](https://github.com/thisuxhq/sveltednd/commit/f490d52ad7f85d44b718ea142a5efe50a65ff654))


### Bug Fixes

* add @eslint/js as explicit devDependency for CI compatibility ([c883425](https://github.com/thisuxhq/sveltednd/commit/c883425e4adcb04f6df90e45c58363e3fdfb8cce))
* align sidebar and header bottom borders ([8957604](https://github.com/thisuxhq/sveltednd/commit/895760488bb3eb6f88adfbc5510a821df51f02f5))
* bad enter/leave event order clearing drop target ([b84c888](https://github.com/thisuxhq/sveltednd/commit/b84c8887bb00d28b86d9738aaedc3391d639df23))
* constrain horizontal scroll to content area only ([c8d1095](https://github.com/thisuxhq/sveltednd/commit/c8d1095d5c1023992e2f2cbfae27cbf3b33c7fb9))
* downgrade vite to ^6.0.0 to resolve peer dependency conflict ([7a3138d](https://github.com/thisuxhq/sveltednd/commit/7a3138d945d3021b52b9baccc5325a53e5119f94))
* further adjust sidebar examples padding for perfect border alignment ([e128b3c](https://github.com/thisuxhq/sveltednd/commit/e128b3c4be63ee16fd507cd0edd50f707fed557c))
* handle pointercancel to reset stuck drag state on mobile ([3bc6f75](https://github.com/thisuxhq/sveltednd/commit/3bc6f751a84458ebef715f6c944bd1e9c2f79586))
* ignore pointercancel during HTML5 drag to preserve sourceContainer on desktop ([40b12a9](https://github.com/thisuxhq/sveltednd/commit/40b12a9c4973414c9a935dde0fecf6704e32339a)), closes [#35](https://github.com/thisuxhq/sveltednd/issues/35)
* improve draggable functionality and enhance drop handling in horizontal scroll ([82fdf1e](https://github.com/thisuxhq/sveltednd/commit/82fdf1edba46754ac7ec02f13efdcf86d25d111f))
* move theme toggle to far right edge ([3b70b66](https://github.com/thisuxhq/sveltednd/commit/3b70b6654f5f09cc84ed47cbdb31eff3d38cd466))
* move version next to app name in mobile header ([d9e458c](https://github.com/thisuxhq/sveltednd/commit/d9e458ca6364c89f2a6c966153cff21ec9325c16))
* pin Node.js to 22.13.0 for Cloudflare Pages builds ([a973039](https://github.com/thisuxhq/sveltednd/commit/a973039ee6b7da41581b5444509d2e9e9f881f83))
* prevent drag-over class from sticking when leaving a drop zone ([#22](https://github.com/thisuxhq/sveltednd/issues/22)) ([5dc587a](https://github.com/thisuxhq/sveltednd/commit/5dc587ad606033ede11024f6fad059b5c4c147f2))
* prevent entire page from scrolling horizontally ([1fce75e](https://github.com/thisuxhq/sveltednd/commit/1fce75ef61a451d5df731df0ec54d3741dc0b25b))
* prevent full-page horizontal scroll in horizontal-scroll demo ([1536900](https://github.com/thisuxhq/sveltednd/commit/1536900e97a8b8c852d2b4cabb6be47502b583b2))
* reduce sidebar examples padding to align borders ([7659a88](https://github.com/thisuxhq/sveltednd/commit/7659a88f9f4a279a19c650e3a2468a9d1cffaae0))
* remove arrow from call booking link text ([444dad9](https://github.com/thisuxhq/sveltednd/commit/444dad99c18a83d352ad7d529791154e097b60d5))
* remove bottom border from first sidebar item ([9bd78db](https://github.com/thisuxhq/sveltednd/commit/9bd78db217064d2a65fd5431aa58846ccb428099))
* remove dead pointer handlers and fix wasOver reset in handleGlobalDragEnd ([2173bc0](https://github.com/thisuxhq/sveltednd/commit/2173bc0ba5d1e3ea9802625104d3a5e8bc1013cd))
* remove examples text from sidebar ([b7ebdba](https://github.com/thisuxhq/sveltednd/commit/b7ebdbae905e660d2660a9fd31251be9cf9ac87f))
* remove extra border line from sidebar ([6e4389b](https://github.com/thisuxhq/sveltednd/commit/6e4389b57d7ab28991e600e662dc94c3172e644e))
* remove horizontal line from available for projects badge ([bc483af](https://github.com/thisuxhq/sveltednd/commit/bc483af6b4633e5409b52829bc75834e8f2db836))
* remove unnecessary rel attribute from call booking link ([db4d436](https://github.com/thisuxhq/sveltednd/commit/db4d436483bacfd805327d728cfb0a02749031fd))
* removing the classes from the container after not dragging over anymore ([bbb2460](https://github.com/thisuxhq/sveltednd/commit/bbb2460abf4cd8b0a48ef639ddb08de4283112b0))
* resolve all type-check errors ([ede05fb](https://github.com/thisuxhq/sveltednd/commit/ede05fbcd4a97c7695309d5ad1f94714155de3ba))
* resolve drop position lost before onDrop callback in HTML5 drag ([f77946c](https://github.com/thisuxhq/sveltednd/commit/f77946c40fa8fc4eb0715a3720bae492ad37fbba))
* resolve issues [#8](https://github.com/thisuxhq/sveltednd/issues/8), [#21](https://github.com/thisuxhq/sveltednd/issues/21), [#22](https://github.com/thisuxhq/sveltednd/issues/22) and add directional drop indicators ([ab7b798](https://github.com/thisuxhq/sveltednd/commit/ab7b7988d0eaeb359570b09d5506575e00285563))
* resolve multiple issues ([#28](https://github.com/thisuxhq/sveltednd/issues/28), [#12](https://github.com/thisuxhq/sveltednd/issues/12), [#22](https://github.com/thisuxhq/sveltednd/issues/22), [#21](https://github.com/thisuxhq/sveltednd/issues/21), [#16](https://github.com/thisuxhq/sveltednd/issues/16), [#26](https://github.com/thisuxhq/sveltednd/issues/26)) ([d6fda1e](https://github.com/thisuxhq/sveltednd/commit/d6fda1eaf5103bb9936bdf8fda8014011d1b55ed))
* resolve pre-existing lint errors surfaced by CI ([2d6a747](https://github.com/thisuxhq/sveltednd/commit/2d6a74799dfec9a04f8e8c2a31d88e35ad9154bb))
* support Vite 6 ([74b95bb](https://github.com/thisuxhq/sveltednd/commit/74b95bb87d0078379fecb95ba7972d16d5926a58))
* typo in droppable class name attribute ([76dd483](https://github.com/thisuxhq/sveltednd/commit/76dd483c9212bc1826a40c62b3b563d114b71a27))
* update build and publish scripts to use bun, add bun.lockb to .gitignore ([ddcab52](https://github.com/thisuxhq/sveltednd/commit/ddcab52972b3b5188732cbc4599184160a61d4fb))
* update GitHub and NPM links in layout for accuracy ([0ac7b2b](https://github.com/thisuxhq/sveltednd/commit/0ac7b2b77163482251480560f18f78d5fbb610f0))
* update GitHub link in layout to point to the correct repository ([f681968](https://github.com/thisuxhq/sveltednd/commit/f6819689a36c1a2e5e8e8fb58eb0547ccb007e3b))
* update npm version badge in README for improved display ([a7d9fbe](https://github.com/thisuxhq/sveltednd/commit/a7d9fbe80675390f719bd2e14bec78cd4b474b06))
* update README formatting and improve code readability ([61789c8](https://github.com/thisuxhq/sveltednd/commit/61789c8e8462313f9fc7adf64679db94bfff017d))
* upgrade vite to ^8.0.0 to resolve peer dependency conflict ([2d3ce7e](https://github.com/thisuxhq/sveltednd/commit/2d3ce7e05ecda33315e95c43fda50be9f8e18a52))
* use document pointermove + getBoundingClientRect for touch-compatible hover detection ([2e5b8ae](https://github.com/thisuxhq/sveltednd/commit/2e5b8aedecd593402d7dc167d3602c151f0ac615))
